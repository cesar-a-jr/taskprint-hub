import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Calendar, Trash2, Edit, Printer } from "lucide-react";

interface Task {
  id: number;
  title: string;
  description: string;
  time: string;
  repeat_daily: boolean;
  days: number[];
  enabled: boolean;
}

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (id: number) => void;
  onPrint: (task: Task) => void;
}

const dayNames = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

export const TaskCard = ({ task, onEdit, onDelete, onPrint }: TaskCardProps) => {
  return (
    <Card className={`transition-all hover:shadow-md ${!task.enabled ? 'opacity-60' : ''}`}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="flex items-center gap-2">
              {task.title}
              {!task.enabled && <Badge variant="secondary">Desabilitada</Badge>}
            </CardTitle>
            <CardDescription>{task.description}</CardDescription>
          </div>
          <div className="flex gap-1">
            <Button
              size="icon"
              variant="ghost"
              onClick={() => onPrint(task)}
              title="Imprimir"
            >
              <Printer className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => onEdit(task)}
              title="Editar"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => onDelete(task.id)}
              title="Deletar"
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {task.time}
          </Badge>
          {task.repeat_daily ? (
            <Badge className="bg-accent">Diariamente</Badge>
          ) : (
            task.days.map((day) => (
              <Badge key={day} variant="secondary" className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {dayNames[day]}
              </Badge>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};
