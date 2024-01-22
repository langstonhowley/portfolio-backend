const express = require("express");
const nodemailer = require("nodemailer");
const router = express.Router();

const AWS = require("aws-sdk");
AWS.config.update({ region: "us-east-1" });
const secretsManager = new AWS.SecretsManager();

var transporter = null;
var myEmail = null;

secretsManager.getSecretValue({ SecretId: "portfolio" }, (err, data) => {
  if (err) {
    console.error("Email server couldn't get the portfolio secrets: ", err);
  } else {
    const secret = JSON.parse(data.SecretString);

    myEmail = secret.email

    transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: secret.email,
        pass: secret.emailPass,
      },
    });
  }
});

router.post("/", (req, res) => {
  let from = req.body.from || null;
  let message = req.body.message || null;

  if (!from || !message) {
    res.status(400).json({ error: "from or message is null" });
  } else if (myEmail === null) {
    console.log("Did you forget your email sir?");
    res.status(500).json({ error: "Internal server Error" });
  } else {
    const mailOptions = {
      from: from,
      to: myEmail,
      subject: "Message from langstonhowley.me",
      text: message,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log("Email send error: ", error);
        return res.status(500).send(`Internal Server Error`);
      } else {
        res.status(200).json({ status: "you good" });
      }
    });
  }
});

module.exports = router;