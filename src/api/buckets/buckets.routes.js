const express = require('express');
const router = express.Router();
const bucket = require('./buckets.model');
const product = require('../products/products.model');
const user = require('../users/users.model')
const veryfy = require('../../config/verifyToken');
const jwt_decode = require('jwt-decode')
var middlewear = require('../../util/middlewares');

//Create new baskets
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

//Get list of all baskets
router.get('/',veryfy, async (req, res) => {
    try {
        const currentLUserId = (jwt_decode(req.header('auth-token')))._id;

        const buckets = await bucket.find({users: currentLUserId});
        res.json({buckets: buckets});        
    } catch(err) {
        res.status(400).json({message: err.message});
    }
});

//Get one basket by id
router.get('/:id', veryfy, middlewear.getBucket, (req, res) => {
    res.json(res.bucket);
});

//Delete one basket by id
router.delete('/:id', veryfy, middlewear.getBucket, async (req, res) => {
    try {
        await res.bucket.remove();
        res.json({message: 'Bucket has been deleted'});
    } catch(err) {
        res.status(500).send({message: err.message});
    }
})

//Get list of product from one basket by its id
router.post('/:id/products', veryfy, middlewear.getBucket, async (req,res) => {
    
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

//Update product isBought property by basket id (:id) and product id (:productId)
router.patch('/:id/products/:productId', veryfy, middlewear.getProduct, async (req, res) => {
    res.product.isBought = req.body.isBought;
    try {

        const updateProduct = await res.bucket.save();
        const getBasket = await bucket.findById(req.params.id);

        var count = true;
        (getBasket.products).forEach(element => {
            if(element.isBought==false) {
                count = false
            }
        });
        if(count==true) {
            res.status(200).json(updateProduct);
        } else res.status(210).json(updateProduct);

        //res.json(updateProduct);
    
    } catch(err) {
        res.status(500).json({message: err.message});
    }
});

router.delete('/:id/products/:productId', veryfy, middlewear.getProduct, async (req, res) => {
    var product = res.product;
    //console.log(product);
    try{
        await bucket.updateOne({_id: req.params.id}, {$pullAll: {products:[product]}});
    } catch(err) {
        console.log(err.message);
    }
    
});

//Get list of products from one bucket by its id
router.get('/:id/products', veryfy, middlewear.getBucket, async (req, res) => {
    res.json(res.bucket.products);

})

//Delete one basket

router.delete('/:id', veryfy, async (req, res) => {
    try {
        await bucket.findByIdAndDelete(req.params.id);
    } catch(err) {
        res.status(400).send({message: err.message});
    }
    return res.status(200).send({message: 'Successfuly deleted a basket!'});

});

module.exports = router;