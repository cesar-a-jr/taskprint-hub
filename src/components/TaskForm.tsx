import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Task } from '@/stores/taskStore';
import { Clock, Calendar, Zap, Home, Trash2, CheckCircle } from 'lucide-react';

interface TaskFormProps {
  task?: Task;
  onSubmit: (task: Omit<Task, 'id' | 'created_at' | 'updated_at'>) => void;
  onCancel: () => void;
}

export const TaskForm = ({ task, onSubmit, onCancel }: TaskFormProps) => {
  const [formData, setFormData] = useState({
    title: task?.title || '',
    description: task?.description || '',
    time: task?.time || '09:00',
    repeat_daily: task?.repeat_daily || false,
    days: task?.days || [],
    enabled: task?.enabled ?? true,
    category: task?.category || 'personal',
    zone: task?.zone || undefined,
    priority: task?.priority || 'medium',
    estimated_duration: task?.estimated_duration || 15
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.description.trim()) {
      alert('Título e descrição são obrigatórios');
      return;
    }

    onSubmit({
      ...formData,
      title: formData.title.trim(),
      description: formData.description.trim()
    });
  };

  const toggleDay = (day: number) => {
    setFormData(prev => ({
      ...prev,
      days: prev.days.includes(day)
        ? prev.days.filter(d => d !== day)
        : [...prev.days, day].sort()
    }));
  };

  const daysOfWeek = [
    { value: 0, label: 'Dom' },
    { value: 1, label: 'Seg' },
    { value: 2, label: 'Ter' },
    { value: 3, label: 'Qua' },
    { value: 4, label: 'Qui' },
    { value: 5, label: 'Sex' },
    { value: 6, label: 'Sáb' }
  ];

  const categories = [
    { value: 'morning', label: 'Manhã', icon: '🌅' },
    { value: 'evening', label: 'Noite', icon: '🌙' },
    { value: 'zone', label: 'Zona', icon: '🏠' },
    { value: 'decluttering', label: 'Organização', icon: '📦' },
    { value: 'personal', label: 'Pessoal', icon: '👤' }
  ];

  const priorities = [
    { value: 'low', label: 'Baixa', color: 'text-green-600' },
    { value: 'medium', label: 'Média', color: 'text-yellow-600' },
    { value: 'high', label: 'Alta', color: 'text-red-600' }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>{task ? 'Editar Tarefa' : 'Nova Tarefa'}</CardTitle>
        <CardDescription>
          {task ? 'Atualize os detalhes da tarefa' : 'Crie uma nova tarefa FlyLady'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Ex: Limpar bancada da cozinha"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Descreva detalhadamente a tarefa..."
                rows={3}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="time">
                  <Clock className="h-4 w-4 inline mr-1" />
                  Horário
                </Label>
                <Input
                  id="time"
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="estimated_duration">
                  <Calendar className="h-4 w-4 inline mr-1" />
                  Duração (min)
                </Label>
                <Input
                  id="estimated_duration"
                  type="number"
                  min="1"
                  max="120"
                  value={formData.estimated_duration}
                  onChange={(e) => setFormData(prev => ({ ...prev, estimated_duration: parseInt(e.target.value) }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">
                  <Zap className="h-4 w-4 inline mr-1" />
                  Categoria
                </Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, category: value as Task['category'] }))}
                >
                  <SelectTrigger id="category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.icon} {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">
                  <CheckCircle className="h-4 w-4 inline mr-1" />
                  Prioridade
                </Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value as Task['priority'] }))}
                >
                  <SelectTrigger id="priority">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {priorities.map(priority => (
                      <SelectItem key={priority.value} value={priority.value}>
                        <span className={priority.color}>{priority.label}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {formData.category === 'zone' && (
              <div className="space-y-2">
                <Label htmlFor="zone">
                  <Home className="h-4 w-4 inline mr-1" />
                  Zona da Casa (1-4)
                </Label>
                <Select
                  value={formData.zone?.toString()}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, zone: parseInt(value) }))}
                >
                  <SelectTrigger id="zone">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Zona 1 - Entrada/Sala</SelectItem>
                    <SelectItem value="2">Zona 2 - Cozinha</SelectItem>
                    <SelectItem value="3">Zona 3 - Banheiro/Área</SelectItem>
                    <SelectItem value="4">Zona 4 - Quarto Principal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="repeat_daily">Repetir diariamente</Label>
                <Switch
                  id="repeat_daily"
                  checked={formData.repeat_daily}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, repeat_daily: checked }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="enabled">Tarefa ativa</Label>
                <Switch
                  id="enabled"
                  checked={formData.enabled}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, enabled: checked }))}
                />
              </div>
            </div>

            {!formData.repeat_daily && (
              <div className="space-y-2">
                <Label>Dias da semana</Label>
                <div className="flex gap-2">
                  {daysOfWeek.map(day => (
                    <Button
                      key={day.value}
                      type="button"
                      variant={formData.days.includes(day.value) ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => toggleDay(day.value)}
                      className="px-3"
                    >
                      {day.label}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <Button type="submit" className="flex-1">
              {task ? 'Atualizar' : 'Criar'} Tarefa
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
