import jwt from "jsonwebtoken";

export const generateJWT = (payload) => {
  return jwt.sign(payload, process.env.SECRET_KEY, {expiresIn: '1h'});
}