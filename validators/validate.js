import AppError from "../utils/appError.js";
import { httpStatusText } from "../utils/httpStatusText.js";

const validate = (schema, message = "Invalid data") => {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const formattedErrors = result.error.issues.map((err) => ({
        field: err.path[0],
        message: err.message,
      }));

      const error = new AppError();
      error.create(message, 400, httpStatusText.FAIL, formattedErrors);
      error.errors = formattedErrors;
      return next(error);
    }
    req.body = result.data;

    if (req.body.confirmPassword) {
      delete req.body.confirmPassword;
    }

    next();
  };
};

export default validate;