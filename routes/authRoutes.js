import express from "express";
import {
  registerUser, 
  loginUser, 
  refresh,
  logout
} from "../controllers/authController.js";
import { registerSchema } from "../schemas/registerSchema.js";
import { loginSchema } from "../schemas/loginSchema.js";
import validate from "../validators/validate.js";


const router = express.Router();

router.route('/login')
  .post(validate(loginSchema, "Invalid login data"), loginUser);

router.route('/register')
  .post(validate(registerSchema, "Invalid register data"), registerUser);


router.route('/refresh')
  .get(refresh);

router.route('/logout')
  .post(logout);

export default router;
