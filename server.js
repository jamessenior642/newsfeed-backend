const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const axios = require("axios");
const winston = require("winston");

const app = express();
app.use(cors());
app.use(express.json());

// Setup Winston logger
const logger = winston.createLogger({
  level: "info", // Default log level
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp(),
    winston.format.printf(({ timestamp, level, message }) => {
      return `[${timestamp}] ${level}: ${message}`;
    })
  ),
  transports: [
    new winston.transports.Console({ format: winston.format.simple() }), // Logs to console
    new winston.transports.File({ filename: "server.log" }), // Logs to a file
  ],
});

// Connect to MongoDB
mongoose.connect(
  "mongodb+srv://seniorj:newsfeed@cluster0.gngwr.mongodb.net/articles?retryWrites=true&w=majority&appName=Cluster0",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);

const db = mongoose.connection;
db.on("error", (error) => {
  logger.error("MongoDB connection error:", error);  // Log MongoDB connection errors
});
db.once("open", () => {
  logger.info("Connected to MongoDB");  // Log successful connection
});

// Define Article Schema
const articleSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  summary: { type: String, default: "" },
  author: { type: String, default: "Anonymous" },
  createdAt: { type: Date, default: Date.now },
});

const Article = mongoose.model("Article", articleSchema);

// Routes
app.get("/", (req, res) => {
  logger.info("API is running");
  res.send("API is running");
});

app.get("/api/articles", async (req, res) => {
  try {
    const articles = await Article.find().sort({ createdAt: -1 }); // Sort by most recent
    logger.info("Fetched articles from database");
    res.status(200).json(articles);
  } catch (error) {
    logger.error("Error fetching articles:", error);
    res.status(500).json({ message: "Error fetching articles" });
  }
});

app.get("/api/articles/:id", async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    if (!article) {
      logger.warn(`Article with id ${req.params.id} not found`);
      return res.status(404).json({ message: "Article not found" });
    }
    logger.info(`Fetched article with id ${req.params.id}`);
    res.status(200).json(article);
  } catch (error) {
    logger.error("Error fetching article:", error);
    res.status(500).json({ message: "Error fetching article" });
  }
});

app.post("/api/articles", async (req, res) => {
  try {
    const { title, content, author } = req.body;
    if (!title || !content) {
      logger.warn("Title and content are required");
      return res.status(400).json({ message: "Title and content are required" });
    }

    // Generate summary
    const summaryResponse = await axios.post("http://18.116.80.128:3002/summarize", {
      article: content,
    });
    const summary = summaryResponse.data.summary;

    // Save article with summary
    const newArticle = new Article({ title, content, author, summary });
    const savedArticle = await newArticle.save();

    logger.info(`Article "${savedArticle.title}" saved successfully`);
    res.status(201).json(savedArticle);
  } catch (error) {
    logger.error("Error saving article:", error);
    res.status(500).json({ message: "Error saving article" });
  }
});

app.post("/summarize", async (req, res) => {
  try {
    const response = await axios.post("http://18.116.80.128:3002/summarize", {
      article: req.body.article,
    });
    logger.info("Summary generated successfully");
    res.json({ summary: response.data.summary });
  } catch (error) {
    logger.error("Error contacting AI service:", error);
    res.status(500).json({ error: "Error contacting AI service" });
  }
});

// Start Server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});
