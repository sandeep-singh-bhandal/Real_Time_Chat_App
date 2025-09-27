import jwt from "jsonwebtoken";

export const generateToken = (userId, expiryTime) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET_KEY, {
    expiresIn: expiryTime,
  });
  return token;
};
