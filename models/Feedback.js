const {Schema, model, ObjectId} = require('mongoose');

const Feedback = new Schema({
    order: {type: ObjectId, ref: 'Order'},
    toUser: {type: ObjectId, ref: 'User'}, // Кому
    fromUser: {type: ObjectId, ref: 'User'}, // От кого
    text: {type: String},
    value: {type: Number, required: true}
});

module.exports = model('Feedback', Feedback);