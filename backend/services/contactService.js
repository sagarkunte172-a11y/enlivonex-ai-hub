const Contact = require("../models/Contact");

async function createContact(data){

    return await Contact.create(data);

}

module.exports={

    createContact

};