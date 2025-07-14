const express = require("express");
const router = express.Router();
const bcrypt = require('bcrypt');


router.get("/", (req, res) => {
    res.render("login");
});

router.post('/', (req, res) => {
    const { username, password } = req.body;

    if (username !== process.env.ADMIN_USERNAME) {
        return res.status(401).send("Грешен потребител");
    }

    const isMatch = bcrypt.compareSync(password, process.env.ADMIN_PASSWORD_HASH);
    if (!isMatch) {
        return res.status(401).send("Грешна парола");
    }

    res.cookie('auth', 'admin', { httpOnly: true, signed: true });
    res.redirect('/admin');
});


module.exports = router;