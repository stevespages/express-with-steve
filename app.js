const express = require('express');
const path = require('path');

const differentRouteRouter = require('./routes/different-route');

// heroku will assign a port env variable
const PORT = process.env.PORT || 8000;

const app = express()

app.use('/different-route', differentRouteRouter);

//app.get('/different-route', (req, res) => res.send('this is a different route!'))

app.use(express.static(path.join(__dirname, 'public/sphinx-documentation/_build/html')));

app.listen(PORT, () => {
	console.log(`listening on ${PORT}`);
});
