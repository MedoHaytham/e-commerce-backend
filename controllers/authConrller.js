import { asyncWrapper } from "../middleware/asyncWrapper.js";
import User from "../models/users.js";
import { httpStatusText } from "../utils/httpStatusText.js";
import bcrypt from "bcryptjs";
import { generateJWT } from "../utils/generateJWT.js";
import AppError from "../utils/appError.js";
import Product from "../models/products.js";
import dotenv from "dotenv";
import JWT from "jsonwebtoken";

dotenv.config();

const registerUser = asyncWrapper(
  async (req, res, next) => {
    const { firstName, lastName, email, password, phone, birthDate, gender, country } = req.body;
    const emailNormalized = email.toLowerCase().trim();
    const oldUser = await User.findOne({email: emailNormalized});
    if (oldUser) {
      const error = new AppError();
      error.create('user already exists', 409, httpStatusText.FAIL);
      return next(error);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      firstName,
      lastName,
      phone,
      birthDate,
      gender,
      country,
      email: emailNormalized, 
      password: hashedPassword,
    });
    
    await newUser.save();

    const accessToken = generateJWT({id: newUser._id, role: newUser.role}, process.env.ACCESS_TOKEN_SECRET_KEY, process.env.ACCESS_TOKEN_EXPIRES_IN);
    const refreshToken = generateJWT({id: newUser._id, role: newUser.role}, process.env.REFRESH_TOKEN_SECRET_KEY, process.env.REFRESH_TOKEN_EXPIRES_IN);

    res.cookie('jwt', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'None',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(201).json({status: httpStatusText.SUCCESS, data: {
      accessToken,
      user: {
        id: newUser._id,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        phone: newUser.phone,
        birthDate: newUser.birthDate,
        gender: newUser.gender,
        country: newUser.country,
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
    const accessToken = generateJWT({id: user._id, role: user.role}, process.env.ACCESS_TOKEN_SECRET_KEY, process.env.ACCESS_TOKEN_EXPIRES_IN);
    const refreshToken = generateJWT({id: user._id, role: user.role}, process.env.REFRESH_TOKEN_SECRET_KEY, process.env.REFRESH_TOKEN_EXPIRES_IN);

    res.cookie('jwt', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'None',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({status: httpStatusText.SUCCESS, data: {
      accessToken,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        birthDate: user.birthDate,
        gender: user.gender,
        country: user.country,
        email: user.email,
        role: user.role,
      }
    }});
  }
);

const refresh = asyncWrapper(
  async(req, res, next) => {
    const refreshToken = req.cookies.jwt;

    if(!refreshToken) {
      const error = new AppError();
      error.create('forbidden', 403, httpStatusText.FAIL);
      return next(error);
    }

    let currentUser;
    try {
      currentUser = JWT.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET_KEY);
    } catch (err) {
      const error = new AppError();
      error.create('Invalid or expired token', 401, httpStatusText.FAIL);
      return next(error);
    }

    if(!currentUser) {
      const error = new AppError();
      error.create('Unauthorized', 401, httpStatusText.FAIL);
      return next(error);
    }

    const accessToken = generateJWT({id: currentUser.id, role: currentUser.role}, process.env.ACCESS_TOKEN_SECRET_KEY, process.env.ACCESS_TOKEN_EXPIRES_IN)
    return res.status(200).json({status: httpStatusText.SUCCESS, data: {
      accessToken,
      user: {
        id: currentUser.id,
        role: currentUser.role,
      }
    }});
  }
);

const logout = asyncWrapper(
  async (req, res, next) => {
    const cookies = req.cookies;
    if(!cookies?.jwt) return res.sendStatus(204);

    res.clearCookie('jwt', {
      httpOnly: true,
      secure: true,
      sameSite: 'None',
    });
    return res.status(200).json({status: httpStatusText.SUCCESS, data: {message: 'Logged out successfully'}});
  }
)

export { 
  registerUser, 
  loginUser,
  refresh,
  logout
}