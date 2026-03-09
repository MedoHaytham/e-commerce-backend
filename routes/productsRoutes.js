import express from "express";
import { getAllProducts, getProductById, addProduct, deleteProduct, getProductsByCategory, searchProducts } from "../controllers/productsController.js";
import { productsSchema } from "../schemas/productsSchema.js";
import verifyToken from "../middleware/verifyToken.js";
import { USER_ROLES } from "../utils/usersRoles.js";
import allowedTo from "../middleware/allowedTo.js";
import validate from "../validators/validate.js";

const router = express.Router();

router.route("/")
  .get(getAllProducts)
  .post(validate(productsSchema, "Invalid product data"), verifyToken, allowedTo(USER_ROLES.ADMIN, USER_ROLES.MANAGER), addProduct);
  
router.route("/search")
  .get(searchProducts);
  
router.route("/category/:slug")
  .get(getProductsByCategory);

router.route("/:productId")
  .get(getProductById)
  .delete(verifyToken, allowedTo(USER_ROLES.ADMIN, USER_ROLES.MANAGER), deleteProduct);



export default router;
