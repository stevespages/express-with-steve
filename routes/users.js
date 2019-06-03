var express = require('express');
var router = express.Router();
const bcrypt = require('bcrypt');

router.get('/register', function(req, res, next) {
	res.render('users/register', { title: 'Register' });
});

router.post('/register', function(req, res, next) {
	// store id (auto generated), name, email, encrypted password in users.db
	// code...
});

router.get('/login', function(req, res, next) {
	res.render('users/login', { title : 'Login' });
});

router.post('/login', function(req, res, next) {
	if(bcrypt.compareSync(req.body.password, '$2b$10$c995pjb75nxS9KZAKwmO4ubnMUJcSmK2.wGQqmqd3h9SNtiNGmin2') && req.body.email === 'greigsteve@gmail.com') {
		req.session.user = 'Steve';
		// if successful redirect to a page on the site (could be the home page)
		res.redirect('/login-demo-page');
	}
	// if unsuccessful back to the login page
	res.redirect('/users/login');
});

router.get('/logout', function(req, res, next) {
	req.session.user = null;
	res.redirect('/login-demo-page');
});

module.exports = router;
