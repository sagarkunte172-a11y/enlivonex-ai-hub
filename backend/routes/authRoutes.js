const express = require("express");

const router =
    express.Router();


/*
==================================
AUTH CONTROLLER
==================================
*/

const {

    register,
    login

} = require(
    "../controllers/authController"
);


/*
==================================
REGISTER
==================================
*/

router.post(
    "/register",
    register
);


/*
==================================
LOGIN
==================================
*/

router.post(
    "/login",
    login
);


/*
==================================
EXPORT
==================================
*/

module.exports = router;