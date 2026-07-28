const express = require("express");
const cors = require("cors");
require("dotenv").config();

const chatRoutes = require("./routes/chatRoutes");
const sessionRoutes = require("./routes/sessionRoutes");

const app = express();

const PORT = process.env.PORT || 5000;

/*
==================================
Middleware
==================================
*/

app.use(cors({

    origin: "*",

    methods: ["GET", "POST", "DELETE"],

    credentials: false,

    exposedHeaders: [

        "X-Model-Name",

        "X-Model-ID",

        "X-Model-Reason"

    ]

}));

app.use(express.json({

    limit: "2mb"

}));

app.use(express.urlencoded({

    extended: true

}));

/*
==================================
Health Check
==================================
*/

app.get("/", (req, res) => {

    res.status(200).json({

        success: true,

        message: "🚀 Enlivonex AI Backend is Running"

    });

});

/*
==================================
Routes
==================================
*/

app.use("/api", chatRoutes);

app.use("/api", sessionRoutes);

/*
==================================
404 Handler
==================================
*/

app.use((req, res) => {

    res.status(404).json({

        success: false,

        message: "API Route Not Found"

    });

});

/*
==================================
Global Error Handler
==================================
*/

app.use((err, req, res, next) => {

    console.error(err);

    res.status(500).json({

        success: false,

        message: "Unexpected Server Error"

    });

});

/*
==================================
Server
==================================
*/

app.listen(PORT, () => {

    console.log(`🚀 Enlivonex AI Backend running on http://localhost:${PORT}`);

});