const express = require("express");

const router = express.Router();

const {
    sendContact
} = require("../controllers/contactController");

/*
=====================================================
CONTACT MESSAGE
=====================================================
*/

router.post(
    "/contact",
    sendContact
);

module.exports = router;