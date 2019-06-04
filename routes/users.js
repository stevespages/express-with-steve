var express = require('express');
var router = express.Router();
const bcrypt = require('bcrypt');
const sqlite3 = require('sqlite3');

const db = new sqlite3.Database('sqlite3.db');

router.get('/register', function(req, res, next) {
	res.render('users/register', { title: 'Register' });
});

router.post('/register', function(req, res, next) {
	// store id (auto generated), name, email, encrypted password in users.db
	bcrypt.hash(req.body.password, 10, function(err, hash) {
		let sql = `INSERT INTO users(email, password, name) VALUES (?, ?, ?)`;
		db.run(sql, [req.body.email, hash, req.body.name], () => {});
		req.session.user = req.body.name;
		res.redirect('/login-demo-page');
	});
});

router.get('/login', function(req, res, next) {
	res.render('users/login', { title : 'Login' });
});

router.post('/login', function(req, res, next) {
	let sql = `SELECT * FROM users WHERE email = ?`;
	db.get(sql, [req.body.email], function(err, row) {
		if(!row){
			console.log('Invalid Username');
			res.redirect('/users/login');
		} else {
			bcrypt.compare(req.body.password, row.password, function(err, result) {
				if(result) {
					req.session.user = row.name;
					res.redirect('/login-demo-page');
				} else {
					res.redirect('/users/login');
				}
			});
		}
	});
});

router.get('/logout', function(req, res, next) {
	req.session.user = null;
	res.redirect('/login-demo-page');
});

module.exports = router;
