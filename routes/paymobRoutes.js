import express from "express";
import { initiatePayment, handleWebhook } from "../controllers/paymobController.js";
import verifyToken from "../middleware/verifyToken.js";

const router = express.Router();

router.post("/pay",     verifyToken, initiatePayment);
router.post("/webhook", handleWebhook); // Paymob POST callback
router.get("/webhook",  handleWebhook); // Paymob GET redirect

export default router;