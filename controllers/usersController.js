import { asyncWrapper } from "../middleware/asyncWrapper.js";
import User from "../models/users.js";
import { httpStatusText } from "../utils/httpStatusText.js";
import bcrypt from "bcryptjs";
import { generateJWT } from "../utils/generateJWT.js";
import AppError from "../utils/appError.js";

const getAllUsers = asyncWrapper(
  async (req, res, next) => {
    const limit = req.query.limit || 10;
    const page = req.query.page || 1;
    const skip = (page - 1) * limit;
    const users = await User.find({}, {__v: 0, password: 0}).limit(limit).skip(skip);
    return res.json({status: httpStatusText.SUCCESS, data: users});
  }
);

const getUserById = asyncWrapper(
  async (req, res, next) => {
    const user = await User.findById(req.params.userId, {__v: 0, password: 0});
    if (!user) {
      const error = new AppError();
      error.create('user not found', 404, httpStatusText.FAIL);
      return next(error);
    }
    return res.json({status: httpStatusText.SUCCESS, data: user});
  }
);

const registerUser = asyncWrapper(
  async (req, res, next) => {
    const { username, email, password } = req.body;
    const emailNormalized = email.toLowerCase().trim();
    const oldUser = await User.findOne({email: emailNormalized});
    if (oldUser) {
      const error = new AppError();
      error.create('user already exists', 409, httpStatusText.FAIL);
      return next(error);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      username, 
      email: emailNormalized, 
      password: hashedPassword,
    });
    
    await newUser.save();

    const token = generateJWT({id: newUser._id, role: newUser.role});

    return res.status(201).json({status: httpStatusText.SUCCESS, data: {
      token,
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
      }
    }});
  }
);

const loginUser = asyncWrapper(
  async (req, res, next) => {
    const {email, password} = req.body;
    const emailNormalized = email.toLowerCase().trim();
    const user = await User.findOne({email: emailNormalized}).select('+password');
    if (!user) {
      const error = new AppError();
      error.create('Invalid email or password', 401, httpStatusText.FAIL);
      return next(error);
    }
    const matchedPassword = await bcrypt.compare(password, user.password);
    if (!matchedPassword) {
      const error = new AppError();
      error.create('Invalid email or password', 401, httpStatusText.FAIL);
      return next(error);
    }
    const token = generateJWT({id: user._id, role: user.role});
    return res.status(200).json({status: httpStatusText.SUCCESS, data: {
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      }
    }});
  }
);

// const updateUser = asyncWrapper(
//   async (req, res, next) => {
//     const user = await User.findByIdAndUpdate(req.params.userId, req.body, {new: true});
//     if (!user) {
//       const error = new AppError();
//       error.create('user not found', 404, httpStatusText.FAIL);
//       return next(error);
//     }
//     return res.json({status: httpStatusText.SUCCESS, data: user});
//   }
// );

const deleteUser = asyncWrapper(
  async (req, res, next) => {
    const user = await User.findByIdAndDelete(req.params.userId);
    if (!user) {
      const error = new AppError();
      error.create('user not found', 404, httpStatusText.FAIL);
      return next(error);
    }
    return res.json({status: httpStatusText.SUCCESS, data: null});
  }
);

export {getAllUsers, registerUser, loginUser, deleteUser, getUserById }