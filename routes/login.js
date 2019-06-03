var express = require('express');
var router = express.Router();
const bcrypt = require('bcrypt');

router.get('/', function(req, res, next) {
	res.render('login', { title: 'Login', userId: req.session.userId });
});

router.post('/', function(req, res, next) {
	if(bcrypt.compareSync(req.body.password, '$2b$10$c995pjb75nxS9KZAKwmO4ubnMUJcSmK2.wGQqmqd3h9SNtiNGmin2') && req.body.email === 'greigsteve@gmail.com') {
		req.session.userId = 'Steve';
	}
	res.redirect('/login', { userId: req.session.userId });
});

router.get('/logout', function(req, res, next) {
	req.session.userId = null;
	res.redirect('/login');
});

module.exports = router;

