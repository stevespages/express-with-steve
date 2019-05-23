const express = require('express');
const router = express.Router();

router.get('/', function (req, res) {
	// export MY_ENV_VAR="my-env-var!" in .bashrc file
	// or
	// when starting node: MY_ENV_VAR="my-env-var!" npm start
	res.send(process.env.MY_ENV_VAR);
});

module.exports = router;
