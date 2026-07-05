const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

const PORT = 5000;

app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "🚀 Welcome to Enlivonex AI Hub Backend",
        version: "v0.1"
    });
});

app.listen(PORT, () => {
    console.log("=================================");
    console.log("🚀 Enlivonex Backend Running");
    console.log(`🌐 Server : http://localhost:${PORT}`);
    console.log("=================================");
});