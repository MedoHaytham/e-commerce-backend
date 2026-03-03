import mongoose from "mongoose";
import { USER_ROLES } from "../utils/usersRoles.js";
import validator from "validator";

const userSchema = new mongoose.Schema({
  firstName: {type: String, required: true},
  lastName: {type: String, required: true},
  email: {
    type: String, 
    required: true, 
    unique: true, 
    lowercase: true, 
    trim: true,
    validate: {
      validator: validator.isEmail,
      message: 'field must be a valid email address'
    }
  },
  password: {type: String, required: true, select: false},
  role: {
    type: String, 
    enum: [USER_ROLES.ADMIN, USER_ROLES.USER], 
    default: USER_ROLES.USER
  },
  favoriteProducts: [
    {type: mongoose.Schema.Types.ObjectId, ref: 'Product'}
  ],
  inCartProducts: [
    {
      product: {type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true},
      quantity: {type: Number, default: 1, min: 1}
    }
  ],
});

const User = mongoose.model('User', userSchema);

export default User;
