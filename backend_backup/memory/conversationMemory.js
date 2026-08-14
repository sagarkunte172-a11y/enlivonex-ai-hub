/*
==================================
Conversation Memory
Enlivonex AI Hub
==================================
*/

const MAX_HISTORY = 20;

const conversation = [];

/*
==================================
Internal
Keep Memory Size Limited
==================================
*/

function trimConversation() {

    while (conversation.length > MAX_HISTORY) {

        conversation.shift();

    }

}

/*
==================================
Add User Message
==================================
*/

function addUserMessage(message) {

    conversation.push({

        role: "user",

        content: message

    });

    trimConversation();

}

/*
==================================
Add AI Message
==================================
*/

function addAIMessage(message) {

    conversation.push({

        role: "assistant",

        content: message

    });

    trimConversation();

}

/*
==================================
Get Full Conversation
==================================
*/

function getConversation() {

    return [...conversation];

}

/*
==================================
Get Last Messages
==================================
*/

function getLastMessages(limit = MAX_HISTORY) {

    return conversation.slice(-limit);

}

/*
==================================
Build Conversation Context
Future Ready
==================================
*/

function buildConversationContext() {

    return getLastMessages();

}

/*
==================================
Clear Conversation
==================================
*/

function clearConversation() {

    conversation.length = 0;

}

/*
==================================
Conversation Length
==================================
*/

function getConversationLength() {

    return conversation.length;

}

/*
==================================
Debug Memory
==================================
*/

function printConversation() {

    console.log("\n========== Conversation ==========\n");

    conversation.forEach((msg, index) => {

        console.log(

            `${index + 1}. ${msg.role.toUpperCase()} : ${msg.content}`

        );

    });

    console.log("\n==================================\n");

}

/*
==================================
Exports
==================================
*/

module.exports = {

    addUserMessage,

    addAIMessage,

    getConversation,

    getLastMessages,

    buildConversationContext,

    clearConversation,

    getConversationLength,

    printConversation

};