const Images = require('../models/Images')

const multer = require('multer');

const storage = multer.diskStorage({
    destination: 'uploads',
    filename: function (req, file, cb) {
        cb(null, file.originalname)
    }
})

const upload = multer({ storage: storage }).single('testImage')

exports.uploadFile = async (req,res) => {
    upload(req,res, (err) => {
        if (err) {
            console.log(err)
        }else {
            const newImage = new Images({
                name: req.body.name,
                images: {
                    data: req.file.filename,
                    contentType: 'image/png',
                }
            })
            newImage.save().then((data) => res.json(data)).catch((err) => {res.status(400).json(err)})
        }
    })
}

exports.getAllFiles = async (req, res) => {
    const images = await Images.find({});
    res.json(images);
}
