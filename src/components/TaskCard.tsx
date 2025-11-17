import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Task } from '@/stores/taskStore';
import { Clock, Edit, Trash2, Printer, CheckCircle, Calendar, Home, Zap } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onPrint: (task: Task) => void;
}

export const TaskCard = ({ task, onEdit, onDelete, onPrint }: TaskCardProps) => {
  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
    }
  };

  const getCategoryIcon = (category: Task['category']) => {
    switch (category) {
      case 'morning': return '🌅';
      case 'evening': return '🌙';
      case 'zone': return '🏠';
      case 'decluttering': return '📦';
      case 'personal': return '👤';
    }
  };

  const getCategoryLabel = (category: Task['category']) => {
    switch (category) {
      case 'morning': return 'Manhã';
      case 'evening': return 'Noite';
      case 'zone': return 'Zona';
      case 'decluttering': return 'Organização';
      case 'personal': return 'Pessoal';
    }
  };

  const handleDelete = () => {
    if (confirm('Tem certeza que deseja deletar esta tarefa?')) {
      onDelete(task.id);
    }
  };

  const handlePrint = async () => {
    try {
      await onPrint(task);
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

  const isToday = () => {
    const today = new Date().getDay();
    return task.repeat_daily || task.days.includes(today);
  };

  return (
    <Card className={`${!task.enabled ? 'opacity-60' : ''} ${isToday() ? 'border-l-4 border-l-blue-500' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg flex items-center gap-2">
              <span>{getCategoryIcon(task.category)}</span>
              {task.title}
            </CardTitle>
            <CardDescription className="mt-1">
              {task.description}
            </CardDescription>
          </div>
          <div className="flex items-center gap-1">
            <Badge className={getPriorityColor(task.priority)}>
              {task.priority.toUpperCase()}
            </Badge>
            {!task.enabled && (
              <Badge variant="secondary">Inativa</Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {task.time}
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {task.estimated_duration}min
            </div>
            <div className="flex items-center gap-1">
              <Zap className="h-4 w-4" />
              {getCategoryLabel(task.category)}
            </div>
            {task.zone && (
              <div className="flex items-center gap-1">
                <Home className="h-4 w-4" />
                Zona {task.zone}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {task.repeat_daily ? (
              <Badge variant="outline">Diária</Badge>
            ) : (
              <Badge variant="outline">
                {task.days.length > 0 
                  ? task.days.map(day => ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'][day]).join(', ')
                  : 'Sem dias definidos'
                }
              </Badge>
            )}
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => onEdit(task)}
              className="flex-1"
            >
              <Edit className="h-4 w-4 mr-1" />
              Editar
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handlePrint}
              className="flex-1"
            >
              <Printer className="h-4 w-4 mr-1" />
              Imprimir
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={handleDelete}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
