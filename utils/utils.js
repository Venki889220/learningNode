const CronJob = require('cron').CronJob;
const { refreshAllInterestCalculation } = require("../controller/transactionController");
const { refreshAllInterestCalculationForCustomer } = require("../controller/customerController");
const { refreshAllInterestCalculationForVillage } = require("../controller/villageController");
const { refreshAllInterestCalculationForUser } = require("../controller/authController");


async function refreshDatanow() {
    await refreshAllInterestCalculation();
    await refreshAllInterestCalculationForCustomer();
    await refreshAllInterestCalculationForVillage();
    await refreshAllInterestCalculationForUser();
}

function setUpCronJob() {
    const job = new CronJob(
        '0 1 0 * * *',// This job will run at 12:01 AM every day
        refreshDatanow,
        null,
        true,
    );
    job.start();
    refreshDatanow();
}

module.exports = { setUpCronJob, refreshDatanow };