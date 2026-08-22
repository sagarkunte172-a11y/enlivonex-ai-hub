const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const chatRoutes = require("./routes/chatRoutes");
const sessionRoutes = require("./routes/sessionRoutes");
const contactRoutes = require("./routes/contactRoutes");
const codeAssistantRoutes = require("./routes/codeAssistantRoutes");
const workspaceRoutes = require("./routes/workspaceRoutes");
const projectRoutes = require("./routes/projectRoutes");

const app = express();

const PORT =
    process.env.PORT || 5000;


/*
=====================================================
DATABASE
=====================================================
*/

connectDB();


/*
=====================================================
CORS
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


/*
=====================================================
BODY PARSER
=====================================================
*/

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
REQUEST LOGGER
=====================================================
*/

app.use(
    (req, res, next) => {

        console.log(
            `[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`
        );

        next();

    }
);


/*
=====================================================
HEALTH CHECK
=====================================================
*/

app.get(
    "/",
    (req, res) => {

        res.status(200).json({

            success: true,

            service:
                "Enlivonex AI Backend",

            status:
                "running"

        });

    }
);


/*
=====================================================
API HEALTH CHECK
=====================================================
*/

app.get(
    "/api/health",
    (req, res) => {

        res.status(200).json({

            success: true,

            service:
                "Enlivonex AI Hub",

            status:
                "online",

            ollama:
                "local",

            timestamp:
                new Date().toISOString()

        });

    }
);


/*
=====================================================
AUTHENTICATION
=====================================================

POST /api/auth/register
POST /api/auth/login

These routes intentionally remain public because
they create/establish authentication.
=====================================================
*/

app.use(
    "/api/auth",
    authRoutes
);


/*
=====================================================
AI CHAT
=====================================================

/api/chat
/api/sessions
/api/session/*
=====================================================
*/

app.use(
    "/api",
    chatRoutes
);


/*
=====================================================
SESSION MANAGEMENT
=====================================================
*/

app.use(
    "/api",
    sessionRoutes
);


/*
=====================================================
CONTACT
=====================================================
*/

app.use(
    "/api",
    contactRoutes
);


/*
=====================================================
WORKSPACE
=====================================================
*/

app.use(
    "/api",
    workspaceRoutes
);

app.use(
    "/api",
    projectRoutes
);


/*
=====================================================
CODE ASSISTANT
=====================================================

IMPORTANT:

This route is completely separate from normal AI chat.

Normal chat:
    Gemma 3 4B
    Qwen 2.5 3B

Code Assistant:
    ONLY Qwen 2.5 Coder 7B
=====================================================
*/

app.use(
    "/api",
    codeAssistantRoutes
);


/*
=====================================================
404 HANDLER
=====================================================
*/

app.use(
    (req, res) => {

        if (res.headersSent) {

            return;

        }

        res.status(404).json({

            success: false,

            message:
                "API Route Not Found",

            path:
                req.originalUrl

        });

    }
);


/*
=====================================================
GLOBAL ERROR HANDLER
=====================================================
*/

app.use(
    (err, req, res, next) => {

        console.error(
            "Server Error:",
            err
        );


        if (res.headersSent) {

            return next(err);

        }


        res.status(500).json({

            success: false,

            message:
                "Unexpected Server Error"

        });

    }
);


/*
=====================================================
START SERVER
=====================================================
*/

app.listen(
    PORT,
    "0.0.0.0",
    () => {

        console.log("");

        console.log(
            "======================================"
        );

        console.log(
            "🚀 Enlivonex AI Backend"
        );

        console.log(
            "======================================"
        );

        console.log(
            `📡 Port       : ${PORT}`
        );

        console.log(
            "🤖 AI         : Ollama Local"
        );

        console.log(
            "💬 Chat       : /api/chat"
        );

        console.log(
            "💻 Coding     : /api/code-assistant"
        );

        console.log(
            "🔐 Auth       : /api/auth"
        );

        console.log(
            "❤️  Health     : /api/health"
        );

        console.log(
            "======================================"
        );

        console.log("");

    }
);