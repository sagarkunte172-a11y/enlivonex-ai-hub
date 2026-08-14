const Message = require("../models/Message");

/*
==================================
Save Message
==================================
*/

async function saveMessage(

    sessionId,

    role,

    content,

    model = {}

) {

    try {

        if (!sessionId) {

            throw new Error("Session ID is required.");

        }

        if (!role) {

            throw new Error("Role is required.");

        }

        if (!content) {

            throw new Error("Content is required.");

        }

        const message = await Message.create({

            sessionId,

            role,

            content,

            model

        });

        return message;

    }

    catch (error) {

        throw error;

    }

}

/*
==================================
Get Messages of Session
==================================
*/

async function getMessages(sessionId) {

    try {

        return await Message.find({

            sessionId,

            isDeleted: false

        })

        .sort({

            createdAt: 1

        })

        .lean();

    }

    catch (error) {

        throw error;

    }

}

/*
==================================
Get Single Message
==================================
*/

async function getMessageById(messageId) {

    try {

        return await Message.findById(messageId).lean();

    }

    catch (error) {

        throw error;

    }

}

/*
==================================
Update Message
==================================
*/

async function updateMessage(

    messageId,

    newContent

) {

    try {

        return await Message.findByIdAndUpdate(

            messageId,

            {

                content: newContent,

                isEdited: true

            },

            {

                new: true

            }

        ).lean();

    }

    catch (error) {

        throw error;

    }

}

/*
==================================
Soft Delete One Message
==================================
*/

async function deleteMessage(messageId) {

    try {

        return await Message.findByIdAndUpdate(

            messageId,

            {

                isDeleted: true

            },

            {

                new: true

            }

        ).lean();

    }

    catch (error) {

        throw error;

    }

}

/*
==================================
Soft Delete All Messages
==================================
*/

async function deleteMessagesBySession(

    sessionId

) {

    try {

        return await Message.updateMany(

            {

                sessionId,

                isDeleted: false

            },

            {

                isDeleted: true

            }

        );

    }

    catch (error) {

        throw error;

    }

}

/*
==================================
Permanent Delete Session Messages
==================================
*/

async function clearChat(sessionId) {

    try {

        return await Message.deleteMany({

            sessionId

        });

    }

    catch (error) {

        throw error;

    }

}

/*
==================================
Count Messages
==================================
*/

async function countMessages(sessionId) {

    try {

        return await Message.countDocuments({

            sessionId,

            isDeleted: false

        });

    }

    catch (error) {

        throw error;

    }

}

/*
==================================
Latest Message
==================================
*/

async function getLatestMessage(sessionId) {

    try {

        return await Message.findOne({

            sessionId,

            isDeleted: false

        })

        .sort({

            createdAt: -1

        })

        .lean();

    }

    catch (error) {

        throw error;

    }

}

/*
==================================
Exports
==================================
*/

module.exports = {

    saveMessage,

    getMessages,

    getMessageById,

    updateMessage,

    deleteMessage,

    deleteMessagesBySession,

    clearChat,

    countMessages,

    getLatestMessage

};