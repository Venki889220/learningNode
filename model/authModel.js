require("express");
const sql = require("../utils/db");
const uuid = require('uuid');
const bcrypt = require('bcrypt');
const { generateRandomNumber, sendMail, getJWTForUser } = require('../utils/validations.js');

async function deleteUser(email) {
  const result = await new Promise((resolve, reject) => {
    sql.query(
      "DELETE FROM `users` WHERE email = ?",
      [
        email
      ],
      (err, result) => {
        if (err != null) {
          reject(err);
        } else {
          resolve(result);
        }
      }
    );
  });
  console.log(result);
}

async function register(req, callback) {
  try {
    const uid = uuid.v4();
    const hashedPass = await bcrypt.hash(req.body.password, 10);
    const otp = generateRandomNumber();
    const result = await new Promise((resolve, reject) => {
      sql.query(
        "INSERT INTO `users`(`id`,`name`, `email`, `address`, `password`,`otp`) VALUES (?,?,?,?,?,?)",
        [
          uid,
          req.body.name,
          req.body.email,
          req.body.address,
          hashedPass,
          otp,
        ],
        (err, result) => {
          if (err != null) {
            reject(err);
          } else {
            resolve(result);
          }
        }
      );
    });
    if (result != null) {
      const status = await sendMail(req.body.email, otp);
      if (status) {
        callback(false, "OTP sent successfully to " + req.body.email);
      } else {
        // removeOTP(req.body.email);
        callback(true, " Failed to send OTP to " + req.body.email);
      }
    } else {
      callback(true, "Something went wrong. Please try again");
    }
  } catch (err) {
    callback(true, "Error..!" + err);
    return true;
  }
}

async function removeOTP(id, pass) {
  if (pass != null) {
    const password = await bcrypt.hash(pass, 10);
    sql.query(
      "UPDATE users SET otp = NULL,active = 1,password = " + password + " WHERE id = ? ", id
    );
  } else {
    sql.query(
      "UPDATE users SET otp = NULL,active = 1 WHERE id = ? ", id
    );
  }

}

function logoutUser(id) {
  sql.query(
    "UPDATE users SET otp = NULL,active = 0 WHERE id = ? ", id
  );
}

function addOTPUser(id, otp) {
  sql.query(
    "UPDATE users SET otp = " + otp + " ,active = 0 WHERE id = ? ", id
  );
}

async function verifyUserOTP(email, otp, pass, callback) {
  try {
    const results = await new Promise((resolve, reject) => {
      sql.query(
        "SELECT id, otp FROM users WHERE email = ? ", email,
        (err, result) => {
          if (err != null) {
            reject(err);
          } else {
            resolve(result);
          }
        }
      );
    });
    if (results != null) {
      if (results.length > 0) {
        const dbOTP = results[0].otp;
        if (dbOTP == otp) {
          const token = getJWTForUser(results[0].id);
          removeOTP(results[0].id, pass);
          callback(true, { "status": "success", "userId": results[0].id, "token": token }, null);
        } else {
          callback(false, "incorrect OTP", null);
        }
      } else {
        callback(false, "incorrect OTP", null);
      }
    } else {
      callback(false, "Email not found", null);
    }
  } catch (err) {
    callback(false, "Error..!" + err);
  }
}

async function signIn(email, password, callback) {
  try {
    const results = await new Promise((resolve, reject) => {
      sql.query(
        "SELECT id, password FROM users WHERE email = ? ", email,
        (err, result) => {
          if (err != null) {
            reject(err);
          } else {
            resolve(result);
          }
        }
      );
    });
    if (results != null) {
      if (results.length > 0) {
        const hashpass = results[0].password;
        const status = await bcrypt.compare(password, hashpass);
        if (status) {
          const token = getJWTForUser(results[0].id);
          removeOTP(results[0].id);
          callback(true, { "status": "success", "userId": results[0].id, "token": token }, null);
        } else {
          callback(false, "incorrect password", null);
        }
      } else {
        callback(false, "incorrect password", null);
      }
    } else {
      callback(false, "Email not found", null);
    }
  } catch (err) {
    callback(false, "Error..!" + err);
  }
}

async function forgotPassword(email) {
  try {
    const results = await new Promise((resolve, reject) => {
      sql.query(
        "SELECT * FROM users WHERE email = ? ", email,
        (err, result) => {
          console.log(err);
          if (err != null) {
            reject(err);
          } else {
            resolve(result);
          }
        }
      );
    });

    if (results.length == 1) {
      const otp = generateRandomNumber();
      addOTPUser(results[0].id, otp);
      return {
        "status": true,
        "message": "OTP send successfully to " + email
      }
    } else {
      return {
        "status": false,
        "message": "User not found for email " + email
      }
    }
  } catch (error) {
    console.log(error);
    return {
      "status": false,
      "message": "Error..!" + error
    }
  }
}

async function checkIfUserAlreadyExists(email, callback) {
  try {
    const results = await new Promise((resolve, reject) => {
      sql.query(
        "SELECT COUNT(*) AS cnt FROM users WHERE email = ? ", email,
        (err, result) => {
          console.log(err);
          if (err != null) {
            reject(err);
          } else {
            resolve(result);
          }
        }
      );
    });
    console.log(results);
    if (results != null && results[0].cnt > 0) {
      callback(false, "Email already exists", null);
    } else {
      callback(true, "Email not found", null);
    }
  } catch (err) {
    callback(true, "Error..!" + err, err);
  }
}

async function getUsers() {
  try {
    const results = await new Promise((resolve, reject) => {
      sql.query(
        "SELECT * FROM users",
        (err, result) => {
          if (err != null) {
            reject(err);
          } else {
            resolve(result);
          }
        }
      );
    });
    return results;
  } catch (err) {
    console.log(err);
    return [];
  }
}

async function refreshInterestCalculationForUser(User) {
  try {
    const result = await new Promise((resolve, reject) => {
      sql.query(`UPDATE users SET total_interest = ` + User.total_interest + ` ,
          total_principle_amount = ` + User.total_principle_amount + `,
          total_amount = ` + User.total_amount + `
           WHERE id = ?`,
        User.id,
        (err, result) => {
          if (err != null) {
            reject(err);
          } else {
            resolve(result);
          }
        });
    });
    return result;
  } catch (error) {
    console.log(error);
    return null;
  }
}

module.exports = {
  register,
  verifyUserOTP,
  checkIfUserAlreadyExists,
  signIn,
  getUsers,
  refreshInterestCalculationForUser,
  logoutUser,
  forgotPassword
};
