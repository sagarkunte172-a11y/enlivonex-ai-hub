
const jwt = require("jsonwebtoken");

/*==================================
JWT SECRET
==================================*/

function getJwtSecret() {
    const secret = process.env.JWT_SECRET;

    if (!secret) {
        throw new Error("JWT_SECRET is not configured.");
    }

    return secret;
}


/*==================================
EXTRACT BEARER TOKEN
==================================*/

function extractBearerToken(req) {
    const authHeader = req.headers.authorization;

    if (
        !authHeader ||
        typeof authHeader !== "string"
    ) {
        return null;
    }

    if (!authHeader.startsWith("Bearer ")) {
        return null;
    }

    const token = authHeader
        .substring(7)
        .trim();

    return token || null;
}


/*==================================
REQUIRE AUTHENTICATION
==================================*/

function requireAuth(req, res, next) {
    try {

        /*==================================
        EXTRACT TOKEN
        ==================================*/

        const token = extractBearerToken(req);

        if (!token) {
            return res.status(401).json({
                success: false,
                message:
                    "Unauthorized: Authentication token required"
            });
        }


        /*==================================
        VERIFY JWT
        ==================================*/

        const decoded = jwt.verify(
            token,
            getJwtSecret()
        );


        /*==================================
        VALIDATE PAYLOAD
        ==================================*/

        if (
            !decoded ||
            !decoded.id
        ) {
            return res.status(401).json({
                success: false,
                message:
                    "Unauthorized: Invalid authentication token"
            });
        }


        /*==================================
        TRUSTED USER IDENTITY
        ==================================*/

        req.user = {
            id: String(decoded.id)
        };


        /*==================================
        CONTINUE
        ==================================*/

        return next();

    } catch (error) {

        console.error(
            "Authentication Error:",
            error.message
        );


        /*==================================
        JWT SECRET CONFIGURATION ERROR
        ==================================*/

        if (
            error.message ===
            "JWT_SECRET is not configured."
        ) {
            return res.status(500).json({
                success: false,
                message:
                    "Authentication service configuration error"
            });
        }


        /*==================================
        EXPIRED TOKEN
        ==================================*/

        if (
            error.name ===
            "TokenExpiredError"
        ) {
            return res.status(401).json({
                success: false,
                message:
                    "Unauthorized: Authentication token expired"
            });
        }


        /*==================================
        INVALID TOKEN
        ==================================*/

        if (
            error.name ===
            "JsonWebTokenError"
        ) {
            return res.status(401).json({
                success: false,
                message:
                    "Unauthorized: Invalid authentication token"
            });
        }


        /*==================================
        UNEXPECTED AUTH ERROR
        ==================================*/

        return res.status(500).json({
            success: false,
            message:
                "Authentication service error"
        });
    }
}


/*==================================
OPTIONAL AUTHENTICATION
==================================

Authenticated user:
    req.user.id = verified JWT user ID

Guest user:
    req.user.id = null

Important:
If a token exists, it MUST be valid.
An invalid token is never silently
converted into guest access.
==================================*/

function optionalAuth(req, res, next) {

    const authHeader =
        req.headers.authorization;


    /*==================================
    NO AUTH HEADER → GUEST
    ==================================*/

    if (!authHeader) {

        req.user = {
            id: null
        };

        return next();
    }


    /*==================================
    AUTH HEADER EXISTS
    ==================================

    If a token is supplied, requireAuth
    verifies it.
    ==================================*/

    return requireAuth(
        req,
        res,
        next
    );
}


/*==================================
EXPORTS
==================================*/

module.exports = {
    requireAuth,
    optionalAuth
};