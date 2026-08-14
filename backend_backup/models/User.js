const mongoose = require("mongoose");

/*
==================================
User Schema
==================================
*/

const userSchema = new mongoose.Schema(

    {

        /*
        ==================================
        Basic Information
        ==================================
        */

        username: {

            type: String,

            required: true,

            trim: true

        },

        email: {

            type: String,

            required: true,

            unique: true,

            lowercase: true,

            trim: true

        },

        password: {

            type: String,

            default: null

        },

        /*
        ==================================
        Google Authentication
        ==================================
        */

        googleId: {

            type: String,

            default: null

        },

        /*
        ==================================
        Profile
        ==================================
        */

        avatar: {

            type: String,

            default: ""

        },

        bio: {

            type: String,

            default: ""

        },

        /*
        ==================================
        Account Role
        ==================================
        */

        role: {

            type: String,

            enum: [

                "user",

                "admin"

            ],

            default: "user"

        },

        /*
        ==================================
        Credits
        ==================================
        */

        credits: {

            type: Number,

            default: 100

        },

        /*
        ==================================
        Subscription
        ==================================
        */

        plan: {

            type: String,

            enum: [

                "free",

                "pro",

                "enterprise"

            ],

            default: "free"

        },

        /*
        ==================================
        Account Status
        ==================================
        */

        isVerified: {

            type: Boolean,

            default: false

        },

        isBlocked: {

            type: Boolean,

            default: false

        },

        /*
        ==================================
        User Preferences
        ==================================
        */

        settings: {

            theme: {

                type: String,

                default: "light"

            },

            language: {

                type: String,

                default: "en"

            }

        },

        /*
        ==================================
        Login Information
        ==================================
        */

        lastLogin: {

            type: Date,

            default: null

        }

    },

    {

        timestamps: true

    }

);

/*
==================================
Export Model
==================================
*/

module.exports = mongoose.model(

    "User",

    userSchema

);