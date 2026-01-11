const express = require("express");
const { protectRoute } = require("../middlewares/middleware");
const { submitGig, getBidsForGig, hireBid } = require("../controllers/bidController");
const router = express.Router();

router.post("/",protectRoute,submitGig);
router.get("/:gigId",protectRoute,getBidsForGig);
router.patch("/:bidId/hire",protectRoute,hireBid);

module.exports = router;