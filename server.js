const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const winston = require("winston");
require("dotenv").config(); // Load environment variables
require("./config/passport-config"); // Passport configuration

const app = express();
FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";
const isProduction = process.env.NODE_ENV === 'production';
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
  origin: FRONTEND_URL, // Allow frontend origin
  credentials: true, // Allow credentials (cookies)
}));
app.use(express.json());
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: isProduction,                // Only use secure cookies in production
      httpOnly: true,
      sameSite: isProduction ? 'none' : 'lax', // 'none' for cross-site in prod, 'lax' (or 'strict') locally
      // domain: (omit or conditionally set if you own a single top-level domain)
    },
    proxy: isProduction,
  })
);

app.use(passport.initialize());
app.use(passport.session());
// domain: process.env.NODE_ENV === 'production' ? 'newsfeed-backend.onrender.com' : undefined, // Set the domain to match the frontend URL
// Routes
app.use("/auth", require("./routes/auth")); // Auth routes
app.use("/api/articles", require("./routes/articles")); // Article routes
app.use("/api/users", require("./routes/users"));

// Root route
app.get("/", (req, res) => {
  logger.info("API is running");
  res.send("API is running");
});

// Start the server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => logger.info(`Server running on port ${PORT}`));
