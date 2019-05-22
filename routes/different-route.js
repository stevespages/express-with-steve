const express = require('express');
const router = express.Router();

router.get('/', function (req, res) {
	res.send('this is a different route!!');
});

module.exports = router;

