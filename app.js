const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config()

const app = express();
app.use(express.json());

//DB connection..
mongoose.connect(process.env.CONNECTION_STRING, {useNewUrlParser: true, useUnifiedTopology: true}, () => {
    console.log('Successfully connected with MongoDB');
})



const user = require('./src/api/users/users.routes');
const bucket = require('./src/api/buckets/buckets.routes');
const product = require('./src/api/products/products.routes');

app.use('/api/users', user);
app.use('/api/buckets', bucket);
app.use('/api/products', product);

//Server start..
app.listen(3000, '192.168.0.105', () => {
    console.log('Server has started');
})