import mongoose from "mongoose";
import { USER_ROLES } from "../utils/usersRoles.js";
import validator from "validator";

const userSchema = new mongoose.Schema({
  username: {type: String, required: true},
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
});

const User = mongoose.model('User', userSchema);

export default User;
