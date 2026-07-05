const express = require("express");
const cors = require("cors");

const chatRoutes = require("./routes/chatRoutes");

const app = express();

const PORT = 5000;

// Middlewares
app.use(cors());
app.use(express.json());

// Home Route
app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "🚀 Enlivonex AI Backend is Running"
    });
});

// AI Routes
app.use("/api", chatRoutes);

// Start Server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});