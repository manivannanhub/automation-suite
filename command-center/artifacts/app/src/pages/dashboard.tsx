import { useGetMe, useGetTodoStats, getGetTodoStatsQueryKey, getListTodosQueryKey, useCreateTodo } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Circle, ListTodo, Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

export default function Dashboard() {
  const { data: user } = useGetMe();
  const { data: stats, isLoading: isStatsLoading } = useGetTodoStats();
  const [newTodo, setNewTodo] = useState("");
  const createTodoMutation = useCreateTodo();
  const queryClient = useQueryClient();

  const handleCreateTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodo.trim()) return;

    createTodoMutation.mutate(
      { data: { title: newTodo } },
      {
        onSuccess: () => {
          setNewTodo("");
          queryClient.invalidateQueries({ queryKey: getGetTodoStatsQueryKey() });
          queryClient.invalidateQueries({ queryKey: getListTodosQueryKey() });
        },
      }
    );
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-bold tracking-tight text-foreground" data-testid="text-welcome">
          Welcome back, {user?.name}
        </h1>
        <p className="text-muted-foreground text-lg">
          Here is your summary for today. Let's get things done.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border-none shadow-md bg-gradient-to-br from-card to-card/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Tasks</CardTitle>
            <ListTodo className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            {isStatsLoading ? (
              <div className="h-8 w-16 bg-muted animate-pulse rounded" />
            ) : (
              <div className="text-3xl font-bold" data-testid="stat-total">{stats?.total || 0}</div>
            )}
          </CardContent>
        </Card>

        <Card className="border-none shadow-md bg-gradient-to-br from-card to-card/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Completed</CardTitle>
            <CheckCircle2 className="h-5 w-5 text-green-500" />
          </CardHeader>
          <CardContent>
            {isStatsLoading ? (
              <div className="h-8 w-16 bg-muted animate-pulse rounded" />
            ) : (
              <div className="text-3xl font-bold" data-testid="stat-completed">{stats?.completed || 0}</div>
            )}
          </CardContent>
        </Card>

        <Card className="border-none shadow-md bg-gradient-to-br from-card to-card/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle>
            <Circle className="h-5 w-5 text-amber-500" />
          </CardHeader>
          <CardContent>
            {isStatsLoading ? (
              <div className="h-8 w-16 bg-muted animate-pulse rounded" />
            ) : (
              <div className="text-3xl font-bold" data-testid="stat-pending">{stats?.pending || 0}</div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-md max-w-xl">
        <CardHeader>
          <CardTitle>Quick Add Todo</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateTodo} className="flex gap-2">
            <Input
              placeholder="What needs to be done?"
              value={newTodo}
              onChange={(e) => setNewTodo(e.target.value)}
              disabled={createTodoMutation.isPending}
              data-testid="input-quick-todo"
              className="flex-1 bg-muted/50 border-transparent focus-visible:bg-background"
            />
            <Button 
              type="submit" 
              disabled={!newTodo.trim() || createTodoMutation.isPending}
              data-testid="button-quick-add-todo"
            >
              {createTodoMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Add
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
