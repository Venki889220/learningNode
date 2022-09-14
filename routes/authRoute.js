const { registerUser, verifyOTP, signInUser, forgotPasswordforUser } = require("../controller/authController");
const router = require("express").Router();
router.post("/registerUser", registerUser);
router.post("/verifyOTP", verifyOTP);
router.post("/signIn", signInUser);
router.put("/forgotPassword", forgotPasswordforUser);

module.exports = router;
