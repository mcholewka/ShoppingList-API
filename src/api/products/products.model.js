const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const productSchema = new mongoose.Schema({
    productName: {
        type: String,
        required : true
    },
    quantity: {
        type: Number
    },
    description: {
        type: String
    },
    isBought: {
        type: Boolean,
        default: false
    }

})
//module.exports = mongoose.model('product', productSchema);
module.exports.model = mongoose.model('product', productSchema);
module.exports.schema = productSchema