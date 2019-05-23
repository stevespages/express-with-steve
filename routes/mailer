const express = require('express');
const nodemailer = require('nodemailer');

const router = express.Router();

router.get('/', function (req, res, next) {
	let transporter = nodemailer.createTransport({
		service: 'gmail',
		auth: {
			user: 'stevespages100@gmail.com',
			pass: process.env.GMAIL_PASSWORD
		}
	});

	let mailOptions = {
		from: 'stevespages100@gmail.com',
		to: 'greigsteve@gmail.com',
		subject: 'Nodemailer',
		text: 'hmmm'
	};

	transporter.sendMail(mailOptions, function(error, info) {
		if (error) {
			console.log(error);
		} else {
			console.log('Email sent: ' + info.response);
		}
	});

	res.send('Email should have been sent');
});

module.exports = router;

