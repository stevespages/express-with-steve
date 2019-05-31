var express = require('express');
var router = express.Router();

const multer = require('multer');

var storage = multer.diskStorage({
        destination: 'public/multer-uploads',
        filename: function (req, file, cb) {
                cb(null, file.originalname)
        }
})

var upload = multer({storage: storage});

router.get('/', function(req, res, next) {
  res.render('multer-2-files', { title: 'multer-2-files' });
});

// It is crucial that the file names matches the name attributes in your html
router.post('/', upload.fields([
	{name: 'upload_1'},
	{name: 'upload_2'}
]), (req, res) => {
//      res.redirect('/');
        console.log(req.body);
        console.log(req.file);
        res.send(req.files);
});

module.exports = router;

