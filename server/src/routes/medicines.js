import { Router } from "express";
import { query } from "../db.js";
import { asyncHandler } from "../asyncHandler.js";

const router = Router();

router.get("/", asyncHandler(async (req, res) => {
  const q = (req.query.q || "").toString().trim();
  const rows = q
    ? await query("SELECT * FROM medicines WHERE name LIKE :q ORDER BY name", { q: `%${q}%` })
    : await query("SELECT * FROM medicines ORDER BY name");
  res.json(rows.map((m) => ({ ...m, price: Number(m.price), rx: !!m.rx_required })));
}));

export default router;
