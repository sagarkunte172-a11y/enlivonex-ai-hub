const Session = require("../models/Session");

/*
==================================
Create Session
==================================
*/

async function createSession(

    userId = null,

    title = "New Chat"

) {

    try {

        const sessionData = {

            title

        };

        if (userId) {

            sessionData.userId = userId;

        }

        return await Session.create(sessionData);

    }

    catch (error) {

        throw error;

    }

}

/*
==================================
Get Sessions By User
==================================
*/

async function getSessionsByUser(

    userId = null

) {

    try {

        const filter = {

            isDeleted: false

        };

        if (userId) {

            filter.userId = userId;

        }

        return await Session.find(filter)

            .sort({

                updatedAt: -1

            })

            .lean();

    }

    catch (error) {

        throw error;

    }

}

/*
==================================
Get Session By ID
==================================
*/

async function getSessionById(sessionId) {

    try {

        return await Session.findOne({

            _id: sessionId,

            isDeleted: false

        });

    }

    catch (error) {

        throw error;

    }

}

/*
==================================
Rename Session
==================================
*/

async function renameSession(

    sessionId,

    title

) {

    try {

        return await Session.findByIdAndUpdate(

            sessionId,

            {

                title,

                updatedAt: new Date()

            },

            {

                new: true

            }

        );

    }

    catch (error) {

        throw error;

    }

}

/*
==================================
Update Last Message
==================================
*/

async function updateLastMessage(

    sessionId,

    lastMessage,

    lastModel

) {

    try {

        return await Session.findByIdAndUpdate(

            sessionId,

            {

                lastMessage,

                lastModel,

                updatedAt: new Date()

            },

            {

                new: true

            }

        );

    }

    catch (error) {

        throw error;

    }

}

/*
==================================
Touch Session
Updates updatedAt
==================================
*/

async function touchSession(

    sessionId

) {

    try {

        return await Session.findByIdAndUpdate(

            sessionId,

            {

                updatedAt: new Date()

            },

            {

                new: true

            }

        );

    }

    catch (error) {

        throw error;

    }

}

/*
==================================
Pin Session
==================================
*/

async function pinSession(

    sessionId,

    isPinned

) {

    try {

        return await Session.findByIdAndUpdate(

            sessionId,

            {

                isPinned

            },

            {

                new: true

            }

        );

    }

    catch (error) {

        throw error;

    }

}

/*
==================================
Archive Session
==================================
*/

async function archiveSession(

    sessionId,

    isArchived

) {

    try {

        return await Session.findByIdAndUpdate(

            sessionId,

            {

                isArchived

            },

            {

                new: true

            }

        );

    }

    catch (error) {

        throw error;

    }

}

/*
==================================
Soft Delete Session
==================================
*/

async function deleteSession(

    sessionId

) {

    try {

        return await Session.findByIdAndUpdate(

            sessionId,

            {

                isDeleted: true,

                updatedAt: new Date()

            },

            {

                new: true

            }

        );

    }

    catch (error) {

        throw error;

    }

}

/*
==================================
Restore Session
==================================
*/

async function restoreSession(

    sessionId

) {

    try {

        return await Session.findByIdAndUpdate(

            sessionId,

            {

                isDeleted: false,

                updatedAt: new Date()

            },

            {

                new: true

            }

        );

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

    createSession,

    getSessionsByUser,

    getSessionById,

    renameSession,

    updateLastMessage,

    touchSession,

    pinSession,

    archiveSession,

    deleteSession,

    restoreSession

};