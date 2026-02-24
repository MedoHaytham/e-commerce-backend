import { httpStatusText } from "../utils/httpStatusText.js";

export const asyncWrapper = (asyncFn) => {
  return(req, res, next) => {
    asyncFn(req, res, next).catch((err) => {
      err.statusText = httpStatusText.ERROR;
      err.statusCode = 500;
      next(err);
    });
  };
};

