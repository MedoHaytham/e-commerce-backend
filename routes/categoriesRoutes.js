import express from "express";
import { getAllCategories, addCategory, deleteCategory, getCategory } from "../controllers/categoriesController.js";
import categoryValidate from "../validators/categoryValidate.js";
import { categoriesSchema } from "../schemas/categoriesSchema.js";
import verifyToken from "../middleware/verifyToken.js";
import { USER_ROLES } from "../utils/usersRoles.js";
import allowedTo from "../middleware/allowedTo.js";

const router = express.Router();

router.route('/')
  .get(getAllCategories)
  .post(categoryValidate(categoriesSchema), verifyToken, allowedTo(USER_ROLES.ADMIN, USER_ROLES.MANAGER), addCategory);

router.route('/:categoryId')
  .get(getCategory)
  .delete(verifyToken, allowedTo(USER_ROLES.ADMIN, USER_ROLES.MANAGER), deleteCategory);

export default router;
