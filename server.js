const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const authRouter = require("./routes/authRoute");
const transactionsRouter = require("./routes/transactionRoute");
const villagesRouter = require("./routes/villageRoute");
const customerRouter = require("./routes/customerRoute");
const { setUpCronJob } = require("./utils/utils");
const { authenticateJWT } = require("./utils/middlewares");
const app = express();
app.use(
  cors({
    origin: true,
  })
);
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

app.use("/", function (request, response, next) {
  request.headers.lang = request.headers.lang || "default";
  console.log(
    `IP: ${request.connection.remoteAddress} Method: ${request.method} Route: ${request.originalUrl} Body: ` +
    JSON.stringify(request.body)
  );
  next();
});

app.use("/api/auth", authRouter);
app.use("/api/transaction", [authenticateJWT], transactionsRouter);
app.use("/api/village", [authenticateJWT], villagesRouter);
app.use("/api/customer", [authenticateJWT], customerRouter);

app.listen(3000, () => {
  console.log("server running " + 3000 + "..! ");
  setUpCronJob();
});
