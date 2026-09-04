import { Router } from "express";
import { query } from "../db.js";
import { requireAuth } from "../middleware/auth.js";
import { asyncHandler } from "../asyncHandler.js";

const router = Router();

router.get("/match", asyncHandler(async (req, res) => {
  const age = Number(req.query.age);
  const condition = (req.query.condition || "").toString();
  if (!Number.isInteger(age) || age < 0 || age > 120) {
    return res.status(400).json({ error: "Enter a valid age (0–120)." });
  }
  if (!condition) return res.status(400).json({ error: "Select a condition." });
  if (condition === "none") return res.json([]);

  const rows = await query(
    "SELECT * FROM trials WHERE condition_name = :condition AND :age BETWEEN min_age AND max_age",
    { condition, age }
  );
  res.json(rows);
}));

router.post("/:id/interest", requireAuth, asyncHandler(async (req, res) => {
  const trialId = req.params.id;
  const trial = (await query("SELECT * FROM trials WHERE id = :trialId", { trialId }))[0];
  if (!trial) return res.status(404).json({ error: "Trial not found." });

  try {
    await query(
      "INSERT INTO trial_interests (user_id, trial_id) VALUES (:userId, :trialId)",
      { userId: req.user.id, trialId }
    );
  } catch (err) {
    if (err.code !== "ER_DUP_ENTRY") throw err; // already expressed interest — treat as success
  }
  res.status(201).json({ trialId, status: "interest sent" });
}));

router.get("/interests/me", requireAuth, asyncHandler(async (req, res) => {
  const rows = await query(
    "SELECT trial_id FROM trial_interests WHERE user_id = :userId",
    { userId: req.user.id }
  );
  res.json(rows.map((r) => r.trial_id));
}));

export default router;
