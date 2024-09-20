const asyncHandler = require('express-async-handler');
const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Token = require('../models/tokenModel');
const crypto = require('crypto')


const generateToken = (id) => {
    return jwt.sign({id}, process.env.JWT_SECRET, {expiresIn: "1d"})
};


// Register User
const registerUser = asyncHandler( async (req, res) => {
  const {name, email, password}  = req.body;

//Validations
if(!name || !email || !password){
    res.status(400)
    throw new Error("please fill in all required fields")
}

if(password.length < 6){
    res.status(400)
    throw new Error("password must be up to 6 characters")
}

// check if user email already exist
const userExist = await User.findOne({email})

if(userExist){
    res.status(400)
    throw new Error("Email already register")
    }



// Create New User
const user = await User.create({name, email, password})

// Generate Token
const token = generateToken(user._id)

// send HTTP-only Cookie
res.cookie("token", token, {
    path: "/",
    httpOnly: true,
    expires: new Date(Date.now() + 1000 * 86400), // 1 day
    sameSite: "none",
    //secure: true
    secure: process.env.NODE_ENV === "production" ? true : false,
});


if(user){
    const {_id, name, email,  photo, bio} = user
    res.status(201).json({_id, name, email, photo, bio, token})

}else {
    res.status(400)
    throw new Error("Invalid user data")
}

   
});

// Login User
const loginUser = asyncHandler(async (req, res) => {
    const {email, password} = req.body

    // validate Request
    if(!email || !password){
        res.status(400);
        throw new Error("Invalid Email or Password");
    }

    // Check if user exist
    const user = await User.findOne({email})

    if(!user){
        res.status(400);
        throw new Error("User not found, please signup")
    }

    // usesr exist, check if password is correct
    const passwordIsCorrect = await bcrypt.compare(password, user.password)

    // Generate Token
const token = generateToken(user._id)

// send HTTP-only Cookie
res.cookie("token", token, {
    path: "/",
    httpOnly: true,
    expires: new Date(Date.now() + 1000 * 86400), // 1 day
    sameSite: "none",
    //secure: true,
    secure: process.env.NODE_ENV === "production" ? true : false,
});

    if(user && passwordIsCorrect){
        const {_id, name, email,  photo, bio} = user
        res.status(200).json({_id, name, email, photo, bio, token})
    }else{
        res.status(400);
        throw new Error("invalid email or password")

    }


});

// Logout User

const logout = asyncHandler( async (req, res) => {
    // send HTTP-only Cookie
res.cookie("token", "", {
    path: "/",
    httpOnly: true,
    expires: new Date(0), //  zero time
    sameSite: "none",
    //secure: true
    secure: process.env.NODE_ENV === "production" ? true : false,

});
    console.log("successfully log out")
    return res.status(200).json({message: "logged out successfully"})
});

//  Get User Data

const getUser = asyncHandler (async (req, res) => {
    const user = await User.findById(req.user._id)

    if(user){
        const {_id, name, email,  photo, bio} = user
        res.status(200).json({_id, name, email, photo, bio})
        console.log("success")
    
    }else {
        console.log("not able to get user")
        res.status(400)
        throw new Error("User not found")
    }
})

// Get Login Status

const loginStatus = asyncHandler(async (req, res) => {
    
    const token = req.cookies.token
    if(!token){
        return res.json(false)
    }

    // verify token
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    if(verified){
        return res.json(true);
    }
    return res.json(false)
    
})

    // Update User

    const updateUser = asyncHandler(async (req, res) => {
        const user = await User.findById(req.user._id)

        if(user){
            const {name, email,  photo, phone, bio} = user
            user.email = email;
            user.name = req.body.name || name;
            user.phone = req.body.phone || phone;
            user.bio = req.body.bio || bio;
            user.photo = req.body.photo || photo;

            const updatedUser = await user.save()

            res.status(200).json({_id: updateUser._id, 
                name: updateUser.name, 
                email: updateUser.email, 
                photo: updateUser.photo, 
                phone: updateUser.phone, 
                bio: updateUser.bio,
            });

        }else{
            res.status(404)
            throw new Error("user not found")
        }
    });

    // Change Password

    const changePassword = asyncHandler(async (req, res) => {
        const user = await User.findById(req.user._id)
        const {oldPassword, password} = req.body

        // Validate user
        if(!user){
            res.status(400);
            throw new Error("User not found, Please signup");
        }
        // Check f password is entered
        if(!oldPassword || !password){
            res.status(400);
            throw new Error("Please add old and new Password");
        }

        // check if old password maches assword in DB
        const passwordIsCorrect = await bcrypt.compare(oldPassword, user.password);

        // save new password
        if(user && passwordIsCorrect){
            user.password = password;
            await user.save();
            res.status(200).send("password change successfully");
        } else{
            res.status(400);
            throw new Error("old password is incorrect");
        }
    })

    // Forgot Password
    const forgotPassword = asyncHandler(async (req,res) => {
        const {email} = req.body
        const user = await User.findOne({email})

        if(!user){
            res.status(404)
            throw new Error("User does not exist")
        }

        // Delete token if it exist in DB
        let token = await Token.findOne({userId: user._id})

        if(token){
            await token.deleteOne()
        }

        // create reset Token
        let resetToken = crypto.randomBytes(32).toString("hex")+ user._id;
        console.log(resetToken)
        
        // hash token before sending to DB
        const hashedResetToken = crypto.createHash("sha256").update(resetToken).digest("hex")
        
        // Save token to DB
        await new Token({
            userId: user._id,
            token: hashedResetToken,
            createdAt: Date.now(),
            expiresAt: Date.now() + 30 * (60 * 1000), // thirty minutes
        }).save()

        // Construct Reset URL
        const resetUrl = `${process.env.FRONTEND_URL}/resetpassword/${resetToken}`

        // Reset Email

        const message = `
        <h2>Hello ${user.name}</h2>
        <p>Please use the url below to reset your password</P>
        <p>This reset Link is valid for only 30minutes</p>

        <a href=${resetUrl} clicktracking=off>${resetUrl}</a>

        <p> Regards...</p>
        <p>Bvent Team</p>
        `;

        const subject = "Password Reset Request"
        const send_to = user.email
        const_from = process.env.EMAIL_USER

        try {
            await sendEmail(subject, message, send_to, sent_from)

            res.status(200).json({success:true, message: "Reset Email Sent"})
        } catch (error) {
            res.status(500)
            throw new Error("Email not sent. please try again")
        }

        res.send("forgot password")
        
        
    })

    const resetPassword = asyncHandler(async (req, res) => {
       
        const {password} = req.body
        const {resetToken} = req.params

         // hash token, then compare to Token in DB
         const hashedResetToken = crypto.createHash("sha256").update(resetToken).digest("hex")


        //  Find Token in DB
        const userToken = await Token.findOne({
            token: hashedResetToken,
            expiresAt: {$gt: Date.now()}
        })

        if(!userToken){
            res.status(404);
            throw new Error("Invalid or Expired Token")
        }

        // Find user

        const user = await User.findOne({_id: userToken.userId})
        user.password = password

        await user.save()
        res.status(200).json({message: "password reset successfull, please Login"})
    })



module.exports = {
    registerUser,
    loginUser,
    logout,
    getUser,
    loginStatus,
    updateUser,
    changePassword,
    forgotPassword,
    resetPassword

}