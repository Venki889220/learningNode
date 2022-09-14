const { getTransactionsForUser,
    addTransaction,
    update } = require('../model/transactionModel');
const uuid = require('uuid');
var moment = require('moment'); // require

const TransactionStatus = {
    Active: "Active",
    Payed: "Payed",
    Due: "Due"
}

async function getUserTransactions(req, res) {
    try {
        var reqs;
        var colName;
        var colId;
        if (req.query != null) {
            reqs = req;
            colName = req.query.colName
            colId = req.query.colId
        } else {
            colName = req;
            colId = res;
        }
        const result = await getTransactionsForUser(colName, colId);
        var totalInterest = 0;
        var totalAmount = 0;
        var totalPrincipleAmount = 0;
        if (result != null) {
            if (result.length > 0) {
                result.forEach(transaction => {
                    totalInterest = totalInterest + transaction.interest_amount;
                    totalAmount = totalAmount + transaction.total_amount;
                    totalPrincipleAmount = totalPrincipleAmount + transaction.principle_amount;
                });
            }
            if (reqs != null) {
                res.send({
                    "status": "Success",
                    "total_interest": totalInterest,
                    "total_amount": totalAmount,
                    "total_principle_amount": totalPrincipleAmount,
                    "result": result
                });
            }
            return {
                "status": "Success",
                "total_interest": totalInterest,
                "total_amount": totalAmount,
                "total_principle_amount": totalPrincipleAmount,
                "result": result
            };
        } else {
            if (reqs != null) {
                res.status(404).send({
                    error: error,
                    message: "Please provide a vaild User transaction",
                })
            };
            return {
                error: error,
                message: "Please provide a vaild User transaction",
            };
        }
    } catch (error) {
        console.log(error);
        if (reqs != null) {
            res.status(404).send({
                error: error,
                message: "Please provide a vaild User transaction",
            })
        };
        return {
            error: error,
            message: "Please provide a vaild User transaction",
        };
    }
}

async function refreshAllInterestCalculation() {
    try {
        const result = await getTransactionsForUser(null, null, true);
        if (result != null) {
            if (result.length > 0) {
                for (const transaction of result) {
                    await refreshInterestCalculations(transaction.id);
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

async function refreshInterestCalculations(id) {
    try {
        const result = await getTransactionsForUser('id', id);
        if (result.length == 1) {
            const transaction = result[0];
            const startDate = moment(transaction.issued_at);
            const dueDate = moment(transaction.due_date);
            const endDate = moment(new Date());
            const dayDiff = endDate.diff(startDate, 'days');
            var monthDiff = (dayDiff / 30).toFixed(1);
            if (dayDiff < 15) {
                monthDiff = 0.5;
            } else if (dayDiff < 30) {
                monthDiff = 1;
            } else {
                const decimalStr = monthDiff.toString().split('.')[1];
                monthDiff = Math.trunc(monthDiff)
                if (decimalStr > 5) {
                    monthDiff = monthDiff + 1
                } else if (decimalStr > 0) {
                    monthDiff = monthDiff + 0.5
                }
            }
            if (endDate > dueDate) {
                const dueDateDiff = dueDate.diff(endDate, 'days');
                var dueDatemonthDiff = (dueDateDiff / 30).toFixed(1);
                if (dueDateDiff < 15) {
                    dueDatemonthDiff = 0.5;
                } else if (dueDateDiff < 30) {
                    dueDatemonthDiff = 1;
                } else {
                    const decimalStr = dueDatemonthDiff.toString().split('.')[1];
                    dueDatemonthDiff = Math.trunc(dueDatemonthDiff)
                    if (decimalStr > 5) {
                        dueDatemonthDiff = dueDatemonthDiff + 1
                    } else if (decimalStr > 0) {
                        dueDatemonthDiff = dueDatemonthDiff + 0.5
                    }
                }
                transaction.current_status = TransactionStatus.Due;
            }

            const interest = transaction.principle_amount * (transaction.rate_of_interest / 100) * monthDiff;
            transaction.interest_amount = interest;
            transaction.total_amount = transaction.principle_amount + interest;
            transaction.num_month = monthDiff;
            const updateResult = await update(transaction);
            if (updateResult != null) {
                console.log("User transaction updated successfully");
                return;
            } else {
                console.log("Failed to User updated transaction");
                return;
            }
        }
    } catch (error) {
        console.log(error);
        return;
    }
}

async function payUserTransaction(req, res) {
    try {
        const result = await getTransactionsForUser(req.body.colName, req.body.colId);
        if (result.length == 1) {
            const transaction = result[0];
            transaction.current_status = TransactionStatus.Payed
            transaction.payed_at = new Date;
            const updatedStatus = await update(transaction);
            if (updatedStatus != null) {
                res.send({
                    "status": "User transaction updated successfully",
                    "result": result
                });
            } else {
                res.status(404).send({
                    error: error,
                    message: "Please provide a vaild User transaction",
                });
            }

            return;
        } else {
            res.status(404).send({
                error: error,
                message: "Please provide a vaild User transaction",
            });
            return;
        }
    } catch (error) {
        res.status(404).send({
            error: error,
            message: "Please provide a vaild User transaction",
        });
        return;
    }
}

async function addUserTransactions(req, res) {
    try {
        if (req.body.applicant_user_id != null &&
            req.body.principle_amount != null &&
            req.body.village_id != null &&
            req.body.rate_of_interest != null &&
            req.body.due_date != null) {
            const currentDate = moment(Date.now()).format('YYYY-MM-DD HH:mm:ss');
            const dueDate = moment(Date.parse(req.body.due_date)).format('YYYY-MM-DD HH:mm:ss');
            var payDate = null;
            if (req.body.payed_at != null) {
                payDate = moment(Date.parse(req.body.payed_at)).format('YYYY-MM-DD HH:mm:ss');
            }
            const transaction = {
                "id": uuid.v4(),
                "applicant_user_id": req.body.applicant_user_id,
                "principle_amount": req.body.principle_amount,
                "rate_of_interest": req.body.rate_of_interest,
                "interest_amount": req.body.interest_amount ?? 0,
                "due_date": dueDate ?? currentDate,
                "co_applicant_user_id": req.body.co_applicant_user_idv ?? null,
                "current_status": TransactionStatus.Active,
                "issued_at": currentDate,
                "payed_at": payDate ?? null,
                "village_id": req.body.village_id,
                "owner_id": req.userId
            }
            const result = await addTransaction(transaction);
            if (result != null) {
                res.send({
                    "status": "success",
                    "message": "Transaction added sucessfully"
                });
                return;
            } else {
                res.status(404).send({
                    error: error,
                    message: "Please provide a vaild User Id",
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
            message: "Please provide a vaild User Id",
        });
        return;
    }
}

module.exports = {
    getUserTransactions,
    addUserTransactions,
    refreshAllInterestCalculation,
    payUserTransaction
};