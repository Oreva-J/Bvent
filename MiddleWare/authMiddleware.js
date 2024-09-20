const asyncHandler = require('express-async-handler');
const User = require('../models/userModel');
const jwt = require('jsonwebtoken');

const protect = asyncHandler(async (req, res, next) => {
    try {
        const token = req.cookies.token;  // Retrieve the token from cookies

        // Log the token for debugging purposes
        console.log(`Verifying token: ${token}`);

        // Check if token exists
        if (!token) {
            console.log("No token found, not authorized.");
            res.status(401);  // Change to 401 for unauthorized
            throw new Error("Not authorized, please login.");
        }

        // Verify the token
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        console.log("Token verified successfully.");

        // Find the user by ID, excluding the password
        const user = await User.findById(verified.id).select("-password");

        if (!user) {
            console.log("User not found.");
            res.status(404);  // Change to 404 for not found
            throw new Error("User not found.");
        }

        // Set user to req object
        req.user = user;
        console.log("User successfully set in request.");

        next();  // Proceed to the next middleware or route handler
    } catch (error) {
        console.log("Authorization error:", error.message);
        res.status(401);  // Unauthorized if token verification fails
        throw new Error("Not authorized, please login.");
    }
});

module.exports = protect;
