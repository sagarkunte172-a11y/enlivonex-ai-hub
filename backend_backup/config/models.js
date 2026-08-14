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

        name: "Gemma 3 4B",

        model: "gemma3:4b"

    },

    /*
    ==================================
    Reasoning Model
    ==================================
    */

    REASONING: {

        name: "DeepSeek R1",

        model: "deepseek-r1:7b"

    }

};

module.exports = MODELS;