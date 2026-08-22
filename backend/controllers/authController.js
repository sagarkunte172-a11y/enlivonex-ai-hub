const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const User = require("../models/User");

/*
==================================
JWT SECRET
==================================
*/

function getJwtSecret() {

    const secret = process.env.JWT_SECRET;

    if (!secret) {
        throw new Error(
            "JWT_SECRET is not configured."
        );
    }

    return secret;
}


/*
==================================
Generate JWT
==================================
*/

function generateToken(userId) {

    return jwt.sign(
        {
            id: userId.toString()
        },
        getJwtSecret(),
        {
            expiresIn: "30d"
        }
    );

}


/*
==================================
Register
==================================
*/

exports.register = async (req, res) => {

    try {

        const {
            username,
            email,
            password
        } = req.body || {};


        /*
        ==================================
        Validation
        ==================================
        */

        if (
            !username ||
            !email ||
            !password
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Validation Error: Missing required fields"

            });

        }


        /*
        ==================================
        Normalize Input
        ==================================
        */

        const cleanUsername =
            username.trim();

        const cleanEmail =
            email.trim().toLowerCase();


        if (!cleanUsername || !cleanEmail) {

            return res.status(400).json({

                success: false,

                message:
                    "Validation Error: Username and email cannot be empty"

            });

        }


        /*
        ==================================
        Check Existing User
        ==================================
        */

        const userExists =
            await User.findOne({

                email: cleanEmail

            });


        if (userExists) {

            return res.status(409).json({

                success: false,

                message:
                    "User already exists"

            });

        }


        /*
        ==================================
        Password Hash
        ==================================
        */

        const hashedPassword =
            await bcrypt.hash(
                password,
                10
            );


        /*
        ==================================
        Create User
        ==================================
        */

        const user =
            await User.create({

                username:
                    cleanUsername,

                email:
                    cleanEmail,

                password:
                    hashedPassword

            });


        /*
        ==================================
        Generate Token
        ==================================
        */

        const token =
            generateToken(user._id);


        /*
        ==================================
        Response
        ==================================
        */

        return res.status(201).json({

            success: true,

            user: {

                id:
                    user._id,

                username:
                    user.username,

                email:
                    user.email

            },

            token

        });

    }

    catch (error) {

        console.error(
            "Register Error:",
            error
        );


        /*
        ==================================
        Duplicate Email Race Condition
        ==================================
        */

        if (
            error.code === 11000
        ) {

            return res.status(409).json({

                success: false,

                message:
                    "User already exists"

            });

        }


        return res.status(500).json({

            success: false,

            message:
                "Server error during registration"

        });

    }

};


/*
==================================
Login
==================================
*/

exports.login = async (req, res) => {

    try {

        const {
            email,
            password
        } = req.body || {};


        /*
        ==================================
        Validation
        ==================================
        */

        if (
            !email ||
            !password
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Validation Error: Missing email or password"

            });

        }


        /*
        ==================================
        Normalize Email
        ==================================
        */

        const cleanEmail =
            email.trim().toLowerCase();


        /*
        ==================================
        Find User
        ==================================
        */

        const user =
            await User.findOne({

                email:
                    cleanEmail

            });


        if (
            !user ||
            !user.password
        ) {

            return res.status(401).json({

                success: false,

                message:
                    "Invalid email or password"

            });

        }


        /*
        ==================================
        Blocked Account
        ==================================
        */

        if (user.isBlocked) {

            return res.status(403).json({

                success: false,

                message:
                    "Account is blocked"

            });

        }


        /*
        ==================================
        Verify Password
        ==================================
        */

        const isMatch =
            await bcrypt.compare(
                password,
                user.password
            );


        if (!isMatch) {

            return res.status(401).json({

                success: false,

                message:
                    "Invalid email or password"

            });

        }


        /*
        ==================================
        Update Last Login
        ==================================
        */

        user.lastLogin =
            new Date();

        await user.save();


        /*
        ==================================
        Generate Token
        ==================================
        */

        const token =
            generateToken(user._id);


        /*
        ==================================
        Response
        ==================================
        */

        return res.status(200).json({

            success: true,

            user: {

                id:
                    user._id,

                username:
                    user.username,

                email:
                    user.email

            },

            token

        });

    }

    catch (error) {

        console.error(
            "Login Error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Server error during login"

        });

    }

};