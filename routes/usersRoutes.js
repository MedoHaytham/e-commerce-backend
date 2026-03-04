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
  updateProfile,
  updatePassword,
  updateUserByAdmin,
  getProfile
} from "../controllers/usersController.js";
import { USER_ROLES } from "../utils/usersRoles.js";

const router = express.Router();

router.use(verifyToken);
// ================= USERS =================
router.route('/')
  .get(allowedTo(USER_ROLES.MANAGER), getAllUsers);

// ================= PROFILE =================
router.route('/me')
  .get(getProfile)
  .patch(updateProfile);

router.route('/me/password')
  .patch(updatePassword);

// ================= CART =================
router.route('/cart')
  .get(getCartProducts)

router.route('/cart/:productId')
  .post(addToCart)
  .delete(removeFromCart)

router.route('/cart/:productId/increase')
  .patch(increaseQuantity);

router.route('/cart/:productId/decrease')
  .patch(decreaseQuantity);

// ================= FAVORITES =================
router.route('/favorites')
  .get(getFavoriteProducts)

router.route('/favorites/:productId')
  .post(toggleFavorite)

// ================= ADMIN / USER =================
router.route('/:userId')
  .get(allowedToOrOwner(USER_ROLES.MANAGER), getUserById)
  .patch(allowedTo(USER_ROLES.MANAGER), updateUserByAdmin)
  .delete(allowedToOrOwner(USER_ROLES.MANAGER), deleteUser);

export default router;