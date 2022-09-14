const {
    getCustomer,
    registerCustomers
} = require('../controller/customerController');
const router = require("express").Router();


router.get("/getCustomer", getCustomer);
router.post("/registerCustomer", registerCustomers);

module.exports = router;