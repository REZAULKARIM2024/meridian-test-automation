import { Router } from "express";
import { query } from "../db.js";
import { asyncHandler } from "../asyncHandler.js";

const router = Router();

router.get("/", asyncHandler(async (req, res) => {
  const doctors = await query("SELECT id, name, specialty, rating FROM doctors ORDER BY name");
  const slots = await query("SELECT doctor_id, slot_label FROM doctor_slots ORDER BY id");
  const byDoctor = {};
  for (const s of slots) {
    (byDoctor[s.doctor_id] ||= []).push(s.slot_label);
  }
  res.json(doctors.map((d) => ({ ...d, slots: byDoctor[d.id] || [] })));
}));

export default router;
