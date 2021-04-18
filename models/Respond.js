const {Schema, model, ObjectId} = require('mongoose');

const Respond = new Schema({
    description: {type: String},
    executor: {type: ObjectId, ref: 'User'},
    offer: {type: Number, required: true},
    order: {type: ObjectId, ref: 'Order'},
    messages: [{type: ObjectId, ref: 'Message'}],
});

module.exports = model('Respond', Respond);