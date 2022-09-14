require("express");
const sql = require("../utils/db");

async function getTransactionsForUser(colName, colId, checkForActive) {
    try {
        var result;
        if (colName != null && colId != null) {
            result = await new Promise((resolve, reject) => {
                sql.query("SELECT * from Transactions where " + colName + "= ?", colId, (err, result) => {
                    if (err != null) {
                        reject(err);
                    } else {
                        resolve(result);
                    }
                });
            });
        } else {
            if (checkForActive != null) {
                result = await new Promise((resolve, reject) => {
                    sql.query("SELECT * from Transactions where current_status = ?", "Active", (err, result) => {
                        if (err != null) {
                            reject(err);
                        } else {
                            resolve(result);
                        }
                    });
                });
            } else {
                result = await new Promise((resolve, reject) => {
                    sql.query("SELECT * from Transactions ", (err, result) => {
                        if (err != null) {
                            reject(err);
                        } else {
                            resolve(result);
                        }
                    });
                });
            }

        }
        return result;
    } catch (error) {
        console.log(error);
        return null;
    }
}

async function addTransaction(transaction) {
    try {
        const result = await new Promise((resolve, reject) => {
            sql.query(`INSERT into Transactions (id,
                applicant_user_id, 
                principle_amount,
                rate_of_interest, 
                due_date,
                co_applicant_user_id,
                current_status,
                issued_at,
                payed_at,
                village_id,
                owner_id
                ) VALUES (?,?,?,?,?,?,?,?,?,?,?)
                 `, [
                transaction.id,
                transaction.applicant_user_id,
                transaction.principle_amount,
                transaction.rate_of_interest,
                transaction.due_date,
                transaction.co_applicant_user_id,
                transaction.current_status,
                transaction.issued_at,
                transaction.payed_at,
                transaction.village_id,
                transaction.owner_id
            ], (err, result) => {
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


async function update(transaction) {
    try {
        const data = {
            "interest_amount": transaction.interest_amount,
            "current_status": transaction.current_status,
            "total_amount": transaction.total_amount,
            "num_month": transaction.num_month,
            "payed_at": transaction.payed_at,
        }
        const result = await new Promise((resolve, reject) => {
            sql.query("UPDATE Transactions SET ? WHERE id = ?",
                [data, transaction.id],
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
    getTransactionsForUser,
    addTransaction,
    update,
};