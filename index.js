// require("dotenv").config();
const express = require(`express`);
const app = express();
const bodyParser = require("body-parser");
const querystring = require("querystring");
const cors = require("cors");
const path = require("path");
// const port = process.env.BACKEND_PORT || 6969;

const AWS = require("aws-sdk");
AWS.config.update({ region: "us-east-1" });
const secretsManager = new AWS.SecretsManager();

const weather = require("./api/weather/router");
const email = require("./api/email/router");

app.use(cors());
app.options("*", cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const parent_dir = path.resolve(__dirname, '..')
const buildPath = path.join(parent_dir, "client/build");

app.use(express.static(buildPath));

secretsManager.getSecretValue({ SecretId: "portfolio" }, (err, data) => {
  if (err) {
    console.error(err);
  } else {
    // Parse the secret JSON data
    const secret = JSON.parse(data.SecretString);
    const port = secret.port;

    app.get("/*", function (req, res) {
      console.log(buildPath)
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

    app.get("/", (req, res) => {
      res.send("Hello");
    });

    app.listen(port, () => {
      console.log(`server is listening Port:`, port);
    });
  }
});
