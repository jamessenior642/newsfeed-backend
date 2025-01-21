const express = require("express");
const passport = require("passport");

const router = express.Router();
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";

// Initiate Google OAuth
router.get(
  "/google",
  (req, res, next) => {
    // Store the previous URL in the session or query params
    const returnTo = req.query.returnTo || FRONTEND_URL; // Default to frontend home if no returnTo query param
    console.log("Setting returnTo:", returnTo); // Log the returnTo value
    req.session.returnTo = returnTo; // Store in session
    next();
  },
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// Google OAuth callback
router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/login", // Redirect to login if authentication fails
    successRedirect: "/auth/handle-redirect", // Handle redirect in a separate route
  })
);

// Handle the final redirect after successful login
router.get("/handle-redirect", (req, res) => {
  const returnTo = req.session.returnTo || FRONTEND_URL; // Default to frontend home if no session
  console.log("Redirecting to:", returnTo); // Log the returnTo value
  delete req.session.returnTo; // Clear the session returnTo
  res.redirect(returnTo); // Redirect to the original page
});

// Add auth check middleware
const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Not authenticated" });
};

router.get("/status", (req, res) => {
  res.json({
    loggedIn: req.isAuthenticated(),
    user: req.user || null
  });
});


// Logout route
router.get("/logout", (req, res) => {
  req.logout((err) => {
    if (err) {
      console.error("Logout error:", err);
      return res.status(500).json({ message: "Error logging out" });
    }
    req.session.destroy((err) => {
      if (err) {
        console.error("Session destruction error:", err);
      }
      res.json({ success: true });
    });
  });
});


module.exports = router;