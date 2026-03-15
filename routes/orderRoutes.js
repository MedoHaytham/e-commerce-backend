import express from "express";
import { 
  checkoutOrder,
  getMyOrders,
  getOrderById,
  getAllOrders
} from "../controllers/orderController.js";
import verifyToken from "../middleware/verifyToken.js";

const router = express.Router();

router.use(verifyToken);

router.route("/checkout")
  .post(checkoutOrder);

router.route("/")
  .get(getMyOrders);

router.route("/:orderId")
  .get(getOrderById);

router.route("/all")
  .get(getAllOrders);

export default router;
