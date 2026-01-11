const express = require("express");
const { protectRoute } = require("../middlewares/middleware");
const { getOpenGigs, createGig } = require("../controllers/gigController");
const router = express.Router();

router.get("/",protectRoute,getOpenGigs);
router.post('/',protectRoute,createGig);
module.exports = router;