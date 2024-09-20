const dotenv = require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const userRoute = require('./routes/userRoute');
const errorHandler = require("./MiddleWare/errorMiddleware");
const cookieParser = require("cookie-parser");


const app = express()

// Middlewares
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(cors());

// Routes Middlewares
app.use('/api/users', userRoute)

// Routes
app.get("/", (req, res)=>{
    res.send("Home Page")

});
const PORT = process.env.PORT || 3333


// Error Middleware
app.use(errorHandler)


// cONNECT TO DB AND START SERVER
mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Server Runnng on port ${PORT}`);
        })
    })
    .catch((err) => console.log(err))