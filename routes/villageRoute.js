const {
    getVillages,
    addVillages
} = require('../controller/villageController');
const router = require("express").Router();


router.get("/getVillages", getVillages);
router.post("/addVillage", addVillages);

module.exports = router;