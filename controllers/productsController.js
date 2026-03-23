import { asyncWrapper } from "../middleware/asyncWrapper.js";
import { httpStatusText } from "../utils/httpStatusText.js";
import AppError from "../utils/appError.js";
import Product from "../models/products.js";
import Category from "../models/categories.js";

const getAllProducts = asyncWrapper(
  async (req, res, next) => {
    const limit = req.query.limit || 10;
    const page = req.query.page || 1;
    const skip = (page - 1) * limit;
    const products = await Product.find({}, {__v: 0}).limit(limit).skip(skip).populate("category");
    return res.json({status: httpStatusText.SUCCESS, data: products});
  }
);

const getProductById = asyncWrapper(
  async (req, res, next) => {
    const productId = req.params.productId;
    const product = await Product.findById(productId, {__v: 0}).populate('category');
    if (!product) {
      const error = new AppError();
      error.create('product not found', 404, httpStatusText.FAIL);
      return next(error);
    }
    return res.json({status: httpStatusText.SUCCESS, data: {
      id: product._id,
      title: product.title,
      description: product.description,
      category: product.category.slug,
      price: product.price,
      rating: product.rating,
      stock: product.stock,
      brand: product.brand,
      availabilityStatus: product.availabilityStatus,
      images: product.images
    }});
  }
);

const getProductsByCategory = asyncWrapper(
  async (req, res, next) => {
    const slug = req.params.slug;
    const category = await Category.findOne({slug: slug});
    if (!category) {
      const error = new AppError();
      error.create('category not found', 404, httpStatusText.FAIL);
      return next(error);
    }
    const products = await Product.find({category: category._id}, {__v: 0}).populate("category");
    return res.json({status: httpStatusText.SUCCESS, data: products});
  }
);

const searchProducts = asyncWrapper(
  async (req, res, next) => {
    const query = (req.query.q || '').trim();
    if (!query) {
      const error = new AppError();
      error.create('query is required', 400, httpStatusText.FAIL);
      return next(error);
    }

    const limit = req.query.limit || 5;
    const page = req.query.page || 1;
    const skip = (page - 1) * limit;

    const categories = await Category.find({slug: {$regex: query, $options: 'i'}}, {_id: 1});
    const categoriesIds = categories.map(category => category._id);

    const products = await Product.find({$or: [
      {title: {$regex: query, $options: 'i'}},
      {description: {$regex: query, $options: 'i'}},
      {brand: {$regex: query, $options: 'i'}},
      ...(categoriesIds.length ? [{ category: { $in: categoriesIds } }] : []),
    ]}, {__v: 0}).limit(limit).skip(skip).populate("category");
    return res.json({status: httpStatusText.SUCCESS, data: products});
  }
);

const addProduct = asyncWrapper(
  async (req, res, next) => {
    const { title, description, category, price, rating, stock, brand, availabilityStatus, images } = req.body;

    const oldCategory = await Category.exists({_id: category});
    if (!oldCategory) {
      const error = new AppError();
      error.create('category not found', 404, httpStatusText.FAIL);
      return next(error);
    }

    const product = new Product({
      title,
      description,
      category,
      price,
      rating,
      stock,
      brand,
      availabilityStatus,
      images
    });
    await product.save();
    const populated = await Product.findById(product._id, {__v: 0}).populate("category");
    return res.json({status: httpStatusText.SUCCESS, data: {
      title: product.title,
      description: product.description,
      category: populated.category.slug,
      price: product.price,
      rating: product.rating,
      stock: product.stock,
      brand: product.brand,
      availabilityStatus: product.availabilityStatus,
      images: product.images
    }});
  }
);


const updateProduct = asyncWrapper(
  async (req, res, next) => {
    const productId = req.params.productId;
    const { title, category, price, stock} = req.body;
    
    const oldCategory = await Category.exists({_id: category});
    if (!oldCategory) {
      const error = new AppError();
      error.create('category not found', 404, httpStatusText.FAIL);
      return next(error);
    }

    const product = await Product.findByIdAndUpdate(productId, {
      title,
      category,
      price,
      stock
    });

    if (!product) {
      const error = new AppError();
      error.create('product not found', 404, httpStatusText.FAIL);
      return next(error);
    }

    const populated = await Product.findById(product._id, {__v: 0}).populate("category");

    return res.json({status: httpStatusText.SUCCESS, data: populated});
  }
)


// const updateProduct = asyncWrapper(
//   async (req, res, next) => {
//     const { title, description, category, price, rating, stock, brand, availabilityStatus, images } = req.body;

//     const oldCategory = await Category.exists({_id: category});
//     if (!oldCategory) {
//       const error = new AppError();
//       error.create('category not found', 404, httpStatusText.FAIL);
//       return next(error);
//     }

//     const product = await Product.findByIdAndUpdate(req.params.productId, {
//       title,
//       description,
//       category,
//       price,
//       rating,
//       stock,
//       brand,
//       availabilityStatus,
//       images
//     }, {new: true, runValidators: true});
//     if (!product) {
//       const error = new AppError();
//       error.create('product not found', 404, httpStatusText.FAIL);
//       return next(error);
//     }
//     const populated = await Product.findById(product._id, {__v: 0}).populate("category");
//     return res.json({status: httpStatusText.SUCCESS, data: {
//       title: product.title,
//       description: product.description,
//       category: populated.category.slug,
//       price: product.price,
//       rating: product.rating,
//       stock: product.stock,
//       brand: product.brand,
//       availabilityStatus: product.availabilityStatus,
//       images: product.images
//     }});
//   }
// );

const deleteProduct = asyncWrapper(
  async (req, res, next) => {
    const product = await Product.findByIdAndDelete(req.params.productId);
    if (!product) {
      const error = new AppError();
      error.create('product not found', 404, httpStatusText.FAIL);
      return next(error);
    }
    return res.json({status: httpStatusText.SUCCESS, data: null});
  }
);

export { 
  getAllProducts,
  getProductById, 
  addProduct, 
  deleteProduct, 
  getProductsByCategory, 
  searchProducts,
  updateProduct,
};