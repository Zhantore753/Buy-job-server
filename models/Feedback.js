const {Schema, model, ObjectId} = require('mongoose');

const Feedback = new Schema({
    order: {type: ObjectId, ref: 'Order'},
    toUser: {type: ObjectId, ref: 'User'}, // Кому
    fromUser: {type: ObjectId, ref: 'User'}, // От кого
    rating: {type: Number, required: true, min: 0.5, max: 5}
});

module.exports = model('Feedback', Feedback);