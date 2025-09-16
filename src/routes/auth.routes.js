import express from "express";
import { register, login, logout } from "../controllers/auth.controller.js";
import { validateLogin, validateRegister } from "../middlewares/auth.middleware.js";
import verifyAuth from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/register", validateRegister, register);
router.post("/login", validateLogin, login);
router.get("/logout", logout);
router.get("/me", verifyAuth, me); 

export default router;
