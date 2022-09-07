const mongoose = require("mongoose");


const ImagesSchema = new mongoose.Schema({
    name: {type: String, required: true},
    images: {data: Buffer, ContentType: String }
});

module.exports = mongoose.model("Images", ImagesSchema);