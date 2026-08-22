const jwt = require("jsonwebtoken");


/*
==================================
JWT SECRET
==================================
*/

function getJwtSecret() {

    const secret = process.env.JWT_SECRET;

    if (!secret) {
        throw new Error("JWT_SECRET is not configured.");
    }

    return secret;

}


/*
==================================
AUTHENTICATION MIDDLEWARE
==================================

Authentication source:

    Authorization: Bearer <JWT>

Trusted identity:

    req.user.id

IMPORTANT:

The client MUST NOT be trusted for
user identity.

Do NOT use:

    req.body.userId
    req.body.requesterId
    req.query.userId
    req.query.requesterId

Identity must always come from
the verified JWT.
==================================
*/

function requireAuth(req, res, next) {

    try {

        /*
        ==================================
        AUTHORIZATION HEADER
        ==================================
        */

        const authHeader =
            req.headers.authorization;

        if (
            !authHeader ||
            !authHeader.startsWith("Bearer ")
        ) {

            return res.status(401).json({

                success: false,

                message:
                    "Unauthorized: Authentication token required"

            });

        }


        /*
        ==================================
        EXTRACT TOKEN
        ==================================
        */

        const token =
            authHeader.substring(7).trim();

        if (!token) {

            return res.status(401).json({

                success: false,

                message:
                    "Unauthorized: Authentication token required"

            });

        }


        /*
        ==================================
        VERIFY JWT
        ==================================
        */

        const decoded =
            jwt.verify(
                token,
                getJwtSecret()
            );


        /*
        ==================================
        VALIDATE JWT PAYLOAD
        ==================================
        */

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


        /*
        ==================================
        TRUSTED USER IDENTITY
        ==================================

        The identity below comes ONLY from
        the cryptographically verified JWT.

        Client-provided IDs are ignored.
        ==================================
        */

        req.user = {

            id: decoded.id

        };


        /*
        ==================================
        CONTINUE REQUEST
        ==================================
        */

        next();

    }

    catch (error) {

        console.error(
            "Authentication Error:",
            error.message
        );


        /*
        ==================================
        EXPIRED TOKEN
        ==================================
        */

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


        /*
        ==================================
        INVALID TOKEN
        ==================================
        */

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


        /*
        ==================================
        AUTHENTICATION CONFIGURATION /
        ==================================
        */

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


        /*
        ==================================
        UNEXPECTED AUTH ERROR
        ==================================
        */

        return res.status(500).json({

            success: false,

            message:
                "Authentication service error"

        });

    }

}

function optionalAuth(req, res, next) {

    if (!req.headers.authorization) {

        req.user = {
            id: null
        };

        return next();

    }

    return requireAuth(req, res, next);

}


/*
==================================
EXPORT
==================================
*/

module.exports = {

    requireAuth,

    optionalAuth

};