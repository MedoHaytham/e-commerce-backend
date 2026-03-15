import express from "express";
import { 
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrders
} from "../controllers/orderController.js";
import verifyToken from "../middleware/verifyToken.js";
import allowedTo from "../middleware/allowedTo.js";
import { USER_ROLES } from "../utils/usersRoles.js";

const router = express.Router();

router.use(verifyToken);

router.route("/create")
  .post(createOrder);

router.route("/")
  .get(getMyOrders);

router.route("/:orderId")
  .get(getOrderById);

router.route("/all")
  .get(allowedTo(USER_ROLES.MANAGER, USER_ROLES.ADMIN), getAllOrders);

export default router;
