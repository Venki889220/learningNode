const router = require("express").Router();
const { getUserTransactions,
    addUserTransactions,
    payUserTransaction } = require("../controller/transactionController");

router.get("/userTransactions", getUserTransactions);
router.post("/addTransaction", addUserTransactions);
router.put("/payTransaction", payUserTransaction);

module.exports = router;
