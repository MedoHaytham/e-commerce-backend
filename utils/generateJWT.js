import jwt from "jsonwebtoken";

export const generateJWT = (payload, secretKey, expiresIn) => {
  return jwt.sign(payload, secretKey, {expiresIn});
}