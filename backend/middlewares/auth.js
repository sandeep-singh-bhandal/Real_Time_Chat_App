import User from "../models/User";

// Middleware to protect the route
export const protectRoute = async (req, res, next) => {
  const { token } = req.cookies;

  if (!token)
    return res.json({ success: false, message: "Please Login First" });

  try {
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET_KEY);
    if (!decodedToken.userId)
      res.json({ success: false, message: "Not Authorized" });

    const user = await User.findById(decodedToken.userId).select("-password");
    if (!user) res.json({ success: false, message: "User not found" });

    req.user = user;
    res.json({ success: true, user });
    next();
  } catch (err) {
    console.log(err.message);
    res.json({ success: false, message: err.message });
  }
};
