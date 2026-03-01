import express from "express";
import verifyToken from "../middleware/verifyToken.js";
import allowedTo from "../middleware/allowedTo.js";
import allowedToOrOwner from "../middleware/allowedToOrOwner.js";
import { 
  getAllUsers, 
  deleteUser, 
  getUserById, 
  toggleFavorite, 
  getFavoriteProducts, 
  addToCart, 
  removeFromCart, 
  getCartProducts, 
  increaseQuantity, 
  decreaseQuantity,
} from "../controllers/usersController.js";
import { USER_ROLES } from "../utils/usersRoles.js";

const router = express.Router();

router.use(verifyToken);

router.route('/')
  .get(allowedTo(USER_ROLES.MANAGER), getAllUsers);

router.route('/cart')
  .get(getCartProducts)

router.route('/cart/:productId')
  .post(addToCart)
  .delete(removeFromCart)

router.route('/cart/:productId/increase')
  .patch(increaseQuantity);

router.route('/cart/:productId/decrease')
  .patch(decreaseQuantity);

router.route('/favorites')
  .get(getFavoriteProducts)

router.route('/favorites/:productId')
  .post(toggleFavorite)

router.route('/:userId')
  .get(allowedToOrOwner(USER_ROLES.MANAGER), getUserById)
  .delete(allowedTo(USER_ROLES.MANAGER), deleteUser);

export default router;

