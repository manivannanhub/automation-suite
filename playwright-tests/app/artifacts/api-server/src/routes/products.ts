import { Router } from "express";
import { db } from "@workspace/db";
import { productsTable } from "@workspace/db";
import { ilike, asc, desc } from "drizzle-orm";

const router = Router();

router.get("/products", async (req, res) => {
  const { search, sortBy, sortOrder } = req.query as {
    search?: string;
    sortBy?: "name" | "price";
    sortOrder?: "asc" | "desc";
  };

  let query = db.select().from(productsTable);

  const rows = await query;

  let filtered = rows;
  if (search) {
    const lower = search.toLowerCase();
    filtered = rows.filter(
      p => p.name.toLowerCase().includes(lower) || p.category.toLowerCase().includes(lower)
    );
  }

  if (sortBy === "name") {
    filtered.sort((a, b) => sortOrder === "desc" ? b.name.localeCompare(a.name) : a.name.localeCompare(b.name));
  } else if (sortBy === "price") {
    filtered.sort((a, b) => {
      const aPrice = parseFloat(a.price);
      const bPrice = parseFloat(b.price);
      return sortOrder === "desc" ? bPrice - aPrice : aPrice - bPrice;
    });
  }

  return res.json(filtered.map(p => ({
    id: p.id,
    name: p.name,
    price: parseFloat(p.price),
    category: p.category,
    description: p.description,
  })));
});

export default router;
