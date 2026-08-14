const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");

const chatRoutes = require("./routes/chatRoutes");
const sessionRoutes = require("./routes/sessionRoutes");

const app = express();

const PORT = process.env.PORT || 5000;

/*
==================================
MongoDB
==================================
*/

connectDB();

/*
==================================
Middleware
==================================
*/

app.use(cors());

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

/*
==================================
Health Check
==================================
*/

app.get("/", (req, res) => {

    res.json({

        success: true,

        message: "🚀 Enlivonex AI Backend Running"

    });

});

/*
==================================
API ROUTES
==================================
*/

app.use("/api", sessionRoutes);

app.use("/api", chatRoutes);

/*
==================================
404
==================================
*/

app.use((req, res) => {

    res.status(404).json({

        success: false,

        message: "Route Not Found"

    });

});

/*
==================================
Error Handler
==================================
*/

app.use((err, req, res, next) => {

    console.error(err);

    res.status(500).json({

        success: false,

        message: "Internal Server Error"

    });

});

app.listen(PORT, () => {

    console.log(`🚀 Backend Running : http://localhost:${PORT}`);

});