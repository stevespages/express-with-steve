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
  res.render('multer', { title: 'Multer' });
});

// It is crucial that the file name matches the name attribute in your html
router.post('/', upload.single('upload'), (req, res) => {
//      res.redirect('/');
        console.log(req.body);
        console.log(req.file);
        res.send(req.file.filename);
});

module.exports = router;

