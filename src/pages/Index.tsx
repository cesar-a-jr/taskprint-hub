import { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useTaskStore } from '@/stores/taskStore';
import { AuthForm } from '@/components/AuthForm';
import { TaskForm } from '@/components/TaskForm';
import { TaskCard } from '@/components/TaskCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { 
  Home, 
  Calendar, 
  Clock, 
  User, 
  LogOut, 
  Settings, 
  Plus,
  Printer,
  RotateCcw,
  Zap,
  Sun,
  Moon
} from 'lucide-react';

const Index = () => {
  const { user, logout, isAuthenticated } = useAuthStore();
  const { 
    tasks, 
    todayTasks, 
    settings, 
    loading, 
    fetchTasks, 
    fetchTodayTasks, 
    fetchSettings,
    createTask, 
    updateTask, 
    deleteTask,
    printTask,
    printTodayTasks
  } = useTaskStore();
  
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('today');

  useEffect(() => {
    if (isAuthenticated) {
      fetchTasks();
      fetchTodayTasks();
      fetchSettings();
    }
  }, [isAuthenticated]);

  const handleCreateTask = async (taskData: any) => {
    try {
      await createTask(taskData);
      setShowForm(false);
      toast({
        title: 'Sucesso',
        description: 'Tarefa criada com sucesso!',
      });
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao criar tarefa',
        variant: 'destructive',
      });
    }
  };

  const handleUpdateTask = async (taskData: any) => {
    try {
      await updateTask(editingTask.id, taskData);
      setShowForm(false);
      setEditingTask(null);
      toast({
        title: 'Sucesso',
        description: 'Tarefa atualizada com sucesso!',
      });
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao atualizar tarefa',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteTask = async (id: string) => {
    try {
      await deleteTask(id);
      toast({
        title: 'Sucesso',
        description: 'Tarefa deletada com sucesso!',
      });
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao deletar tarefa',
        variant: 'destructive',
      });
    }
  };

  const handlePrintTask = async (task: any) => {
    try {
      await printTask(task.id);
      toast({
        title: 'Sucesso',
        description: 'Tarefa enviada para impressão!',
      });
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao imprimir tarefa',
        variant: 'destructive',
      });
    }
  };

  const handlePrintTodayTasks = async () => {
    try {
      await printTodayTasks();
      toast({
        title: 'Sucesso',
        description: 'Tarefas de hoje enviadas para impressão!',
      });
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao imprimir tarefas de hoje',
        variant: 'destructive',
      });
    }
  };

  const getCurrentWeekZone = () => {
    const currentWeek = Math.floor(Date.now() / (7 * 24 * 60 * 60 * 1000));
    return (currentWeek % 4) + 1;
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
              <Home className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">FlyLady Task Manager</h1>
            <p className="text-gray-600">Organize sua casa com o método FlyLady</p>
          </div>
          <AuthForm />
        </div>
      </div>
    );
  }

  const currentZone = getCurrentWeekZone();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 bg-primary/10 rounded-lg">
                <Home className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">FlyLady Manager</h1>
                <p className="text-sm text-gray-500">Organização doméstica inteligente</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="hidden sm:flex">
                <Zap className="h-3 w-3 mr-1" />
                Zona {currentZone} da Semana
              </Badge>
              
              <div className="flex items-center gap-2">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                </div>
                <Button variant="ghost" size="sm" onClick={logout}>
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tarefas de Hoje</CardTitle>
              <Sun className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{todayTasks.length}</div>
              <p className="text-xs text-muted-foreground">
                {todayTasks.filter(t => t.category === 'morning').length} manhã • 
                {todayTasks.filter(t => t.category === 'evening').length} noite
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Zona Atual</CardTitle>
              <Home className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Zona {currentZone}</div>
              <p className="text-xs text-muted-foreground">
                {currentZone === 1 && 'Entrada/Sala'}
                {currentZone === 2 && 'Cozinha'}
                {currentZone === 3 && 'Banheiro/Área'}
                {currentZone === 4 && 'Quarto Principal'}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Tarefas</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{tasks.length}</div>
              <p className="text-xs text-muted-foreground">
                {tasks.filter(t => t.enabled).length} ativas • 
                {tasks.filter(t => !t.enabled).length} inativas
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="today">
              <Sun className="h-4 w-4 mr-2" />
              Hoje
            </TabsTrigger>
            <TabsTrigger value="all">
              <Calendar className="h-4 w-4 mr-2" />
              Todas
            </TabsTrigger>
            <TabsTrigger value="new">
              <Plus className="h-4 w-4 mr-2" />
              Nova
            </TabsTrigger>
            <TabsTrigger value="print">
              <Printer className="h-4 w-4 mr-2" />
              Imprimir
            </TabsTrigger>
          </TabsList>

          {/* Today Tasks Tab */}
          <TabsContent value="today" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">Tarefas de Hoje</h2>
              <div className="flex gap-2">
                <Button onClick={fetchTodayTasks} disabled={loading} variant="outline" size="sm">
                  <RotateCcw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  Atualizar
                </Button>
                <Button onClick={handlePrintTodayTasks} variant="outline" size="sm">
                  <Printer className="h-4 w-4 mr-2" />
                  Imprimir Todas
                </Button>
              </div>
            </div>
            
            {todayTasks.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  <Sun className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg mb-2">Nenhuma tarefa para hoje!</p>
                  <p className="text-sm">Parabéns! Aproveite seu dia organizado.</p>
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
                      setActiveTab('new');
                    }}
                    onDelete={handleDeleteTask}
                    onPrint={handlePrintTask}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          {/* All Tasks Tab */}
          <TabsContent value="all" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">Todas as Tarefas</h2>
              <Button onClick={fetchTasks} disabled={loading} variant="outline" size="sm">
                <RotateCcw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Atualizar
              </Button>
            </div>
            
            {tasks.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg mb-2">Nenhuma tarefa cadastrada</p>
                  <p className="text-sm">Comece criando sua primeira tarefa FlyLady!</p>
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
                      setActiveTab('new');
                    }}
                    onDelete={handleDeleteTask}
                    onPrint={handlePrintTask}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          {/* New Task Tab */}
          <TabsContent value="new" className="space-y-4">
            {showForm ? (
              <TaskForm
                task={editingTask}
                onSubmit={editingTask ? handleUpdateTask : handleCreateTask}
                onCancel={() => {
                  setShowForm(false);
                  setEditingTask(null);
                }}
              />
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Criar Nova Tarefa</CardTitle>
                  <CardDescription>
                    Adicione uma nova tarefa ao seu sistema FlyLady
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button onClick={() => setShowForm(true)} className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Criar Nova Tarefa
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Print Tab */}
          <TabsContent value="print" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Printer className="h-5 w-5" />
                  Impressão de Tarefas
                </CardTitle>
                <CardDescription>
                  Imprima suas tarefas FlyLady no formato térmico
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  onClick={handlePrintTodayTasks} 
                  className="w-full"
                  disabled={todayTasks.length === 0}
                >
                  <Printer className="h-4 w-4 mr-2" />
                  Imprimir Tarefas de Hoje ({todayTasks.length})
                </Button>
                
                <div className="text-sm text-muted-foreground text-center">
                  <p>Certifique-se de que sua impressora térmica esteja conectada.</p>
                  <p>As tarefas serão impressas automaticamente conforme o horário se aproxima.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
