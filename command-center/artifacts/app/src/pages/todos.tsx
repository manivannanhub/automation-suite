import { useState } from "react";
import { useListTodos, useCreateTodo, useUpdateTodo, useDeleteTodo, getListTodosQueryKey, getGetTodoStatsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash2, Plus, Loader2, Edit2, X, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

export default function Todos() {
  const { data: todos = [], isLoading } = useListTodos();
  const createTodoMutation = useCreateTodo();
  const updateTodoMutation = useUpdateTodo();
  const deleteTodoMutation = useDeleteTodo();
  const queryClient = useQueryClient();

  const [newTodo, setNewTodo] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editValue, setEditValue] = useState("");

  const refreshQueries = () => {
    queryClient.invalidateQueries({ queryKey: getListTodosQueryKey() });
    queryClient.invalidateQueries({ queryKey: getGetTodoStatsQueryKey() });
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodo.trim()) return;

    createTodoMutation.mutate(
      { data: { title: newTodo } },
      {
        onSuccess: () => {
          setNewTodo("");
          refreshQueries();
        },
      }
    );
  };

  const handleToggle = (id: number, completed: boolean) => {
    updateTodoMutation.mutate(
      { id, data: { completed } },
      { onSuccess: refreshQueries }
    );
  };

  const handleDelete = (id: number) => {
    deleteTodoMutation.mutate(
      { id },
      { onSuccess: refreshQueries }
    );
  };

  const startEdit = (id: number, title: string) => {
    setEditingId(id);
    setEditValue(title);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditValue("");
  };

  const saveEdit = (id: number) => {
    if (!editValue.trim() || editValue === todos.find(t => t.id === id)?.title) {
      cancelEdit();
      return;
    }
    
    updateTodoMutation.mutate(
      { id, data: { title: editValue } },
      {
        onSuccess: () => {
          cancelEdit();
          refreshQueries();
        },
      }
    );
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Todos</h1>
      </div>

      <form onSubmit={handleCreate} className="flex gap-2">
        <Input
          placeholder="What needs to be done?"
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          disabled={createTodoMutation.isPending}
          data-testid="input-new-todo"
          className="bg-card h-12 text-lg shadow-sm border-transparent focus-visible:border-primary focus-visible:ring-0"
        />
        <Button 
          type="submit" 
          size="lg"
          disabled={createTodoMutation.isPending}
          data-testid="button-add-todo"
        >
          {createTodoMutation.isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Plus className="h-5 w-5" />}
        </Button>
      </form>

      <div className="space-y-3">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="animate-pulse border-none shadow-sm">
              <CardContent className="p-4 h-16 flex items-center gap-3">
                <div className="h-5 w-5 bg-muted rounded-md" />
                <div className="h-4 w-1/2 bg-muted rounded" />
              </CardContent>
            </Card>
          ))
        ) : todos.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed rounded-xl border-muted">
            <p className="text-muted-foreground text-lg">No tasks yet. You're all caught up!</p>
          </div>
        ) : (
          todos.map((todo) => (
            <Card 
              key={todo.id} 
              className={cn(
                "border-none shadow-sm transition-all duration-200 group hover:shadow-md",
                todo.completed ? "bg-muted/30" : "bg-card"
              )}
              data-testid={`todo-item-${todo.id}`}
            >
              <CardContent className="p-4 flex items-center gap-4">
                <Checkbox
                  checked={todo.completed}
                  onCheckedChange={(checked) => handleToggle(todo.id, checked as boolean)}
                  data-testid={`checkbox-todo-${todo.id}`}
                  className="h-5 w-5 border-2 data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500 transition-colors"
                />
                
                {editingId === todo.id ? (
                  <div className="flex-1 flex items-center gap-2">
                    <Input
                      autoFocus
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') saveEdit(todo.id);
                        if (e.key === 'Escape') cancelEdit();
                      }}
                      className="h-8 py-1 px-2"
                      data-testid={`input-edit-todo-${todo.id}`}
                    />
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-green-500 hover:text-green-600" onClick={() => saveEdit(todo.id)}>
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground" onClick={cancelEdit}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col min-w-0">
                    <span 
                      className={cn(
                        "text-lg font-medium truncate transition-all duration-200",
                        todo.completed ? "line-through text-muted-foreground" : "text-foreground"
                      )}
                    >
                      {todo.title}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(todo.createdAt), "MMM d, yyyy")}
                    </span>
                  </div>
                )}

                {editingId !== todo.id && (
                  <div className="flex opacity-0 group-hover:opacity-100 transition-opacity gap-1">
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      className="h-8 w-8 text-muted-foreground hover:text-primary"
                      onClick={() => startEdit(todo.id, todo.title)}
                      data-testid={`button-edit-todo-${todo.id}`}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                      onClick={() => handleDelete(todo.id)}
                      data-testid={`button-delete-todo-${todo.id}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
