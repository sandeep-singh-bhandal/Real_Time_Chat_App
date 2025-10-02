import { Router } from "express";
import {
  isAuth,
  login,
  logout,
  register,
  updateProfile,
} from "../controllers/userController.js";
import {
  loginValidator,
  registerValidator,
} from "../middlewares/authValidator.js";
import { protectRoute } from "../middlewares/authUser.js";

const userRouter = Router();

userRouter.post("/signup", registerValidator, register);
userRouter.post("/login", loginValidator, login);
userRouter.post("/logout", logout);
userRouter.get("/check-auth", protectRoute, isAuth);

userRouter.put("/update-profile", protectRoute, updateProfile);

export default userRouter;
