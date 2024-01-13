const express = require('express')
const router = express.Router()
const querystring = require('querystring');


router.post('/', (req, res) => {
    city = req.body.city || null;
    state = req.body.state || " ";
    country = req.body.country || " ";

    if(city === null){
        res.status(400)
        res.json({ error: "City cannot be empty"})
    }
    else{
        let url = "https://api.openweathermap.org/data/2.5/weather?" + querystring.stringify({
            q: city + "," + state + "," + country,
            units: 'imperial',
            appid: process.env.OPEN_WEATHER_API_KEY
        }, "&", "=")

        console.log("Accessing " + url)

        fetch(url)
        .then(openWeatherAPIResponse => {
            return openWeatherAPIResponse.json()
        })
        .then(responseJson => {
            errorMessage = responseJson.message || null;

            if(errorMessage === null){
                res.status(200)
                res.json(responseJson)
            }else{
                res.status(400)
                res.json({ error: errorMessage})
            }
        })
        .catch(error => {
            res.status(500)
            console.log(error)
            res.json({ error: "Server Error"})
        })
    }
})


module.exports = router