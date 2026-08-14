const {

    createContact

}=require("../services/contactService");

async function sendContact(req,res){

    try{

        const{

            name,

            email,

            subject,

            message

        }=req.body;

        if(

            !name ||

            !email ||

            !subject ||

            !message

        ){

            return res.status(400).json({

                success:false,

                message:"All fields are required."

            });

        }

        const contact=await createContact({

            name,

            email,

            subject,

            message

        });

        res.status(201).json({

            success:true,

            message:"Message sent successfully.",

            contact

        });

    }

    catch(error){

        console.error(error);

        res.status(500).json({

            success:false,

            message:"Server Error"

        });

    }

}

module.exports={

    sendContact

};