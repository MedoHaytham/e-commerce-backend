import mongoose from "mongoose";
import { USER_ROLES } from "../utils/usersRoles.js";
import validator from "validator";

const addressSchema = new mongoose.Schema({
  title: {type: String, required: true, trim: true},
  firstName: {type: String, required: true, trim: true},
  lastName: {type: String, required: true, trim: true},
  address: {type: String, required: true, trim: true},
  city: {type: String, required: true, trim: true},
  country: {
    type: String,
    required: true,
    enum: [
      'egypt', 
      'saudi arabia', 
      'uae', 
      'qatar', 
      'american', 
      'british', 
      'yemen', 
      'syria', 
      'lebanon', 
      'jordan', 
      'palestine', 
      'iraq', 
      'morocco', 
      'algeria', 
      'tunisia', 
      'libya', 
      'sudan', 
      'somalia', 
      'djibouti', 
      'comoros'
    ],
    default: "egypt",
    trim: true
  },  
  phone: {
    type: String,
    required: true,
    trim: true,
    validate: {
      validator: function(value) {
        return validator.isMobilePhone(value, "any");
      },
      message: "field must be a valid phone number"
    }
  },
  isDefault: {type: Boolean, default: false}
},{ _id: true});


const userSchema = new mongoose.Schema({
  firstName: {type: String, required: true, trim: true},
  lastName: {type: String, required: true, trim: true},
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    validate: {
      validator: function(value) {
        return validator.isEmail(value);
      },
      message: "field must be a valid email address"
    }
  },
  phone: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    validate: {
      validator: function(value) {
        return validator.isMobilePhone(value, "any");
      },
      message: "field must be a valid phone number"
    }
  },
  birthDate: {
    type: Date,
    required: true,
    validate: {
      validator: function(value) {
        return value instanceof Date && !isNaN(value) && value < new Date();
      },
      message: "birthDate must be a valid past date"
    }
  },
  gender: {
    type: String,
    enum: ['male', 'female'],
    required: true
  },
  country: {
    type: String,
    required: true,
    enum: [
      'egypt', 
      'saudi arabia', 
      'uae', 
      'qatar', 
      'american', 
      'british', 
      'yemen', 
      'syria', 
      'lebanon', 
      'jordan', 
      'palestine', 
      'iraq', 
      'morocco', 
      'algeria', 
      'tunisia', 
      'libya', 
      'sudan', 
      'somalia', 
      'djibouti', 
      'comoros'
    ],
    trim: true
  },
  password: {type: String, required: true, select: false},
  role: {
    type: String, 
    enum: [USER_ROLES.ADMIN, USER_ROLES.USER, USER_ROLES.MANAGER], 
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
  addresses: [addressSchema]
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

export default User;
