const express = require("express");
const passport = require("passport");

const router = express.Router();

// Initiate Google OAuth
router.get(
  "/google",
  (req, res, next) => {
    // Store the previous URL in the session or query params
    const returnTo = req.query.returnTo || "http://localhost:3000/"; // Default to frontend home if no returnTo query param
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
  const returnTo = req.session.returnTo || "http://localhost:3000/"; // Default to frontend home if no session
  console.log("Redirecting to:", returnTo); // Log the returnTo value
  delete req.session.returnTo; // Clear the session returnTo
  res.redirect(returnTo); // Redirect to the original page
});

module.exports = router;