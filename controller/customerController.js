const uuid = require('uuid');
const {
    registerCustomer,
    getCustomers,
    refreshInterestCalculationForCustomer,
} = require('../model/customerModel');

const { getUserTransactions } = require('./transactionController');

async function getCustomer(req, res) {
    try {
        const result = await getCustomers(req.query.colName, req.query.colId);
        if (result != null) {
            res.send({
                "status": "Success",
                "result": result
            });
            return;
        } else {
            res.status(404).send({
                error: error,
                message: "Please provide a vaild Customer",
            });
            return;
        }
    } catch (error) {
        res.status(404).send({
            error: error,
            message: "Please provide a vaild Customer",
        });
        return;
    }
}

async function registerCustomers(req, res) {
    try {
        if (req.body.name != null &&
            req.body.phone_number != null &&
            req.body.village_id != null &&
            req.body.address != null) {

            const Customer = {
                "id": uuid.v4(),
                "name": req.body.name,
                "phone_number": req.body.phone_number,
                "village_id": req.body.village_id,
                "address": req.body.address,
                "owner_id": req.userId
            }
            const result = await registerCustomer(Customer);
            if (result != null) {
                res.send({
                    "status": "success",
                    "message": req.body.name + " added sucessfully"
                });
                return;
            } else {
                res.status(404).send({
                    error: error,
                    message: "Please provide a vaild transaction details",
                });
                return;
            }
        } else {
            res.status(404).send({
                error: error,
                message: "Please provide a vaild transaction details",
            });
            return;
        }
    } catch (error) {
        console.log(error);
        res.status(404).send({
            error: error,
            message: "Please provide a vaild transaction details",
        });
        return;
    }
}


async function refreshAllInterestCalculationForCustomer() {
    try {
        const result = await getCustomers();
        if (result != null) {
            if (result.length > 0) {
                for (const customer of result) {
                    await refreshInterestCalculationsForCustomers(customer);
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

async function refreshInterestCalculationsForCustomers(customer) {
    try {
        const result = await getUserTransactions('applicant_user_id', customer.id);
        if (result != null) {
            customer.total_principle_amount = result.total_principle_amount;
            customer.total_interest = result.total_interest;
            customer.total_amount = result.total_amount;
            const updateResult = await refreshInterestCalculationForCustomer(customer);
            if (updateResult != null) {
                console.log("User transactions updated successfully");
                return;
            } else {
                console.log("Failed to User updated transactions");
                return;
            }
        }
    } catch (error) {
        console.log(error);
        return;
    }
}

module.exports = {
    getCustomer,
    registerCustomers,
    refreshAllInterestCalculationForCustomer
};