module.exports = (req, res, next) => {
  console.log("isAuthenticated:", req.isAuthenticated());
  console.log("Session user:", req.user);

  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Unauthorized" });
};
