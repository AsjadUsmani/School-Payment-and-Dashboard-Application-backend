import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import connectDB from "./src/config/config.js";
import cookieParser from "cookie-parser";
import authRouter from "./src/routes/auth.routes.js";
import paymentRouter from "./src/routes/payment.routes.js";
import webhookRouter from "./src/routes/webhook.routes.js";
import transactionRouter from "./src/routes/transaction.routes.js";
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
const allowedOrigins = [
  "http://localhost:5173",  // Local dev
  "https://school-payment-and-dashboard-applic.vercel.app",  // Vercel frontend
];

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(helmet());

// Connect to MongoDB
connectDB();

// Test Route
app.get("/", (req, res) => {
  res.json({ message: "API is working!" });
});

app.use("/api/auth", authRouter);
app.use("/", paymentRouter);
app.use("/", webhookRouter);
app.use("/", transactionRouter);

app.listen(PORT, () => {
  console.log(`Server is Running on port ${PORT}`);
});
