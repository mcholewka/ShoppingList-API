const bucket = require('../api/buckets/buckets.model');

module.exports = {
    getBucket:async function (req, res, next) {
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
    },
    getProduct:async function (req, res, next) {
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
  };