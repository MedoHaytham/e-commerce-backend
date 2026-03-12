import express from "express";
import { 
  checkoutOrder,
  getMyOrders,
  getOrderById,
  getAllOrders
} from "../controllers/orderController.js";
import verifyToken from "../middleware/verifyToken.js";

const router = express.Router();

router.route("/checkout")
  .post(verifyToken, checkoutOrder);

router.route("/")
  .get(verifyToken, getMyOrders);

router.route("/:orderId")
  .get(verifyToken, getOrderById);

router.route("/all")
  .get(verifyToken, getAllOrders);

export default router;
