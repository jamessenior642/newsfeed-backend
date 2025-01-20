const express = require("express");
const axios = require("axios");
const Article = require("../models/Article");
const ensureAuthenticated = require("../middleware/ensureAuthenticated");

const router = express.Router();

// Get all articles
router.get("/", async (req, res) => {
  try {
    const articles = await Article.find().sort({ createdAt: -1 });
    res.status(200).json(articles);
  } catch (error) {
    res.status(500).json({ message: "Error fetching articles" });
  }
});

// Post a new article (only for logged-in users)
router.post("/", ensureAuthenticated, async (req, res) => {
  try {
    const { title, content } = req.body;

    // Generate summary via AI service
    const summaryResponse = await axios.post("http://18.116.80.128:3002/summarize", {
      article: content,
    });
    const summary = summaryResponse.data.summary;

    const newArticle = new Article({
      title,
      content,
      summary,
      author: req.user.name,
      userId: req.user._id,
    });
    const savedArticle = await newArticle.save();

    res.status(201).json(savedArticle);
  } catch (error) {
    res.status(500).json({ message: "Error saving article" });
  }
});

module.exports = router;
