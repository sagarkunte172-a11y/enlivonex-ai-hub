const mongoose = require("mongoose");

/*
==================================
Session Schema
==================================
*/

const sessionSchema = new mongoose.Schema(

    {

        /*
        ==================================
        User Reference
        ==================================
        */

        userId: {

            type: mongoose.Schema.Types.ObjectId,

            ref: "User",

            default: null,

            required: false

        },

        /*
        ==================================
        Session Title
        ==================================
        */

        title: {

            type: String,

            default: "New Chat",

            trim: true

        },

        /*
        ==================================
        Session Status
        ==================================
        */

        isPinned: {

            type: Boolean,

            default: false

        },

        isArchived: {

            type: Boolean,

            default: false

        },

        isDeleted: {

            type: Boolean,

            default: false

        },

        /*
        ==================================
        Last Message Preview
        ==================================
        */

        lastMessage: {

            type: String,

            default: ""

        },

        /*
        ==================================
        Last Used AI Model
        ==================================
        */

        lastModel: {

            type: String,

            default: "gemma3:4b"

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

    "Session",

    sessionSchema

);