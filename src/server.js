import express from "express"
import cors from "cors"
import helmet from "helmet"
import morgan from "morgan"
import dotenv from "dotenv"
import connectDB from "./config/database.js"
import { errorHandler, notFound } from "./middleware/errorMiddleware.js"

// Routes
import authRoutes from "./routes/authRoutes.js"
import schoolRoutes from "./routes/schoolRoutes.js"
import userRoutes from "./routes/userRoutes.js"
import academicRoutes from "./routes/academicRoutes.js"
import classRoutes from "./routes/classRoutes.js"
import subjectRoutes from "./routes/subjectRoutes.js"
import studentRoutes from "./routes/studentRoutes.js"
import resultRoutes from "./routes/resultRoutes.js"
import feeRoutes from "./routes/feeRoutes.js"
import parentRoutes from "./routes/parentRoutes.js"
import dashboardRoutes from "./routes/dashboardRoutes.js"
import attendanceRoutes from "./routes/attendanceRoutes.js"
import reportRoutes from "./routes/reportRoutes.js"
import notificationRoutes from "./routes/notificationRoutes.js"
import eventRoutes from "./routes/eventRoutes.js"
// Add the import for message routes
import messageRoutes from "./routes/messageRoutes.js"

// Load env vars
dotenv.config()

// Connect to database
connectDB()

const app = express()

// Middleware
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cors())
app.use(helmet())
app.use(morgan("dev"))

// Routes
app.use("/api/auth", authRoutes)
app.use("/api/schools", schoolRoutes)
app.use("/api/users", userRoutes)
app.use("/api/academic", academicRoutes)
app.use("/api/classes", classRoutes)
app.use("/api/subjects", subjectRoutes)
app.use("/api/students", studentRoutes)
app.use("/api/results", resultRoutes)
app.use("/api/fees", feeRoutes)
app.use("/api/parents", parentRoutes)
app.use("/api/dashboard", dashboardRoutes)
app.use("/api/attendance", attendanceRoutes)
app.use("/api/reports", reportRoutes)
app.use("/api/notifications", notificationRoutes)
app.use("/api/events", eventRoutes)
// Add the message routes
app.use("/api/messages", messageRoutes)

// Error handling middleware
app.use(notFound)
app.use(errorHandler)

const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`)
})

export default app
