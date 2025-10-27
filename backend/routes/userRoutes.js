import { Router } from "express";
import {
  blockUser,
  changeEmail,
  changePassword,
  getBlockedUsers,
  isAuth,
  login,
  logout,
  register,
  requestOtp,
  unblockUser,
  updateProfile,
  verifyOtp,
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
userRouter.post("/request-code", protectRoute, requestOtp);
userRouter.post("/verify-code", protectRoute, verifyOtp);
userRouter.post("/change-email", protectRoute, changeEmail);
userRouter.post("/change-password", protectRoute, changePassword);
userRouter.post("/block/:userId", protectRoute, blockUser);
userRouter.post("/unblock/:userId", protectRoute, unblockUser);

userRouter.patch(
  "/update-profile",
  protectRoute,
  upload.single("profilePic"),
  updateProfile
);

export default userRouter;
