const express = require("express");
const router = express.Router();
const querystring = require("querystring");
const AWS = require("aws-sdk");
AWS.config.update({ region: "us-east-1" });
const secretsManager = new AWS.SecretsManager();

router.post("/", (req, res) => {
  secretsManager.getSecretValue({ SecretId: "portfolio" }, (err, data) => {
    if (err) {
      res.status(500);
      console.log(err);
      res.json({ error: "Server Error" });
    } else {
      const secret = JSON.parse(data.SecretString);

      const city = req.body.city || null;
      const state = req.body.state || " ";
      const country = req.body.country || " ";

      if (city === null) {
        res.status(400);
        res.json({ error: "City cannot be empty" });
      } else {
        let url =
          "https://api.openweathermap.org/data/2.5/weather?" +
          querystring.stringify(
            {
              q: city + "," + state + "," + country,
              units: "imperial",
              appid: secret.openWeatherApiKey,
            },
            "&",
            "="
          );

        fetch(url)
          .then((openWeatherAPIResponse) => {
            return openWeatherAPIResponse.json();
          })
          .then((responseJson) => {
            errorMessage = responseJson.message || null;

            if (errorMessage === null) {
              res.status(200);
              res.json(responseJson);
            } else {
              res.status(400);
              res.json({ error: errorMessage });
            }
          })
          .catch((error) => {
            res.status(500);
            console.log(error);
            res.json({ error: "Server Error" });
          });
      }
    }
  });
});

module.exports = router;
