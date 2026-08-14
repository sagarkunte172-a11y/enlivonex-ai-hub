const User = require("../models/User");

/*
==================================
Create User
==================================
*/

async function createUser(userData) {

    try {

        const user = await User.create(userData);

        return user;

    }

    catch (error) {

        throw error;

    }

}

/*
==================================
Get User By ID
==================================
*/

async function getUserById(userId) {

    try {

        return await User.findById(userId);

    }

    catch (error) {

        throw error;

    }

}

/*
==================================
Get User By Email
==================================
*/

async function getUserByEmail(email) {

    try {

        return await User.findOne({

            email

        });

    }

    catch (error) {

        throw error;

    }

}

/*
==================================
Get User By Google ID
==================================
*/

async function getUserByGoogleId(googleId) {

    try {

        return await User.findOne({

            googleId

        });

    }

    catch (error) {

        throw error;

    }

}

/*
==================================
Update User
==================================
*/

async function updateUser(

    userId,

    updateData

) {

    try {

        return await User.findByIdAndUpdate(

            userId,

            updateData,

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
Update Credits
==================================
*/

async function updateCredits(

    userId,

    credits

) {

    try {

        return await User.findByIdAndUpdate(

            userId,

            {

                credits

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
Update Last Login
==================================
*/

async function updateLastLogin(userId) {

    try {

        return await User.findByIdAndUpdate(

            userId,

            {

                lastLogin: new Date()

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
Delete User
==================================
*/

async function deleteUser(userId) {

    try {

        return await User.findByIdAndDelete(userId);

    }

    catch (error) {

        throw error;

    }

}

/*
==================================
Export
==================================
*/

module.exports = {

    createUser,

    getUserById,

    getUserByEmail,

    getUserByGoogleId,

    updateUser,

    updateCredits,

    updateLastLogin,

    deleteUser

};