const express = require('express')
const router = express.Router()


router.post('/', (req, res) => {
    from = req.body.from || null;
    message = req.body.message || null;

    if(!from || !message){
        res.status(400)
        res.json({ error: "from or message is null"})
    }else{
        console.log(from, message)
        res.status(200)
        res.json({status: 'you good'})
    }
});

module.exports = router