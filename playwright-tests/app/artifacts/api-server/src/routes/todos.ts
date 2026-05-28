import { Router } from "express";
import { db } from "@workspace/db";
import { todosTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { z } from "zod";

const router = Router();

function requireAuth(req: any, res: any, next: any) {
  if (!(req.session as any).userId) {
    return res.status(401).json({ error: "Not authenticated" });
  }
  next();
}

const todoInputSchema = z.object({
  title: z.string().min(1),
});

const todoUpdateSchema = z.object({
  title: z.string().min(1).optional(),
  completed: z.boolean().optional(),
});

router.get("/todos", requireAuth, async (req, res) => {
  const userId = (req.session as any).userId;
  const todos = await db.select().from(todosTable).where(eq(todosTable.userId, userId));
  return res.json(todos.map(t => ({
    id: t.id,
    title: t.title,
    completed: t.completed,
    createdAt: t.createdAt.toISOString(),
  })));
});

router.get("/todos/stats", requireAuth, async (req, res) => {
  const userId = (req.session as any).userId;
  const todos = await db.select().from(todosTable).where(eq(todosTable.userId, userId));
  const total = todos.length;
  const completed = todos.filter(t => t.completed).length;
  return res.json({ total, completed, pending: total - completed });
});

router.post("/todos", requireAuth, async (req, res) => {
  const userId = (req.session as any).userId;
  const parsed = todoInputSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid input" });
  }

  const [todo] = await db.insert(todosTable).values({
    userId,
    title: parsed.data.title,
    completed: false,
  }).returning();

  return res.status(201).json({
    id: todo.id,
    title: todo.title,
    completed: todo.completed,
    createdAt: todo.createdAt.toISOString(),
  });
});

router.put("/todos/:id", requireAuth, async (req, res) => {
  const userId = (req.session as any).userId;
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: "Invalid id" });

  const parsed = todoUpdateSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid input" });
  }

  const existing = await db.select().from(todosTable).where(and(eq(todosTable.id, id), eq(todosTable.userId, userId))).limit(1);
  if (!existing.length) return res.status(404).json({ error: "Todo not found" });

  const [todo] = await db.update(todosTable).set(parsed.data).where(and(eq(todosTable.id, id), eq(todosTable.userId, userId))).returning();

  return res.json({
    id: todo.id,
    title: todo.title,
    completed: todo.completed,
    createdAt: todo.createdAt.toISOString(),
  });
});

router.delete("/todos/:id", requireAuth, async (req, res) => {
  const userId = (req.session as any).userId;
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: "Invalid id" });

  const existing = await db.select().from(todosTable).where(and(eq(todosTable.id, id), eq(todosTable.userId, userId))).limit(1);
  if (!existing.length) return res.status(404).json({ error: "Todo not found" });

  await db.delete(todosTable).where(and(eq(todosTable.id, id), eq(todosTable.userId, userId)));
  return res.json({ message: "Deleted" });
});

export default router;
