const express = require("express");
const router = express.Router();
const querystring = require("querystring");

const NodeCache = require("node-cache");
const weatherCache = new NodeCache({ stdTTL: 10000 });

const AWS = require("aws-sdk");
AWS.config.update({ region: "us-east-1" });
const secretsManager = new AWS.SecretsManager();

router.post("/", (req, res) => {
  secretsManager.getSecretValue({ SecretId: "portfolio" }, (err, data) => {
    if (err) {
      res.status(500);
      console.log("Error in getting secret value: ", err);
      res.json({ error: "Server Error" });
    } else {
      const city = req.body.city || null;
      const state = req.body.state || " ";
      const country = req.body.country || " ";

      if (city === null) {
        res.status(400).json({ error: "City cannot be empty" });
      } else {
        if (weatherCache.has(city)) {
          return res.status(200).json(weatherCache.get(city));
        }

        const secret = JSON.parse(data.SecretString);
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
              weatherCache.set(city, responseJson);
              res.status(200).json(responseJson);
            } else {
              res.status(400).json({ error: errorMessage });
            }
          })
          .catch((error) => {
            console.log("Error on weather image: ", error);
            res.status(500).json({ error: "Server Error" });
          });
      }
    }
  });
});

module.exports = router;
