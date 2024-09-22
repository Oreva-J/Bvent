const dotenv = require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const userRoute = require('./routes/userRoute');
const productRoute = require('./routes/productRoute');
const contactRoute = require('./routes/contactRoute')
const errorHandler = require("./MiddleWare/errorMiddleware");
const cookieParser = require("cookie-parser");
const path = require('path');



const app = express()

// Middlewares
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(cors());

// pointing the file upload function in the utils to the uploads folder
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes Middlewares
app.use('/api/users', userRoute)
app.use('/api/products', productRoute)
app.use('/api/contact', contactRoute)


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