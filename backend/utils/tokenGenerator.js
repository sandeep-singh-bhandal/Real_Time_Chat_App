import jwt from "jsonwebtoken";
const generateToken = (userId, res) => {

  const token = jwt.sign({ userId }, process.env.JWT_SECRET_KEY, {
    expiresIn: "7d",
  });
  res.cookie("authToken", token, {
    httpOnly: true, // prevent JS to access the cookie
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "strict", // CSRF protection
    maxAge: 7 * 24 * 60 * 60 * 1000, // cookie expiration time
  });

  return token;
};

export default generateToken;
