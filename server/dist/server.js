import dotenv from "dotenv";
import express from "express";
import session from "express-session";
import path from "path";
import { fileURLToPath } from "url";
dotenv.config();
// Import the routes
import routes from "./routes/index.js";
const app = express();
const PORT = process.env.PORT || 3001;
// Get __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Configure session middleware
app.use(session({
    secret: process.env.SESSION_SECRET ||
        "weather-dashboard-secret-key-change-in-production",
    resave: false,
    saveUninitialized: true,
    cookie: {
        secure: process.env.NODE_ENV === "production", // Use secure cookies in production
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    },
}));
// Serve static files from client dist folder
app.use(express.static(path.join(__dirname, "../../client/dist")));
// Implement middleware for parsing JSON and urlencoded form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Implement middleware to connect the routes
app.use(routes);
// Start the server on the port
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
