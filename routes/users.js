const express = require("express");
const User = require("../models/User");

const router = express.Router();

// Get a user's profile info by ID
router.get("/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    const user = await User.findById(userId, { name: 1, email: 1, _id: 1 }); // Fetch public user info
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({ message: "Error fetching user profile" });
  }
});

module.exports = router;
