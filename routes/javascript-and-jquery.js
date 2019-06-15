const express = require('express');
const router = express.Router();

router.get('/', function (req, res) {
	res.render('javascript-and-jquery', { title: 'javascript-and-jquery' });
});

module.exports = router;

