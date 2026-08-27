const {
    getRecentMessages,
    searchConversation
} = require("./messageService");

/*==================================
MEMORY CONFIGURATION
==================================*/

const WORKING_MEMORY_LIMIT = 50;

const RECALL_MEMORY_LIMIT = 20;

/*==================================
RECALL DETECTION
==================================*/

function shouldRecallMemory(
    message
) {
    if (
        typeof message !== "string" ||
        !message.trim()
    ) {
        return false;
    }

    const text =
        message
            .toLowerCase()
            .trim();

    const recallPatterns = [
        /\brecall\b/,
        /\bremember\b/,
        /\bdo you remember\b/,
        /\bdid i tell you\b/,
        /\bwhat did i tell you\b/,
        /\bwhat did i say\b/,
        /\bwhat have i told you\b/,
        /\bwhat was my\b/,
        /\bwhat is my\b/,
        /\bearlier\b/,
        /\bprevious conversation\b/,
        /\bprevious chat\b/,
        /\bold conversation\b/,
        /\bfrom before\b/,
        /\byou remember\b/,
        /\bwe discussed\b/,
        /\bi told you\b/,
        /\bi mentioned\b/,
        /\bwe talked about\b/,
        /\bfrom our earlier\b/
    ];

    return recallPatterns.some(
        pattern =>
            pattern.test(text)
    );
}

/*==================================
FORMAT MONGO MESSAGE FOR OLLAMA
==================================*/

function formatMessage(
    message
) {
    if (!message) {
        return null;
    }

    if (
        message.role !== "user" &&
        message.role !== "assistant" &&
        message.role !== "system"
    ) {
        return null;
    }

    if (
        typeof message.content !== "string" ||
        !message.content.trim()
    ) {
        return null;
    }

    return {
        role: message.role,
        content:
            message.content.trim()
    };
}

/*==================================
GET WORKING MEMORY
==================================*/

async function getWorkingMemory(
    sessionId
) {
    const messages =
        await getRecentMessages(
            sessionId,
            WORKING_MEMORY_LIMIT
        );

    return messages
        .map(formatMessage)
        .filter(Boolean);
}

/*==================================
GET RECALL MEMORY
==================================*/

async function getRecallMemory(
    sessionId,
    userMessage
) {
    const results =
        await searchConversation(
            sessionId,
            userMessage,
            RECALL_MEMORY_LIMIT
        );

    /*
    Search returns newest first.

    Convert to chronological order.
    */

    return results
        .reverse()
        .map(formatMessage)
        .filter(Boolean);
}

/*==================================
BUILD MEMORY CONTEXT
==================================*/

async function buildMemoryContext(
    sessionId,
    currentMessage
) {
    if (!sessionId) {
        return {
            messages: [],
            recalled: false,
            recalledMessages: 0
        };
    }

    /*==================================
    ALWAYS LOAD LAST 50
    ==================================*/

    const recentMessages =
        await getWorkingMemory(
            sessionId
        );

    /*==================================
    CHECK RECALL REQUEST
    ==================================*/

    const recallRequested =
        shouldRecallMemory(
            currentMessage
        );

    if (!recallRequested) {
        return {
            messages:
                recentMessages,

            recalled: false,

            recalledMessages: 0
        };
    }

    /*==================================
    SEARCH OLDER MEMORY
    ==================================*/

    const recalledMessages =
        await getRecallMemory(
            sessionId,
            currentMessage
        );

    /*==================================
    REMOVE DUPLICATES
    ==================================*/

    const recentKeys =
        new Set(
            recentMessages.map(
                message =>
                    `${message.role}:${message.content}`
            )
        );

    const uniqueRecalled =
        recalledMessages.filter(
            message =>
                !recentKeys.has(
                    `${message.role}:${message.content}`
                )
        );

    /*==================================
    COMBINE MEMORY
    ==================================*/

    const memoryMessages = [
        ...uniqueRecalled,
        ...recentMessages
    ];

    return {
        messages:
            memoryMessages,

        recalled: true,

        recalledMessages:
            uniqueRecalled.length
    };
}

/*==================================
EXPORTS
==================================*/

module.exports = {
    WORKING_MEMORY_LIMIT,
    RECALL_MEMORY_LIMIT,
    shouldRecallMemory,
    getWorkingMemory,
    getRecallMemory,
    buildMemoryContext
};