import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface Task {
  id?: number;
  title: string;
  description: string;
  time: string;
  repeat_daily: boolean;
  days: number[];
  enabled: boolean;
}

interface TaskFormProps {
  task?: Task | null;
  onSubmit: (task: Omit<Task, 'id'>) => void;
  onCancel: () => void;
}

const dayNames = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];

export const TaskForm = ({ task, onSubmit, onCancel }: TaskFormProps) => {
  const [formData, setFormData] = useState<Omit<Task, 'id'>>({
    title: "",
    description: "",
    time: "",
    repeat_daily: false,
    days: [],
    enabled: true,
  });

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title,
        description: task.description,
        time: task.time,
        repeat_daily: task.repeat_daily,
        days: task.days,
        enabled: task.enabled,
      });
    }
  }, [task]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const toggleDay = (day: number) => {
    setFormData((prev) => ({
      ...prev,
      days: prev.days.includes(day)
        ? prev.days.filter((d) => d !== day)
        : [...prev.days, day],
    }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{task ? "Editar Tarefa" : "Nova Tarefa"}</CardTitle>
        <CardDescription>
          Preencha os campos abaixo para {task ? "atualizar" : "criar"} uma tarefa
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="time">Horário (HH:mm) *</Label>
            <Input
              id="time"
              type="time"
              value={formData.time}
              onChange={(e) => setFormData({ ...formData, time: e.target.value })}
              required
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="repeat_daily"
              checked={formData.repeat_daily}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, repeat_daily: checked, days: checked ? [] : formData.days })
              }
            />
            <Label htmlFor="repeat_daily">Repetir diariamente</Label>
          </div>

          {!formData.repeat_daily && (
            <div className="space-y-2">
              <Label>Dias da semana *</Label>
              <div className="grid grid-cols-2 gap-2">
                {dayNames.map((day, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Checkbox
                      id={`day-${index}`}
                      checked={formData.days.includes(index)}
                      onCheckedChange={() => toggleDay(index)}
                    />
                    <Label htmlFor={`day-${index}`} className="cursor-pointer">
                      {day}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center space-x-2">
            <Switch
              id="enabled"
              checked={formData.enabled}
              onCheckedChange={(checked) => setFormData({ ...formData, enabled: checked })}
            />
            <Label htmlFor="enabled">Tarefa habilitada</Label>
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" className="flex-1">
              {task ? "Atualizar" : "Criar"} Tarefa
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
