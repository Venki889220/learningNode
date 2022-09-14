require("express");
const sql = require("../utils/db");

async function getVillage(colName, colId) {
    try {
        var result;
        if (colName != null && colId != null) {
            result = await new Promise((resolve, reject) => {
                sql.query("SELECT * from Village where " + colName + "= ?", colId, (err, result) => {
                    if (err != null) {
                        reject(err);
                    } else {
                        resolve(result);
                    }
                });
            });
        } else {
            result = await new Promise((resolve, reject) => {
                sql.query("SELECT * from Village ", (err, result) => {
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

async function addVillage(Village) {
    try {
        const result = await new Promise((resolve, reject) => {
            sql.query(`INSERT into Village (id,
                name,
                owner_id
                ) VALUES (?,?,?)
                 `, [
                Village.id,
                Village.name,
                Village.owner_id
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

async function refreshInterestCalculationForVillage(Village) {
    try {
        const result = await new Promise((resolve, reject) => {
            sql.query(`UPDATE Village SET total_interest = ` + Village.total_interest + ` ,
            total_principle_amount = ` + Village.total_principle_amount + `,
            total_amount = ` + Village.total_amount + `
             WHERE id = ?`,
                Village.id,
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
    getVillage,
    addVillage,
    refreshInterestCalculationForVillage
};