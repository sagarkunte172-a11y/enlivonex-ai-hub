const MessageModel =
    require("../models/Message");

/*==================================
SAFE MODEL RESOLUTION
==================================*/

/*
Normally require("../models/Message") directly
returns the Mongoose model.

This fallback also protects against modules
exporting the model through .default or .Message.
*/

const Message =
    MessageModel?.default ||
    MessageModel?.Message ||
    MessageModel;

/*==================================
MODEL VALIDATION
==================================*/

function ensureMessageModel() {
    if (
        !Message ||
        typeof Message.find !== "function" ||
        typeof Message.create !== "function"
    ) {
        throw new Error(
            "Message model is not a valid Mongoose model. Check backend/models/Message.js and its import path."
        );
    }
}

/*==================================
SAFE LIMIT
==================================*/

function normalizeLimit(
    value,
    defaultValue,
    maximum
) {
    const numeric =
        Number(value);

    if (!Number.isFinite(numeric)) {
        return defaultValue;
    }

    return Math.max(
        1,
        Math.min(
            Math.floor(numeric),
            maximum
        )
    );
}

/*==================================
SAVE MESSAGE
==================================*/

async function saveMessage(
    sessionId,
    role,
    content,
    model = {}
) {
    ensureMessageModel();

    if (!sessionId) {
        throw new Error(
            "Session ID is required."
        );
    }

    if (!role) {
        throw new Error(
            "Role is required."
        );
    }

    if (
        typeof content !== "string" ||
        !content.trim()
    ) {
        throw new Error(
            "Content is required."
        );
    }

    return await Message.create({
        sessionId,
        role,
        content:
            content.trim(),
        model:
            model || {}
    });
}

/*==================================
GET ALL SESSION MESSAGES
==================================*/

async function getMessages(
    sessionId
) {
    ensureMessageModel();

    if (!sessionId) {
        throw new Error(
            "Session ID is required."
        );
    }

    return await Message.find({
        sessionId,
        isDeleted: false
    })
        .sort({
            createdAt: 1
        })
        .lean();
}

/*==================================
GET RECENT MESSAGES
Working Memory
==================================*/

async function getRecentMessages(
    sessionId,
    limit = 50
) {
    ensureMessageModel();

    if (!sessionId) {
        throw new Error(
            "Session ID is required."
        );
    }

    const safeLimit =
        normalizeLimit(
            limit,
            50,
            100
        );

    const messages =
        await Message.find({
            sessionId,
            isDeleted: false
        })
            .sort({
                createdAt: -1
            })
            .limit(safeLimit)
            .lean();

    /*
    MongoDB query is newest → oldest.

    Ollama needs chronological order:
    oldest → newest.
    */

    return messages.reverse();
}

/*==================================
GET OLDER MESSAGES
==================================*/

async function getOlderMessages(
    sessionId,
    beforeDate = null,
    limit = 50
) {
    ensureMessageModel();

    if (!sessionId) {
        throw new Error(
            "Session ID is required."
        );
    }

    const query = {
        sessionId,
        isDeleted: false
    };

    if (beforeDate) {
        const date =
            beforeDate instanceof Date
                ? beforeDate
                : new Date(beforeDate);

        if (
            !Number.isNaN(
                date.getTime()
            )
        ) {
            query.createdAt = {
                $lt: date
            };
        }
    }

    const safeLimit =
        normalizeLimit(
            limit,
            50,
            100
        );

    const messages =
        await Message.find(query)
            .sort({
                createdAt: -1
            })
            .limit(safeLimit)
            .lean();

    return messages.reverse();
}

/*==================================
SEARCH CONVERSATION
Used for explicit recall
==================================*/

async function searchConversation(
    sessionId,
    searchText,
    limit = 20
) {
    ensureMessageModel();

    if (!sessionId) {
        throw new Error(
            "Session ID is required."
        );
    }

    if (
        typeof searchText !== "string" ||
        !searchText.trim()
    ) {
        return [];
    }

    const safeLimit =
        normalizeLimit(
            limit,
            20,
            50
        );

    /*
    Convert recall request into
    meaningful search terms.
    */

    const stopWords = new Set([
        "what",
        "when",
        "where",
        "which",
        "tell",
        "remember",
        "recall",
        "about",
        "did",
        "have",
        "said",
        "say",
        "earlier",
        "previous",
        "before",
        "conversation",
        "chat",
        "you",
        "your",
        "me",
        "my",
        "the",
        "was",
        "were",
        "who",
        "how",
        "can",
        "could",
        "would",
        "should"
    ]);

    const terms =
        searchText
            .toLowerCase()
            .replace(
                /[^a-z0-9\s_-]/gi,
                " "
            )
            .split(/\s+/)
            .map(
                term =>
                    term.trim()
            )
            .filter(
                term =>
                    term.length >= 3
            )
            .filter(
                term =>
                    !stopWords.has(term)
            )
            .slice(0, 10);

    if (!terms.length) {
        return [];
    }

    /*
    Escape regex characters safely.
    */

    const escapedTerms =
        terms.map(
            term =>
                term.replace(
                    /[.*+?^${}()|[\]\\]/g,
                    "\\$&"
                )
        );

    /*
    Search message content.

    Any meaningful term can match.
    */

    const regexPatterns =
        escapedTerms.map(
            term => ({
                content: {
                    $regex: term,
                    $options: "i"
                }
            })
        );

    return await Message.find({
        sessionId,
        isDeleted: false,
        $or: regexPatterns
    })
        .sort({
            createdAt: -1
        })
        .limit(safeLimit)
        .lean();
}

/*==================================
GET SINGLE MESSAGE
==================================*/

async function getMessageById(
    messageId
) {
    ensureMessageModel();

    if (!messageId) {
        return null;
    }

    return await Message.findById(
        messageId
    ).lean();
}

/*==================================
UPDATE MESSAGE
==================================*/

async function updateMessage(
    messageId,
    newContent
) {
    ensureMessageModel();

    if (
        typeof newContent !== "string" ||
        !newContent.trim()
    ) {
        throw new Error(
            "Message content is required."
        );
    }

    return await Message.findByIdAndUpdate(
        messageId,
        {
            content:
                newContent.trim(),

            isEdited: true
        },
        {
            new: true
        }
    ).lean();
}

/*==================================
SOFT DELETE ONE MESSAGE
==================================*/

async function deleteMessage(
    messageId
) {
    ensureMessageModel();

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

/*==================================
SOFT DELETE SESSION MESSAGES
==================================*/

async function deleteMessagesBySession(
    sessionId
) {
    ensureMessageModel();

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

/*==================================
PERMANENTLY DELETE CHAT
==================================*/

async function clearChat(
    sessionId
) {
    ensureMessageModel();

    return await Message.deleteMany({
        sessionId
    });
}

/*==================================
COUNT MESSAGES
==================================*/

async function countMessages(
    sessionId
) {
    ensureMessageModel();

    return await Message.countDocuments({
        sessionId,
        isDeleted: false
    });
}

/*==================================
GET LATEST MESSAGE
==================================*/

async function getLatestMessage(
    sessionId
) {
    ensureMessageModel();

    return await Message.findOne({
        sessionId,
        isDeleted: false
    })
        .sort({
            createdAt: -1
        })
        .lean();
}

/*==================================
EXPORTS
==================================*/

module.exports = {
    saveMessage,
    getMessages,
    getRecentMessages,
    getOlderMessages,
    searchConversation,
    getMessageById,
    updateMessage,
    deleteMessage,
    deleteMessagesBySession,
    clearChat,
    countMessages,
    getLatestMessage
};