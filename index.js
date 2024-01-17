require('dotenv').config()
const express = require(`express`)
const app = express()
const bodyParser = require("body-parser");
const querystring = require('querystring');
const cors = require('cors');
const path = require('path')
const port = process.env.BACKEND_PORT || 6969

const weather = require('./api/weather/router')
const email = require('./api/email/router')

app.use(cors())
app.options('*', cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const _dirname = path.dirname("")
const buildPath = path.join(_dirname  , "../client/build");

app.use(express.static(buildPath))

app.get("/*", function(req, res){
    res.sendFile(
        path.join(__dirname, "../client/build/index.html"),
        function (err) {
            if (err) {
            res.status(500).send(err);
            }
        }
    );
})


const generateRandomString = (length) => {
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const values = crypto.getRandomValues(new Uint8Array(length));
    return values.reduce((acc, x) => acc + possible[x % possible.length], "");
}

app.use('/weather', weather)
app.use('/email', email)

app.get('/', (req, res) => {
    res.send("Hello")
})

app.get('/spotify-login', function(req, res) {
    var state = generateRandomString(16);
    var scope = 'user-read-playback-state user-modify-playback-state user-read-currently-playing streaming playlist-read-private playlist-read-collaborative playlist-modify-private playlist-modify-public user-read-playback-position user-read-recently-played user-library-modify user-library-read user-read-email user-read-private';

    res.header('Access-Control-Allow-Origin', '*')
    res.redirect('https://accounts.spotify.com/authorize?' +
        querystring.stringify({
            response_type: 'code',
            client_id: process.env.SPOTIFY_CLIENT_ID,
            scope: scope,
            redirect_uri: process.env.SPOTIFY_CALLBACK_URI,
            state: state
        })
    );
});

app.get('/spotify-callback', (req, res) => {
    var code = req.query.code || null;
    var state = req.query.state || null;

    if (state === null) {
        res.redirect('/#' +
            querystring.stringify({
                error: 'state_mismatch'
            })
        );
    } else {
        const formData = new URLSearchParams();
        formData.append('grant_type', 'authorization_code');
        formData.append('code', code);
        formData.append('redirect_uri', process.env.SPOTIFY_CALLBACK_URI);

        fetch('https://accounts.spotify.com/api/token', {
            method: 'POST',
            body: formData,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': 'Basic ' + (new Buffer.from(process.env.SPOTIFY_CLIENT_ID + ':' + process.env.SPOTIFY_CLIENT_SECRET).toString('base64'))
            }
        })
        .then(spotifyAuthResponse => spotifyAuthResponse.json())
        .then(data => {
            console.log(data);
            if(data.error){
                res.send("Error on spotify auth: " + data.error_description)
            }
            else{
                res.json(data)
            }
        })
        .catch(error => {
            console.error('Error:', error);
            res.send(error)
        });
    }
})




app.listen(port, () => {
    console.log(`server is listening Port:`, port)
})