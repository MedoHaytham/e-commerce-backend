import express from "express";
import userValidate from "../validators/userValidate.js";
import {
  registerUser, 
  loginUser, 
  refresh,
  logout
} from "../controllers/authConrller.js";
import { registerSchema } from "../schemas/registerSchema.js";
import { loginSchema } from "../schemas/loginSchema.js";


const router = express.Router();

router.route('/login')
  .post(userValidate(loginSchema), loginUser);

router.route('/register')
  .post(userValidate(registerSchema), registerUser);


router.route('/refresh')
  .get(refresh);

router.route('/logout')
  .post(logout);

export default router;
