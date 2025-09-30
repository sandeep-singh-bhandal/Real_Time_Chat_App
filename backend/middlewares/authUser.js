import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protectRoute = async (req, res, next) => {
  const { authToken } = req.cookies;

  if (!authToken)
    return res
      .status(401)
      .json({ success: false, message: "Please Login First" });

  try {
    const decodedToken = jwt.verify(authToken, process.env.JWT_SECRET_KEY);
    if (decodedToken.userId) {
      const user = await User.findById(decodedToken.userId).select("-password");
      if (!user)
        return res
          .status(404)
          .json({ success: false, message: "No User Found" });
      req.user = user;
    } else {
      return res
        .status(401)
        .json({ success: false, message: "Not Authorized" });
    }
    next();
  } catch (err) {
    console.log(err.message);
    res.json({ success: false, message: err.message });
  }
};

export const authResetPassword = async (req, res, next) => {
  const { passwordResetToken } = req.cookies;

  if (!passwordResetToken)
    return res.json({
      success: false,
      message: "Please enter the 6 digit code",
    });

  try {
    const decodedToken = jwt.verify(
      passwordResetToken,
      process.env.JWT_SECRET_KEY
    );
    if (decodedToken.email) {
      next();
    } else {
      res.json({ success: false, message: "Please enter the 6 digit code" });
    }
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
};
