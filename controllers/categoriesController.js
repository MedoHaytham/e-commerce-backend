import { asyncWrapper } from "../middleware/asyncWrapper.js";
import Category from "../models/categories.js";
import { httpStatusText } from "../utils/httpStatusText.js";
import AppError from "../utils/appError.js";
import Product from "../models/products.js";

const getAllCategories = asyncWrapper(
  async (req, res, next) => {
    const limit = req.query.limit || 10;
    const page = req.query.page || 1;
    const skip = (page - 1) * limit;
    const categories = await Category.find({}, {__v: 0}).limit(limit).skip(skip);
    return res.json({status: httpStatusText.SUCCESS, data: categories});
  }
);

const getCategory = asyncWrapper(
  async (req, res, next) => {
    const category = await Category.findById(req.params.categoryId, {__v: 0});
    if (!category) {
      const error = new AppError();
      error.create('category not found', 404, httpStatusText.FAIL);
      return next(error);
    }
    return res.json({status: httpStatusText.SUCCESS, data: category});
  }
);

const addCategory = asyncWrapper(
  async (req, res, next) => {
    const { name, slug } = req.body;
    const normalizedSlug = slug.toLowerCase().trim();
    const oldCategory = await Category.findOne({slug: normalizedSlug});
    if (oldCategory) {
      const error = new AppError();
      error.create('category already exists', 409, httpStatusText.FAIL);
      return next(error);
    }
    const category = new Category({
      name,
      slug: normalizedSlug
    });
    await category.save();
    return res.json({status: httpStatusText.SUCCESS, data: {
      slug: category.slug,
      name: category.name,
    }});
  }
);

const deleteCategory = asyncWrapper(
  async (req, res, next) => {
    const categoryId = req.params.categoryId;

    const products = await Product.findOne({category: categoryId});

    if(products) {
      const error = new AppError();
      error.create('Cannot delete category with associated products', 400, httpStatusText.FAIL);
      return next(error);
    }

    const category = await Category.findByIdAndDelete(categoryId);

    if (!category) {
      const error = new AppError();
      error.create('category not found', 404, httpStatusText.FAIL);
      return next(error);
    }
    return res.json({status: httpStatusText.SUCCESS, data: null});
  }
);

export { getAllCategories, addCategory, deleteCategory, getCategory };
