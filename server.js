const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(
  "mongodb+srv://seniorj:newsfeed@cluster0.gngwr.mongodb.net/articles?retryWrites=true&w=majority&appName=Cluster0",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("Connected to MongoDB");
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
app.get("/", (req, res) => res.send("API is running"));

app.get("/api/articles", async (req, res) => {
  try {
    const articles = await Article.find().sort({ createdAt: -1 }); // Sort by most recent
    res.status(200).json(articles);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching articles" });
  }
});


app.get("/api/articles/:id", async (req, res) => {
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



app.post("/api/articles", async (req, res) => {
  try {
    const { title, content, author } = req.body;
    if (!title || !content) {
      return res.status(400).json({ message: "Title and content are required" });
    }

    const newArticle = new Article({ title, content, author });
    const savedArticle = await newArticle.save();

    res.status(201).json(savedArticle);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error saving article" });
  }
});

// Start Server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
