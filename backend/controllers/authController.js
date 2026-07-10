function register(req, res) {

    res.json({
        success: true,
        message: "Register API Working"
    });

}

function login(req, res) {

    res.json({
        success: true,
        message: "Login API Working"
    });

}

module.exports = {
    register,
    login
};