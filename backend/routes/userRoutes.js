import { Router } from "express";
import { login, register, updateProfile } from "../controllers/userControllers";
import { protectRoute } from "../middlewares/auth";

const userRouter = Router();

userRouter.post("/signup", register);
userRouter.post("/login", login);
userRouter.put("/update-profile", protectRoute, updateProfile);
userRouter.get("/check-auth", protectRoute, (req, res) =>
  res.json({ success: true })
);
export default userRouter;
