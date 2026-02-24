import AppError from "../utils/appError.js";
import { httpStatusText } from "../utils/httpStatusText.js";


const allowedTo = (...roles) => {
  return(req, res, next) => {

    if(!req.currentUser) {
      const error = new AppError();
      error.create('Unauthenticated', 401, httpStatusText.FAIL);
      return next(error);
    }

    if(!roles.includes(req.currentUser.role)) {
      const error = new AppError();
      error.create('You are not allowed to access this resource', 403, httpStatusText.FAIL);
      return next(error);
    }
    next();
  }
}

export default allowedTo;