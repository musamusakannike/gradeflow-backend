"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const morgan_1 = __importDefault(require("morgan"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const db_config_1 = __importDefault(require("./config/db.config"));
const auth_route_1 = __importDefault(require("./routes/auth.route"));
const class_route_1 = __importDefault(require("./routes/class.route"));
const subject_route_1 = __importDefault(require("./routes/subject.route"));
const score_route_1 = __importDefault(require("./routes/score.route"));
const term_route_1 = __importDefault(require("./routes/term.route"));
const admin_route_1 = __importDefault(require("./routes/admin.route"));
const teacher_route_1 = __importDefault(require("./routes/teacher.route"));
const student_route_1 = __importDefault(require("./routes/student.route"));
// Initialize the Express application
const app = (0, express_1.default)();
// Connect to the database
(0, db_config_1.default)();
// Middleware
app.use(express_1.default.json());
app.use((0, morgan_1.default)("dev"));
app.use((0, cors_1.default)());
app.use((0, helmet_1.default)());
// Test server route
app.get("/", (req, res) => {
    res.json({
        status: "success",
        message: "Welcome to the API",
        data: null,
    });
});
// Routes
app.use("/api/v1/auth", auth_route_1.default);
app.use("/api/v1/class", class_route_1.default);
app.use("/api/v1/subject", subject_route_1.default);
app.use("/api/v1/score", score_route_1.default);
app.use("/api/v1/term", term_route_1.default);
app.use("/api/v1/admin", admin_route_1.default);
app.use("/api/v1/teacher", teacher_route_1.default);
app.use("/api/v1/student", student_route_1.default);
exports.default = app;
//# sourceMappingURL=app.js.map