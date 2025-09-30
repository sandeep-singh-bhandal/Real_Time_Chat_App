import { registerSchema } from "../validation/register.js";
import { loginSchema } from "../validation/login.js";

//Registration Validation Middleware
export const registerValidator = async (req, res, next) => {
  const { name, email, password } = req.body;
  if (!name)
    return res.json({
      success: false,
      message: "Name is required",
    });
  if (!email)
    return res.json({
      success: false,
      message: "Email is required",
    });
  if (!password)
    return res.json({
      success: false,
      message: "Password is required",
    });
  try {
    const result = registerSchema.safeParse(req.body);
    if (!result.success) {
      const errors = result.error.issues;
      return res.status(400).json({ success: false, errors: errors });
    }
    req.body = result.data;
    next();
  } catch (error) {
    console.log(error);
  }
};

//Login Validation Middleware
export const loginValidator = async (req, res, next) => {
  const { email, password } = req.body;
  if (!email)
    return res.json({
      success: false,
      message: "Email is required",
    });
  if (!password)
    return res.json({
      success: false,
      message: "Password is required",
    });
  try {
    const result = loginSchema.safeParse(req.body);
    if (!result.success) {
      const errors = result.error.issues;
      return res.status(400).json({ success: false, errors: errors });
    }
    req.body = result.data;
    next();
  } catch (error) {
    console.log(error);
  }
};
