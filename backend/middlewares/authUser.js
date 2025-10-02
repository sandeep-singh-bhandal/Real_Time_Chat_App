import jwt from "jsonwebtoken";

export const protectRoute = async (req, res, next) => {
  const { authToken } = req.cookies;

  if (!authToken) return res.json({ success: false, message: "Please Login First" });

  try {
    const decodedToken = jwt.verify(authToken, process.env.JWT_SECRET_KEY);
    if (decodedToken.userId) {
      req.user = { userId: decodedToken.userId };
    } else {
      res.json({ success: false, message: "Not Authorized" });
    }
    next();
  } catch (err) {
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
