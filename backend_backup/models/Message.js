const mongoose = require("mongoose");

/*
==================================
Message Schema
==================================
*/

const messageSchema = new mongoose.Schema(

    {

        /*
        ==================================
        Session Reference
        ==================================
        */

        sessionId: {

            type: mongoose.Schema.Types.ObjectId,

            ref: "Session",

            required: true

        },

        /*
        ==================================
        Sender
        ==================================
        */

        role: {

            type: String,

            enum: [

                "user",

                "assistant",

                "system"

            ],

            required: true

        },

        /*
        ==================================
        Message Content
        ==================================
        */

        content: {

            type: String,

            required: true,

            trim: true

        },

        /*
        ==================================
        AI Model Information
        ==================================
        */

        model: {

            name: {

                type: String,

                default: ""

            },

            id: {

                type: String,

                default: ""

            },

            reason: {

                type: String,

                default: ""

            }

        },

        /*
        ==================================
        Future Attachment Support
        ==================================
        */

        attachment: {

            type: String,

            default: null

        },

        attachmentType: {

            type: String,

            default: null

        },

        /*
        ==================================
        Streaming Status
        ==================================
        */

        isStreaming: {

            type: Boolean,

            default: false

        },

        /*
        ==================================
        Message Status
        ==================================
        */

        isEdited: {

            type: Boolean,

            default: false

        },

        isDeleted: {

            type: Boolean,

            default: false

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

    "Message",

    messageSchema

);