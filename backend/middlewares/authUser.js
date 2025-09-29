import jwt from "jsonwebtoken";

export const authUser = async (req, res, next) => {
  const { token } = req.cookies;

  if (!token) return res.json({ success: false, message: "Please Login First" });

  try {
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET_KEY);
    if (decodedToken.id) {
      req.user = { userId: decodedToken.id };
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