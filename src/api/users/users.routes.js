const express = require('express');
const router = express.Router();
const User = require('./users.model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

router.post('/register', async (req, res) => {

    const checkEmail = await User.findOne({email: req.body.email});
    console.log(checkEmail);
    if(checkEmail) return res.status(400).send('Email already taken');

    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(req.body.password, salt);

    const user = new User({
        email: req.body.email,
        displayName: req.body.displayName,
        password: hashPassword
    });
    try{
        const savedUser = await user.save();
        res.send({user: user._id});
    } catch(err) {
        res.status(400).send(err);
    }
});


router.post('/login', async (req, res) => {
    
    const user = await User.findOne({email: req.body.email});
    console.log(user);
    if(!user) return res.status(400).send({message:'Email does not exists'});
    

    const validPass = await bcrypt.compare(req.body.password, user.password);
    if(!validPass) return res.status(400).send({message:'Invalid password!'});

    //JWT
    const token = jwt.sign({_id: user._id, email: user.email}, process.env.TOKEN);
    res.header('auth-token', token).send({token: token});

   // res.send('Successfully logged in');
})

module.exports = router;