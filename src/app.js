const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const helmet = require("helmet");
const connectDB = require("./config/db.config");

const authRoutes = require('./routes/auth.route');
const classRoutes = require('./routes/class.route');
const subjectRoutes = require('./routes/subject.route');

const app = express();
connectDB();
app.use(express.json());
app.use(morgan("dev"));
app.use(cors());
app.use(helmet());

// Test server
app.get("/", (req, res) => {
  res.json({ status: "success", message: "Welcome to the API", data: null });
});

// Routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/class", classRoutes);
app.use("/api/v1/subject", subjectRoutes);

module.exports = app;
