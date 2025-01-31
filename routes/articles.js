const express = require("express");
const axios = require("axios");
const Article = require("../models/Article");
const ensureAuthenticated = require("../middleware/ensureAuthenticated");

const router = express.Router();
const AI_URL = process.env.AI_API_URL;

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
    const summaryResponse = await axios.post(AI_URL, {
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

// Get articles by a specific user
router.get("/user/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    const articles = await Article.find({ userId }).sort({ createdAt: -1 }); // Get articles by userId
    res.status(200).json(articles);
  } catch (error) {
    console.error("Error fetching user's articles:", error);
    res.status(500).json({ message: "Error fetching user's articles" });
  }
});

router.delete("/:id", ensureAuthenticated, async (req, res) => {
  try {
    const articleId = req.params.id;
    const article = await Article.findById(articleId);

    if (!article) {
      return res.status(404).json({ message: "Article not found" });
    }

    // Check ownership
    if (article.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You are not authorized to delete this article." });
    }

    await article.deleteOne();
    res.status(200).json({ message: "Article deleted successfully." });
  } catch (error) {
    console.error("Error deleting article:", error);
    res.status(500).json({ message: "Error deleting article" });
  }
});



module.exports = router;
