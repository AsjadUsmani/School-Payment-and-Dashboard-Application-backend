import express from "express";
import { createPayment, checkPaymentStatus } from "../controllers/payment.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";
import { validateCreatePayment } from "../middlewares/payment.middleware.js";

const router = express.Router();

router.post("/create-payment", authMiddleware, validateCreatePayment, createPayment);
router.get("/check-status/:collect_request_id", authMiddleware, checkPaymentStatus);

export default router;