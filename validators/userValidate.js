import AppError from "../../projects/courses app/utils/appError.js";
import { httpStatusText } from "../../projects/courses app/utils/httpStatusText.js";

const userValidate = (schemas) => {
  return (req, res, next) => {
    const result = schemas.safeParse(req.body);
    if(!result.success) {
      const formattedErrors = result.error.issues.map(err => ({
        field: err.path[0],
        message: err.message,
      }));

      const error = new AppError();
      error.create('Invalid user data', 400, httpStatusText.FAIL, formattedErrors);
      error.errors = formattedErrors;
      return next(error);
    }
    req.body = result.data;

    delete req.body.confirmPassword;
    next();
  }
}

export default userValidate;
