import { Router } from "express";
import {
  blockUser,
  getBlockedUsers,
  isAuth,
  login,
  logout,
  register,
  unblockUser,
  updateProfile,
} from "../controllers/userController.js";
import {
  loginValidator,
  registerValidator,
} from "../middlewares/authValidator.js";
import { protectRoute } from "../middlewares/authUser.js";
import { upload } from "../utils/multer.js";

const userRouter = Router();

userRouter.post("/signup", registerValidator, register);
userRouter.post("/login", loginValidator, login);
userRouter.get("/logout", logout);
userRouter.get("/check-auth", protectRoute, isAuth);
userRouter.get("/get-blocked-users", protectRoute, getBlockedUsers);
userRouter.post("/block/:userId", protectRoute, blockUser);
userRouter.post("/unblock/:userId", protectRoute, unblockUser);

userRouter.patch(
  "/update-profile",
  protectRoute,
  upload.single("profilePic"),
  updateProfile
);

export default userRouter;
