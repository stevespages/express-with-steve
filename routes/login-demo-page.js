var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
	res.render('login-demo-page', { title: 'Login Demo Page', user: req.session.user });
});

module.exports = router;
