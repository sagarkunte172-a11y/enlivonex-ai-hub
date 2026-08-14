/*
==================================
Model Router
Enlivonex AI Hub
==================================
*/

const MODELS = require("../config/models");

/*
==================================
Coding Keywords
==================================
*/

const codingKeywords = [

    "code",
    "coding",
    "program",
    "programming",
    "javascript",
    "java",
    "python",
    "cpp",
    "c++",
    "c#",
    "html",
    "css",
    "react",
    "node",
    "express",
    "mongodb",
    "sql",
    "database",
    "api",
    "bug",
    "error",
    "debug",
    "algorithm",
    "function",
    "class"

];

/*
==================================
Reasoning Keywords
==================================
*/

const reasoningKeywords = [

    "reason",
    "reasoning",
    "logic",
    "logical",
    "riddle",
    "puzzle",
    "iq",
    "brain teaser",
    "step by step",
    "think",
    "why",
    "analyze"

];

/*
==================================
Choose Model
==================================
*/

function chooseModel(prompt) {

    const text = prompt.toLowerCase();

    /*
    ============================
    Coding
    ============================
    */

    if (

        codingKeywords.some(

            keyword => text.includes(keyword)

        )

    ) {

        return {

            ...MODELS.CODE,

            reason: "Coding"

        };

    }

    /*
    ============================
    Reasoning
    ============================
    */

    if (

        reasoningKeywords.some(

            keyword => text.includes(keyword)

        )

    ) {

        return {

            ...MODELS.REASONING,

            reason: "Reasoning"

        };

    }

    /*
    ============================
    Default Chat
    ============================
    */

    return {

        ...MODELS.CHAT,

        reason: "General Chat"

    };

}

module.exports = {

    chooseModel

};