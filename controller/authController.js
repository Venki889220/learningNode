const { register,
  verifyUserOTP,
  checkIfUserAlreadyExists,
  signIn,
  getUsers,
  refreshInterestCalculationForUser,
  forgotPassword } = require("../model/authModel");

const { isEmail } = require("../utils/validations");
const { getVillage } = require("../model/villageModel");

async function registerUser(req, res) {
  const email = req.body.email
  if (isEmail(email)) {
    checkIfUserAlreadyExists(email, (statusCheck, mesasge, err) => {
      if (err == null && statusCheck) {
        register(req, (err, results) => {
          res.send({
            error: err,
            message: results,
          });
        });
      } else {
        res.status(404).send({
          error: err,
          message: mesasge,
        });
      }
      return;
    });
  } else {
    res.status(404).send({
      error: null,
      message: "Please provide a vaild email",
    });
    return;
  }
}

async function verifyOTP(req, res) {
  const email = req.body.email;
  const otp = req.body.otp;
  const pass = req.body.password;
  if (email != null && otp != null) {
    verifyUserOTP(email, otp, pass, (statusCheck, mesasge, err) => {
      if (err == null && statusCheck) {
        res.send({
          error: err,
          message: mesasge,
        });
      } else {
        res.status(404).send({
          error: err,
          message: mesasge,
        });
      }
      return;
    });

  } else {
    res.status(404).send({
      error: null,
      message: "Please provide a vaild email",
    });
    return;
  }
}

async function forgotPasswordforUser(req, res) {
  const email = req.body.email
  if (isEmail(email)) {
    const result = await forgotPassword(email);
    if (result.status) {
      res.send({
        error: null,
        message: result.message,
      });
    } else {
      res.status(404).send({
        error: result.message,
        message: "",
      });
    }
    return;
  } else {
    res.status(404).send({
      error: null,
      message: "Please provide a vaild email",
    });
    return;
  }
}
async function signInUser(req, res) {
  const email = req.body.email
  const password = req.body.password

  if (email != null && password != null) {
    signIn(email, password, (statusCheck, mesasge, err) => {
      if (err == null && statusCheck) {
        res.send({
          error: err,
          message: mesasge,
        });
      } else {
        res.send({
          error: err,
          message: mesasge,
        });
      }
      return;
    });

  } else {
    res.status(404).send({
      error: null,
      message: "Please provide a vaild details",
    });
    return;
  }
}

async function refreshAllInterestCalculationForUser() {
  try {
    const result = await getUsers();
    if (result != null) {
      if (result.length > 0) {
        for (const user of result) {
          await refreshInterestCalculationsForUsers(user);
        }
      }
    } else {
      console.log("Failed to updated User transaction");
    }
    return;

  } catch (error) {
    console.log(error);
    return;
  }
}

async function refreshInterestCalculationsForUsers(user) {
  try {
    const result = await getVillage('owner_id', user.id);
    if (result != null) {
      var totalInterest = 0;
      var totalAmount = 0;
      var totalPrincipleAmount = 0;
      result.forEach(village => {
        totalInterest = totalInterest + village.total_interest;
        totalAmount = totalAmount + village.total_amount;
        totalPrincipleAmount = totalPrincipleAmount + village.total_principle_amount;
      });
      user.total_principle_amount = totalPrincipleAmount;
      user.total_interest = totalInterest;
      user.total_amount = totalAmount;
      const updateResult = await refreshInterestCalculationForUser(user);
      if (updateResult != null) {
        console.log("User transactions updated successfully");
        return;
      } else {
        console.log("Failed to updated User transactions");
        return;
      }
    }
  } catch (error) {
    console.log(error);
    return;
  }
}

module.exports = {
  registerUser,
  verifyOTP,
  refreshAllInterestCalculationForUser,
  signInUser,
  forgotPasswordforUser,
};
