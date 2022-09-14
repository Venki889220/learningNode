require("express");
const sql = require("../utils/db");

async function registerCustomer(Customer) {
    try {
        const result = await new Promise((resolve, reject) => {
            sql.query(
                `INSERT INTO Customer (id,
                    name,
                    phone_number,
                    village_id,
                    owner_id,
                    address,
                    active
                    ) VALUES (?,?,?,?,?,?,?)`,
                [
                    Customer.id,
                    Customer.name,
                    Customer.phone_number,
                    Customer.village_id,
                    Customer.owner_id,
                    Customer.address,
                    1,
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
        return result;
    } catch (err) {
        return null;
    }
}

async function getCustomers(colName, colId) {
    try {
        var result;
        if (colName != null && colId != null) {
            result = await new Promise((resolve, reject) => {
                sql.query("SELECT * from Customer where " + colName + "= ?", colId, (err, result) => {
                    if (err != null) {
                        reject(err);
                    } else {
                        resolve(result);
                    }
                });
            });
        } else {
            result = await new Promise((resolve, reject) => {
                sql.query("SELECT * from Customer ", (err, result) => {
                    if (err != null) {
                        reject(err);
                    } else {
                        resolve(result);
                    }
                });
            });
        }
        return result;
    } catch (error) {
        console.log(error);
        return null;
    }
}

async function refreshInterestCalculationForCustomer(Customer) {
    try {
        const result = await new Promise((resolve, reject) => {
            sql.query(`UPDATE Customer SET total_interest = ` + Customer.total_interest + ` ,
            total_principle_amount = ` + Customer.total_principle_amount + `,
            total_amount = ` + Customer.total_amount + `
             WHERE id = ?`,
                Customer.id,
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
    registerCustomer,
    getCustomers,
    refreshInterestCalculationForCustomer,

}