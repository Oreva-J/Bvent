const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: [true, "please add a name"]
    },
    email: {
        type: String,
        required: [true, "please add a name"],
        unique: true,
        trim: true, //remove space arround email
        match: [
             /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
             "Pease enter a valid email"
        ]
    },
    password: {
        type: String,
        required: [true, "please add a Password"],
        minLength: [6, "Password must be up to 6 characters"],
        //maxLength: [23, "Passord must not  be to 23 characters"],
    },
    photo: {
        type: String,
        required: [true, "please add a photo"],
        default: "https://i.ibb.co/4pDNDK1/avatar.png"
    },
    phone: {
        type: String,
       
        default: "+234",

    },
    Bio: {
        type: String,
        maxLength: [23, "Passord must not  be to 250 characters"],
        default: "bio"
    }

}, {
    timesStamps: true,
});

// Encrypt password before saving to DB
userSchema.pre('save', async function(next){
    if(!this.isModified("password")){
        return next()
    }

// hash password
const salt = await bcrypt.genSalt(10);
const hashedPassword = await bcrypt.hash(this.password, salt)
this.password = hashedPassword
next()
})

const User = mongoose.model("User", userSchema)

module.exports = User