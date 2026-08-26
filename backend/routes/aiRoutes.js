import { Router } from "express";
import { analyzeProblem } from "../controllers/aiController.js";

const router = Router();

router.post("/analyze", analyzeProblem);

export default router;