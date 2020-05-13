const express = require('express');
const router = express.Router();
const bucket = require('./buckets.model');
const product = require('../products/products.model');
const user = require('../users/users.model')
const veryfy = require('../../config/verifyToken');
const jwt_decode = require('jwt-decode')

router.post('/', veryfy, async (req, res) => {
    
    try {
        const currentLUserId = (jwt_decode(req.header('auth-token')))._id;

        const createBucket = new bucket({
            bucketName: req.body.bucketName,
            users: currentLUserId
        });

        const saveBucket = await createBucket.save();

        const currrentUser = await user.findById(currentLUserId);
        currrentUser.buckets.push({_id: saveBucket._id});
        await currrentUser.save();
        
        res.status(201).json(saveBucket); 

    } catch(err) {
        res.status(400).json({message: err.message});
    }
});

router.get('/',veryfy, async (req, res) => {
    try {
        const currentLUserId = (jwt_decode(req.header('auth-token')))._id;

        const buckets = await bucket.find({users: [currentLUserId]});
        res.json({buckets: buckets});        
    } catch(err) {
        res.status(400).json({message: err.message});
    }
})

router.get('/:id', veryfy, getBucket, (req, res) => {
    res.json(res.bucket);
});

router.delete('/:id', veryfy, getBucket, async (req, res) => {
    try {
        await res.bucket.remove();
        res.json({message: 'Bucket has been deleted'});
    } catch(err) {
        res.status(500).send({message: err.message});
    }
})

//Product
router.post('/:id/products', veryfy, getBucket, async (req,res) => {
    
    const newProduct = new product.model({
        productName: req.body.productName,
        quantity: req.body.quantity,
        description: req.body.description,
        isBought: req.body.isBought
    });
    const bucketParent = res.bucket;
    
    try {
        bucketParent.products.push(newProduct);
        await bucketParent.save();
        res.json({message: 'Product has been added to the bucket'});
    } catch(err) {
        res.status(500).send({message: err.message});
    }
});


router.patch('/:id/products/:productId', veryfy, getProduct, async (req, res) => {
    res.product.isBought = req.body.isBought;
    try {

        const updateProduct = await res.bucket.save();
        console.log('lecimy');
        res.json(updateProduct);
    } catch(err) {
        res.status(500).json({message: err.message});
    }
});

router.get('/:id/products', veryfy, getBucket, async (req, res) => {
    res.json(res.bucket.products);

})


//Middlewear
async function getBucket(req, res, next) {
    try {
        oneBucket = await bucket.findById(req.params.id);
        if(oneBucket == null) {
            return res.status(400).json({message: "Cannot find that shopping bucket"});

        }
    } catch(err) {
        return res.status(500).json({message: err.message});
    }

    res.bucket = oneBucket;
    next();
}

async function getProduct(req, res, next) {
    try {
        oneBucket = await bucket.findById(req.params.id);
        oneProduct = oneBucket.products.id(req.params.productId);
        
    } catch(err) {
        return res.status(500).json({message: err.message});
    }
    res.product = oneProduct;
    res.bucket = oneBucket;
    next();
}

module.exports = router;