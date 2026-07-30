const mongoose = require("mongoose");

/*
==================================
Credit Schema
==================================
*/

const creditSchema = new mongoose.Schema(

    {

        /*
        ==================================
        User Reference
        ==================================
        */

        userId: {

            type: mongoose.Schema.Types.ObjectId,

            ref: "User",

            required: true,

            unique: true

        },

        /*
        ==================================
        Available Credits
        ==================================
        */

        totalCredits: {

            type: Number,

            default: 100

        },

        remainingCredits: {

            type: Number,

            default: 100

        },

        usedCredits: {

            type: Number,

            default: 0

        },

        /*
        ==================================
        Daily Free Credits
        ==================================
        */

        dailyCredits: {

            type: Number,

            default: 25

        },

        lastDailyClaim: {

            type: Date,

            default: Date.now

        },

        /*
        ==================================
        Bonus Credits
        ==================================
        */

        bonusCredits: {

            type: Number,

            default: 0

        },

        /*
        ==================================
        Subscription
        ==================================
        */

        subscription: {

            type: String,

            enum: [

                "free",

                "pro",

                "enterprise"

            ],

            default: "free"

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

    "Credit",

    creditSchema

);