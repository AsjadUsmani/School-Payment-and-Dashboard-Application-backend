import express from "express";
import {
  getAllTransactions,
  getTransactionsBySchool,
  checkTransactionStatus
} from "../controllers/transaction.controller.js";

import authMiddleware from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/transactions", authMiddleware, getAllTransactions);
router.get("/transactions/school/:schoolId", authMiddleware, getTransactionsBySchool);
router.get("/transaction-status/:custom_order_id", authMiddleware, checkTransactionStatus);

export default router;
