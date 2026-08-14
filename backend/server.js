const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");

/*
=====================================================
ROUTES
=====================================================
*/

const chatRoutes = require("./routes/chatRoutes");
const sessionRoutes = require("./routes/sessionRoutes");
const contactRoutes = require("./routes/contactRoutes");

const app = express();

const PORT = process.env.PORT || 5000;

/*
=====================================================
CONNECT MONGODB
=====================================================
*/

connectDB();

/*
=====================================================
MIDDLEWARE
=====================================================
*/

app.use(
    cors({
        origin: "*",

        methods: [
            "GET",
            "POST",
            "PUT",
            "DELETE",
            "OPTIONS"
        ],

        credentials: false,

        exposedHeaders: [
            "X-Model-Name",
            "X-Model-ID",
            "X-Model-Reason"
        ]
    })
);

app.use(
    express.json({
        limit: "2mb"
    })
);

app.use(
    express.urlencoded({
        extended: true,
        limit: "2mb"
    })
);

/*
=====================================================
HEALTH CHECK
=====================================================
*/

app.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        message: "🚀 Enlivonex AI Backend is Running"
    });
});

/*
=====================================================
API ROUTES
=====================================================
*/

/*
AI CHAT
Existing AI Chat route.
DO NOT CHANGE ITS INTERNAL LOGIC.
*/
app.use("/api", chatRoutes);

/*
SESSION MANAGEMENT
*/
app.use("/api", sessionRoutes);

/*
CONTACT FORM
*/
app.use("/api", contactRoutes);

/*
=====================================================
404 HANDLER
=====================================================
*/

app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "API Route Not Found"
    });
});

/*
=====================================================
GLOBAL ERROR HANDLER
=====================================================
*/

app.use((err, req, res, next) => {
    console.error("Server Error:", err);

    res.status(500).json({
        success: false,
        message: "Unexpected Server Error"
    });
});

/*
=====================================================
START SERVER
=====================================================
*/

app.listen(PORT, "0.0.0.0", () => {
    console.log(
        `🚀 Enlivonex AI Backend running on port ${PORT}`
    );
});