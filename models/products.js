import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 200,
  },

  description: { type: String, required: true, trim: true },

  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },

  price: { type: Number, required: true, min: 0 },

  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0,
  },

  stock: { type: Number, required: true, min: 0 },

  brand: { type: String, trim: true, required: true },

  availabilityStatus: {
    type: String,
    enum: ["In Stock", "Out of Stock"],
    default: "In Stock",
  },

  images: [
    { type: String, required: true },
  ],
});

const Product = mongoose.model('Product', productSchema);

export default Product;