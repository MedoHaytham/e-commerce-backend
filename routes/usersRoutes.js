import express from "express";
import userValidate from "../validators/userValidate.js";
import verifyToken from "../middleware/verifyToken.js";
import allowedTo from "../middleware/allowedTo.js";
import allowedToOrOwner from "../middleware/allowedToOrOwner.js";
import { getAllUsers, registerUser, loginUser, deleteUser, getUserById } from "../controllers/usersController.js";
import { registerSchema } from "../schemas/registerSchema.js";
import { loginSchema } from "../schemas/loginSchema.js";
import { USER_ROLES } from "../utils/usersRoles.js";

const router = express.Router();

router.route('/login')
  .post(userValidate(loginSchema), loginUser);

router.route('/register')
  .post(userValidate(registerSchema), registerUser);

router.use(verifyToken);

router.route('/')
  .get(allowedTo(USER_ROLES.MANAGER), getAllUsers);

router.route('/:userId')
  .get(allowedToOrOwner(USER_ROLES.MANAGER), getUserById)
  .delete(allowedTo(USER_ROLES.MANAGER), deleteUser);

export default router;

