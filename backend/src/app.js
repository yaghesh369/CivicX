const express = require("express");
const cors = require("cors");
const path = require("path");
const rateLimit = require("express-rate-limit");
const { errorHandler } = require("./middleware/errorHandler");

const authRoutes = require("./modules/auth/auth.routes");
const complaintsRoutes = require("./modules/complaints/complaints.routes");
const complaintsAiRoutes = require("./modules/complaints/ai.routes");
const complaintsFeedbackRoutes = require("./modules/feedback/feedback.routes");
const departmentsRoutes = require("./modules/departments/departments.routes");
const workersRoutes = require("./modules/workers/workers.routes");
const notificationsRoutes = require("./modules/notifications/notifications.routes");
const adminRoutes = require("./modules/admin/admin.routes");

const app = express();

app.use(
  cors({
    origin: (process.env.CORS_ORIGIN || "*").split(","),
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded complaint images statically.
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

// Basic API throttling (tune per endpoint as needed).
const apiLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 300 });
app.use("/api", apiLimiter);

app.get("/", (req, res) => res.json({ status: "CivicX backend running." }));
app.get("/health", (req, res) => res.json({ status: "ok" }));

app.use("/api/auth", authRoutes);
app.use("/api/complaints", complaintsRoutes);
app.use("/api/complaints", complaintsAiRoutes); // /:id/ai-analysis, /:id/duplicate-group
app.use("/api/complaints", complaintsFeedbackRoutes); // /:id/feedback
app.use("/api/departments", departmentsRoutes);
app.use("/api/workers", workersRoutes);
app.use("/api/notifications", notificationsRoutes);
app.use("/api/admin", adminRoutes);

app.use((req, res) => res.status(404).json({ error: "Route not found." }));
app.use(errorHandler);

module.exports = app;
