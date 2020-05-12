const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const product = require('../products/products.model');

const shiet = new mongoose.Schema({
    name: String
})

const bucketSchema = new mongoose.Schema({
    bucketName: {
        type: String,
        required: true
    },
    users: [{type: Schema.Types.ObjectId, ref: 'user'}],
    //products: [{type: Schema.Types.ObjectId, ref: 'product'}]
    products: [product.schema]
})

module.exports = mongoose.model('bucket', bucketSchema);