const express = require('express');
const router = express.Router();

router.get('/', function (req, res) {
	res.render('jquery-counter', { title: 'jquery-counter' });
});

module.exports = router;

