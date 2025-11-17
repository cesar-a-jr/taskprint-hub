import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { TaskCard } from "@/components/TaskCard";
import { TaskForm } from "@/components/TaskForm";
import { Server, CheckCircle, XCircle, Printer, RefreshCw, Settings } from "lucide-react";

interface Task {
  id: number;
  title: string;
  description: string;
  time: string;
  repeat_daily: boolean;
  days: number[];
  enabled: boolean;
}

const Index = () => {
  const [baseUrl, setBaseUrl] = useState("http://localhost:3000");
  const [isServerOnline, setIsServerOnline] = useState<boolean | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [todayTasks, setTodayTasks] = useState<Task[]>([]);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);

  const checkHealth = async () => {
    try {
      const response = await fetch(`${baseUrl}/`);
      const data = await response.json();
      setIsServerOnline(true);
      toast({
        title: "Servidor Online",
        description: data.message,
      });
    } catch (error) {
      setIsServerOnline(false);
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
      
      let description = "Não foi possível conectar ao servidor. ";
      if (baseUrl.startsWith("http://") && window.location.protocol === "https:") {
        description += "⚠️ Você está tentando acessar HTTP de uma página HTTPS (Mixed Content bloqueado pelo navegador).";
      } else if (errorMessage.includes("CORS") || errorMessage.includes("access control")) {
        description += "⚠️ Erro de CORS. O servidor precisa ter os headers CORS configurados.";
      }
      
      toast({
        title: "Erro de Conexão",
        description,
        variant: "destructive",
      });
    }
  };

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${baseUrl}/tasks`);
      const data = await response.json();
      setTasks(data);
      toast({
        title: "Tarefas carregadas",
        description: `${data.length} tarefas encontradas`,
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível carregar as tarefas",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchTodayTasks = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${baseUrl}/tasks/today`);
      const data = await response.json();
      setTodayTasks(data);
      toast({
        title: "Tarefas do dia carregadas",
        description: `${data.length} tarefas para hoje`,
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível carregar as tarefas do dia",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createTask = async (taskData: Omit<Task, 'id'>) => {
    try {
      const response = await fetch(`${baseUrl}/task`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(taskData),
      });
      const data = await response.json();
      if (data.success) {
        toast({
          title: "Sucesso",
          description: "Tarefa criada com sucesso!",
        });
        setShowForm(false);
        fetchTasks();
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível criar a tarefa",
        variant: "destructive",
      });
    }
  };

  const updateTask = async (id: number, taskData: Partial<Task>) => {
    try {
      const response = await fetch(`${baseUrl}/task/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(taskData),
      });
      const data = await response.json();
      if (data.success) {
        toast({
          title: "Sucesso",
          description: "Tarefa atualizada com sucesso!",
        });
        setShowForm(false);
        setEditingTask(null);
        fetchTasks();
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a tarefa",
        variant: "destructive",
      });
    }
  };

  const deleteTask = async (id: number) => {
    if (!confirm("Tem certeza que deseja deletar esta tarefa?")) return;
    
    try {
      const response = await fetch(`${baseUrl}/task/${id}`, {
        method: "DELETE",
      });
      const data = await response.json();
      if (data.success) {
        toast({
          title: "Sucesso",
          description: "Tarefa deletada com sucesso!",
        });
        fetchTasks();
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível deletar a tarefa",
        variant: "destructive",
      });
    }
  };

  const printTask = async (task: Task) => {
    try {
      const response = await fetch(`${baseUrl}/print`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: task.title,
          description: task.description,
          time: task.time,
        }),
      });
      const data = await response.json();
      if (data.ok) {
        toast({
          title: "Impresso",
          description: "Tarefa enviada para impressão!",
        });
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível imprimir a tarefa",
        variant: "destructive",
      });
    }
  };

  const testPrint = async () => {
    try {
      const response = await fetch(`${baseUrl}/print/test`);
      const data = await response.json();
      if (data.ok) {
        toast({
          title: "Teste de impressão",
          description: data.message,
        });
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível testar a impressão",
        variant: "destructive",
      });
    }
  };

  const handleFormSubmit = (taskData: Omit<Task, 'id'>) => {
    if (editingTask) {
      updateTask(editingTask.id, taskData);
    } else {
      createTask(taskData);
    }
  };

  useEffect(() => {
    checkHealth();
    fetchTasks();
  }, [baseUrl]);

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/10 rounded-lg">
              <Server className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Sistema de Tarefas</h1>
              <p className="text-muted-foreground">Gerenciamento e impressão de tarefas</p>
            </div>
          </div>

          {/* API Config */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Configuração da API
              </CardTitle>
              <CardDescription>
                Configure a URL base do servidor de tarefas
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {window.location.protocol === "https:" && baseUrl.startsWith("http://") && (
                <div className="p-3 bg-warning/10 border border-warning/20 rounded-lg">
                  <div className="flex gap-2">
                    <span className="text-warning text-xl">⚠️</span>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium text-warning-foreground">
                        Aviso: Mixed Content
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Você está tentando acessar HTTP de uma página HTTPS. Isso será bloqueado pelo navegador.
                      </p>
                      <p className="text-xs font-medium mt-2">
                        Soluções:
                      </p>
                      <ul className="text-xs text-muted-foreground list-disc list-inside space-y-1">
                        <li>Para desenvolvimento: Teste localmente (localhost)</li>
                        <li>Para produção: Configure HTTPS no servidor</li>
                        <li>O servidor precisa ter CORS habilitado</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}
              <div className="flex gap-2">
                <div className="flex-1">
                  <Label htmlFor="baseUrl">URL Base da API</Label>
                  <Input
                    id="baseUrl"
                    value={baseUrl}
                    onChange={(e) => setBaseUrl(e.target.value)}
                    placeholder="http://localhost:3000"
                  />
                </div>
                <div className="flex items-end gap-2">
                  <Button onClick={checkHealth} variant="outline">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Testar
                  </Button>
                  {isServerOnline !== null && (
                    <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-secondary">
                      {isServerOnline ? (
                        <>
                          <CheckCircle className="h-4 w-4 text-success" />
                          <span className="text-sm font-medium">Online</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="h-4 w-4 text-destructive" />
                          <span className="text-sm font-medium">Offline</span>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="all" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">Todas</TabsTrigger>
            <TabsTrigger value="today">Hoje</TabsTrigger>
            <TabsTrigger value="new">Nova Tarefa</TabsTrigger>
            <TabsTrigger value="print">Impressão</TabsTrigger>
          </TabsList>

          {/* All Tasks Tab */}
          <TabsContent value="all" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">Todas as Tarefas</h2>
              <Button onClick={fetchTasks} disabled={loading}>
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Atualizar
              </Button>
            </div>
            {tasks.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  Nenhuma tarefa cadastrada ainda
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {tasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onEdit={(task) => {
                      setEditingTask(task);
                      setShowForm(true);
                    }}
                    onDelete={deleteTask}
                    onPrint={printTask}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          {/* Today Tasks Tab */}
          <TabsContent value="today" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">Tarefas de Hoje</h2>
              <Button onClick={fetchTodayTasks} disabled={loading}>
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Atualizar
              </Button>
            </div>
            {todayTasks.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  Nenhuma tarefa para hoje
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {todayTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onEdit={(task) => {
                      setEditingTask(task);
                      setShowForm(true);
                    }}
                    onDelete={deleteTask}
                    onPrint={printTask}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          {/* New Task Tab */}
          <TabsContent value="new" className="space-y-4">
            <TaskForm
              task={editingTask}
              onSubmit={handleFormSubmit}
              onCancel={() => {
                setShowForm(false);
                setEditingTask(null);
              }}
            />
          </TabsContent>

          {/* Print Tab */}
          <TabsContent value="print" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Printer className="h-5 w-5" />
                  Teste de Impressão
                </CardTitle>
                <CardDescription>
                  Envie um teste para a impressora para verificar se está funcionando
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={testPrint} className="w-full" variant="outline">
                  <Printer className="h-4 w-4 mr-2" />
                  Enviar Teste de Impressão
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
