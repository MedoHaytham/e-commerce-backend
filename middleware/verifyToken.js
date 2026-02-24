import JWT from "jsonwebtoken";
import AppError from "../utils/appError.js";
import { httpStatusText } from "../utils/httpStatusText.js";

const verifyToken = (req, res, next) => {
  const authHeader = req.get('Authorization') || req.get('authorization');

  if(!authHeader) {
    const error = new AppError();
    error.create('Token is required', 401, httpStatusText.FAIL);
    return next(error);
  }

  if(!authHeader.startsWith('Bearer ')) {
    const error = new AppError();
    error.create('Invalid authorization format', 401, httpStatusText.FAIL);
    return next(error);
  }

  const token = authHeader.split(' ')[1];

  try {
    const currentUser = JWT.verify(token, process.env.SECRET_KEY);
    req.currentUser = currentUser;
    next();
  } catch (err) {
    const error = new AppError();
    error.create('Invalid or expired token', 401, httpStatusText.FAIL);
    return next(error);
  }
}

export default verifyToken;
