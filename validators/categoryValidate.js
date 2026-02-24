import AppError from "../utils/appError.js";
import { httpStatusText } from "../utils/httpStatusText.js";

const categoryValidate = (schemas) => {
  return (req, res, next) => {
    const result = schemas.safeParse(req.body);
    if(!result.success) {
      const formattedErrors = result.error.issues.map(err => ({
        field: err.path[0],
        message: err.message,
      }));

      const error = new AppError();
      error.create('Invalid category data', 400, httpStatusText.FAIL, formattedErrors);
      error.errors = formattedErrors;
      return next(error);
    }
    req.body = result.data;
    next();
  }
}

export default categoryValidate;
