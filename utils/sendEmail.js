const nodemailer = require('nodemailer')

const sendEmail = async (subject, message, send_to, sent_from, reply_to) =>{
    // Create Email transporter
    const transpoter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: 587,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
        tls: {
            rejectUnauthorized: false
        }
    })

    // options for  sending email  
    const options ={
        from: sent_from,
        to: send_to,
        from: reply_to,
        subject: subject,
        html: message,

    }

    // send email
    transpoter.sendMail(options, function(err, info){
        if(err){
            console.log(err)
        } else {
        console.log(info)
    }
    });
}

module.exports = sendEmail