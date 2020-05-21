const express = require('express');
const router = express.Router();
const User = require('./users.model');
const Basket = require('../buckets/buckets.model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const veryfy = require('../../config/verifyToken');
var middlewear = require('../../util/middlewares');

//Register user
router.post('/register', async (req, res) => {

    const checkEmail = await User.findOne({email: req.body.email});
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

//Login user, add auth-token to header
router.post('/login', async (req, res) => {
    
    const user = await User.findOne({email: req.body.email});
    if(!user) return res.status(400).send({message:'Email does not exists'});
    

    const validPass = await bcrypt.compare(req.body.password, user.password);
    if(!validPass) return res.status(400).send({message:'Invalid password!'});

    //JWT
    const token = jwt.sign({_id: user._id, email: user.email, displayName: user.displayName}, process.env.TOKEN);
    res.header('auth-token', token).send({token: token});
});

//Add new basket to the user and add user _id to basket
router.post('/basket/:id', veryfy, middlewear.getBucket ,async (req, res) => {
    const user = await User.findOne({email: req.body.email});
    if(!user) return res.status(400).send({message:'That user does not exists'});
    
    const userWithoutBasket = await User.findOne({ email: req.body.email, buckets: {"$in": [req.params.id]}});
    if(userWithoutBasket!=null) return res.status(400).send({message:'This user is already in this basket'});

    user.buckets.push({_id: req.params.id});
    await user.save();

    const bucketParent = res.bucket;
    bucketParent.users.push({_id: user._id});
    bucketParent.save();
    return res.status(200).send('User has been added succesfully!');
});

//Get all users that belongs to one basket by basket id:

router.get('/basket/:id/userlist', veryfy, async (req,res) => {
    const getBasket = await Basket.findById(req.params.id);

    await getBasket.populate('users').execPopulate();

    const users = getBasket.populate('users');

    return res.status(200).json(users.users);
});

//Delete user from basket

router.delete('/:userId/basket/:basketId', veryfy, async (req, res) => {

    try {
        const basket = await Basket.updateOne({_id: req.params.basketId}, { $pullAll: {users: [req.params.userId] }});
        const user = await User.updateOne({_id: req.params.userId}, { $pullAll: {buckets: [req.params.basketId]}});
    } catch(err) {
        return res.status(400).send({message: err.message});
    }
    
    return res.status(200).send({message: 'Usunieto!'});
});

module.exports = router;