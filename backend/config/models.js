/*
==================================
Enlivonex AI Models
==================================
*/

const MODELS = {

    /*
    ==================================
    General Chat Model
    ==================================
    */

    CHAT: {

        name: "Qwen 2.5 3B",

        model: "qwen2.5:3b"

    },

    /*
    ==================================
    Coding Model
    ==================================
    */

    CODE: {

        name: "Qwen 2.5 Coder 7B",

        model: "qwen2.5-coder:7b"

    },

    /*
    ==================================
    Reasoning Model
    ==================================
    */

    REASONING: {

        name: "DeepSeek R1 7B",

        model: "deepseek-r1:7b"

    }

};

module.exports = MODELS;