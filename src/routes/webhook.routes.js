import express from "express";
import { handleWebhook } from "../controllers/webhook.controller.js";
import { validateWebhook } from "../middlewares/webhook.middleware.js";

const router = express.Router();

router.post("/webhook", validateWebhook, handleWebhook);

export default router;