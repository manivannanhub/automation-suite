import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import express from "express";
import session from "express-session";
import { z } from "zod";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT ?? 3005);
const staticDir = path.join(__dirname, "artifacts", "app", "dist", "public");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    secret: process.env.SESSION_SECRET ?? "command-center-local-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    },
  }),
);

const db = {
  users: [],
  todos: [],
  contacts: [],
  products: [
    {
      id: 1,
      name: "Wireless Keyboard",
      price: 7999,
      category: "Hardware",
      description: "Low-profile wireless input for focused command work.",
    },
    {
      id: 2,
      name: "Wireless Mouse",
      price: 4999,
      category: "Hardware",
      description: "Responsive pointer with multi-device pairing.",
    },
    {
      id: 3,
      name: "Command Console",
      price: 12999,
      category: "Hardware",
      description: "A compact control surface for daily operations.",
    },
    {
      id: 4,
      name: "Signal Desk",
      price: 8999,
      category: "Software",
      description: "Team dashboard tooling with alerts and shared notes.",
    },
  ],
  nextUserId: 1,
  nextTodoId: 1,
  nextContactId: 1,
};

const registerSchema = z.object({
  name: z.string().trim().min(1),
  email: z.string().trim().email().transform((value) => value.toLowerCase()),
  password: z.string().min(6),
});

const loginSchema = z.object({
  email: z.string().trim().email().transform((value) => value.toLowerCase()),
  password: z.string().min(1),
});

const todoInputSchema = z.object({
  title: z.string().trim().min(1),
});

const todoUpdateSchema = z
  .object({
    title: z.string().trim().min(1).optional(),
    completed: z.boolean().optional(),
  })
  .refine((value) => value.title !== undefined || value.completed !== undefined, {
    message: "Provide at least one todo field to update.",
  });

const contactSchema = z.object({
  name: z.string().trim().min(1),
  email: z.string().trim().email(),
  message: z.string().trim().min(10),
});

function hashPassword(password) {
  return crypto.createHash("sha256").update(password).digest("hex");
}

function publicUser(user) {
  return { id: user.id, name: user.name, email: user.email };
}

function requireAuth(req, res, next) {
  if (!req.session.userId) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }
  next();
}

function parseId(value) {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

function sendValidationError(res, error, fallback = "Invalid input") {
  const message = error.issues?.[0]?.message ?? fallback;
  res.status(400).json({ error: message });
}

app.get("/api/healthz", (_req, res) => {
  res.json({ status: "ok" });
});

app.post("/api/auth/register", (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    sendValidationError(res, parsed.error);
    return;
  }

  const existingUser = db.users.find((user) => user.email === parsed.data.email);
  if (existingUser) {
    res.status(409).json({ error: "Email already in use" });
    return;
  }

  const user = {
    id: db.nextUserId++,
    name: parsed.data.name,
    email: parsed.data.email,
    password: hashPassword(parsed.data.password),
    createdAt: new Date().toISOString(),
  };

  db.users.push(user);
  req.session.userId = user.id;
  res.status(201).json({ user: publicUser(user), message: "Registered successfully" });
});

app.post("/api/auth/login", (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    sendValidationError(res, parsed.error);
    return;
  }

  const user = db.users.find((candidate) => candidate.email === parsed.data.email);
  if (!user || user.password !== hashPassword(parsed.data.password)) {
    res.status(401).json({ error: "Invalid email or password" });
    return;
  }

  req.session.userId = user.id;
  res.json({ user: publicUser(user), message: "Logged in successfully" });
});

app.post("/api/auth/logout", (req, res) => {
  req.session.destroy(() => {
    res.json({ message: "Logged out successfully" });
  });
});

app.get("/api/auth/me", requireAuth, (req, res) => {
  const user = db.users.find((candidate) => candidate.id === req.session.userId);
  if (!user) {
    res.status(401).json({ error: "User not found" });
    return;
  }

  res.json(publicUser(user));
});

app.get("/api/todos", requireAuth, (req, res) => {
  const todos = db.todos
    .filter((todo) => todo.userId === req.session.userId)
    .map(({ userId: _userId, ...todo }) => todo);
  res.json(todos);
});

app.get("/api/todos/stats", requireAuth, (req, res) => {
  const todos = db.todos.filter((todo) => todo.userId === req.session.userId);
  const total = todos.length;
  const completed = todos.filter((todo) => todo.completed).length;
  res.json({ total, completed, pending: total - completed });
});

app.post("/api/todos", requireAuth, (req, res) => {
  const parsed = todoInputSchema.safeParse(req.body);
  if (!parsed.success) {
    sendValidationError(res, parsed.error);
    return;
  }

  const todo = {
    id: db.nextTodoId++,
    userId: req.session.userId,
    title: parsed.data.title,
    completed: false,
    createdAt: new Date().toISOString(),
  };

  db.todos.push(todo);
  const { userId: _userId, ...payload } = todo;
  res.status(201).json(payload);
});

app.put("/api/todos/:id", requireAuth, (req, res) => {
  const id = parseId(req.params.id);
  if (!id) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const parsed = todoUpdateSchema.safeParse(req.body);
  if (!parsed.success) {
    sendValidationError(res, parsed.error);
    return;
  }

  const todo = db.todos.find(
    (candidate) => candidate.id === id && candidate.userId === req.session.userId,
  );
  if (!todo) {
    res.status(404).json({ error: "Todo not found" });
    return;
  }

  Object.assign(todo, parsed.data);
  const { userId: _userId, ...payload } = todo;
  res.json(payload);
});

app.delete("/api/todos/:id", requireAuth, (req, res) => {
  const id = parseId(req.params.id);
  if (!id) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  const index = db.todos.findIndex(
    (candidate) => candidate.id === id && candidate.userId === req.session.userId,
  );
  if (index === -1) {
    res.status(404).json({ error: "Todo not found" });
    return;
  }

  db.todos.splice(index, 1);
  res.json({ message: "Deleted" });
});

app.post("/api/contact", (req, res) => {
  const parsed = contactSchema.safeParse(req.body);
  if (!parsed.success) {
    sendValidationError(res, parsed.error, "Invalid input. Check all fields.");
    return;
  }

  db.contacts.push({
    id: db.nextContactId++,
    ...parsed.data,
    createdAt: new Date().toISOString(),
  });
  res.json({ message: "Message sent successfully" });
});

app.get("/api/products", (req, res) => {
  const search = typeof req.query.search === "string" ? req.query.search.trim().toLowerCase() : "";
  const sortBy = req.query.sortBy === "price" ? "price" : "name";
  const sortOrder = req.query.sortOrder === "desc" ? "desc" : "asc";

  const products = db.products
    .filter((product) => {
      if (!search) return true;
      return (
        product.name.toLowerCase().includes(search) ||
        product.category.toLowerCase().includes(search) ||
        product.description.toLowerCase().includes(search)
      );
    })
    .sort((a, b) => {
      const result =
        sortBy === "price" ? a.price - b.price : a.name.localeCompare(b.name);
      return sortOrder === "desc" ? -result : result;
    });

  res.json(products);
});

function ensureClientBuild() {
  const indexFile = path.join(staticDir, "index.html");
  if (fs.existsSync(indexFile)) return;

  console.log("Frontend build missing. Building @workspace/app...");
  execFileSync("npm.cmd", ["--workspace", "@workspace/app", "run", "build"], {
    cwd: __dirname,
    stdio: "inherit",
    env: { ...process.env, PORT: String(PORT), BASE_PATH: "/" },
  });
}

ensureClientBuild();

app.use(express.static(staticDir));
app.use((req, res, next) => {
  if (req.method !== "GET" || req.path.startsWith("/api/")) {
    next();
    return;
  }

  res.sendFile(path.join(staticDir, "index.html"));
});

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`Command Center running at http://localhost:${PORT}`);
});
