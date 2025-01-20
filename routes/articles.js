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

router.get("/:id", async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    if (!article) {
      return res.status(404).json({ message: "Article not found" });
    }
    res.status(200).json(article);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching article" });
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
