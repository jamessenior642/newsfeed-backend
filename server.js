const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const winston = require("winston");
require("dotenv").config(); // Load environment variables
require("./config/passport-config"); // Passport configuration

const app = express();

// Setup logger
const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp(),
    winston.format.printf(({ timestamp, level, message }) => `[${timestamp}] ${level}: ${message}`)
  ),
  transports: [
    new winston.transports.Console({ format: winston.format.simple() }),
    new winston.transports.File({ filename: "./logs/server.log" }),
  ],
});

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => logger.info("Connected to MongoDB"))
  .catch((error) => logger.error("MongoDB connection error:", error));

// Middleware
app.use(cors({
  origin: "http://localhost:3000", // Allow frontend origin
  credentials: true, // Allow credentials (cookies)
}));
app.use(express.json());
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // Set to `true` for HTTPS (for local development, leave it as false)
      httpOnly: true, // Prevent JavaScript access to cookies
      sameSite: "strict", // Ensures cookies are only sent for same-site requests
    },
  })
);
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use("/auth", require("./routes/auth")); // Auth routes
app.use("/api/articles", require("./routes/articles")); // Article routes

// Root route
app.get("/", (req, res) => {
  logger.info("API is running");
  res.send("API is running");
});

// Start the server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => logger.info(`Server running on port ${PORT}`));
