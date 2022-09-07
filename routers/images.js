const router = require("express").Router();
const { catchErrors } = require("../handlers/errorHandlers");
const imagesController = require('../controllers/imagesController')

router.post("/uploadFile", catchErrors(imagesController.uploadFile));
router.get("/", catchErrors(imagesController.getAllFiles));
module.exports = router;