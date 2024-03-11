const express = require(`express`);
const app = express();
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");

const AWS = require("aws-sdk");
AWS.config.update({ region: "us-east-1" });
const secretsManager = new AWS.SecretsManager();

app.use(cors());
app.options("*", cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const parent_dir = path.resolve(__dirname, '..')
const buildPath = path.join(parent_dir, "client/build");
app.use(express.static(buildPath));

var port = 6969; //Default port in case secrets don't work
secretsManager.getSecretValue({ SecretId: "portfolio" }, (err, data) => {
  if (err) {
    console.error(err);
  } else {
    const secret = JSON.parse(data.SecretString);
    port = secret.port;
  }
});

const weather = require("./api/weather/router");
const email = require("./api/email/router");

app.get("/*", function (req, res) {
  res.sendFile(
    path.join(buildPath, "index.html"),
    function (err) {
      if (err) {
        res.status(500).send(err);
      }
    }
  );
});

app.use("/weather", weather);
app.use("/email", email);

app.listen(port, () => {
  console.log(`server is listening Port:`, port);
});