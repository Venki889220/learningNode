const uuid = require('uuid');
const { getVillage,
    addVillage,
    refreshInterestCalculationForVillage } = require('../model/villageModel');
const { getCustomers } = require("../model/customerModel");

async function getVillages(req, res) {
    try {
        const result = await getVillage(req.query.colName, req.query.colId);
        if (result != null) {
            res.send({
                "status": "success",
                "result": result
            });
            return;
        } else {
            res.status(404).send({
                error: error,
                message: "Please provide a vaild User Id",
            });
            return;
        }
    } catch (error) {
        res.status(404).send({
            error: error,
            message: "Please provide a vaild User Id",
        });
        return;
    }
}

async function addVillages(req, res) {
    try {
        if (req.body.name != null) {
            const village = {
                "id": uuid.v4(),
                "name": req.body.name,
                "owner_id": req.userId
            }
            const result = await addVillage(village);
            if (result != null) {
                res.send({
                    "status": "success",
                    "message": "Village added successfully"
                });
                return;
            } else {
                res.status(404).send({
                    error: error,
                    message: "Please provide a vaild Village Details",
                });
                return;
            }
        } else {
            res.status(404).send({
                error: error,
                message: "Please provide a vaild Village details",
            });
            return;
        }
    } catch (error) {
        console.log(error);
        res.status(404).send({
            error: error,
            message: "Please provide a vaild Village details",
        });
        return;
    }
}

async function refreshAllInterestCalculationForVillage() {
    try {
        const result = await getVillage();
        if (result != null) {
            if (result.length > 0) {
                for (const village of result) {
                    await refreshInterestCalculationsForVillages(village);
                }
            }
        } else {
            console.log("Failed to User updated transaction");
            return;
        }
    } catch (error) {
        console.log(error);
        return;
    }
}
async function refreshInterestCalculationsForVillages(village) {
    try {
        const result = await getCustomers('village_id', village.id);
        if (result.length > 0) {
            var totalInterest = 0;
            var totalAmount = 0;
            var totalPrincipleAmount = 0;
            result.forEach(customer => {
                totalInterest = totalInterest + customer.total_interest;
                totalAmount = totalAmount + customer.total_amount;
                totalPrincipleAmount = totalPrincipleAmount + customer.total_principle_amount;
            });
            village.total_principle_amount = totalPrincipleAmount;
            village.total_interest = totalInterest;
            village.total_amount = totalAmount;
            const updateResult = await refreshInterestCalculationForVillage(village);
            if (updateResult != null) {
                console.log("village transactions updated successfully");
            } else {
                console.log("Failed to updated village transactions");
            }
        }
        return;
    } catch (error) {
        console.log(error);
        return;
    }
}
module.exports = {
    getVillages,
    addVillages,
    refreshAllInterestCalculationForVillage
};