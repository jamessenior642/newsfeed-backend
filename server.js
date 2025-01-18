const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect("mongodb+srv://seniorj:newsfeed@cluster0.gngwr.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("Connected to MongoDB");
});

const articleSchema = new mongoose.Schema({
  title: String,
  content: String,
  summary: String,
  createdAt: { type: Date, default: Date.now },
});

const Article = mongoose.model("Article", articleSchema);

app.get("/", (req, res) => res.send("API is running"));
app.post("/api/articles", (req, res) => {
  const { article } = req.body;
  res.json({ message: "Article received", article });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));