const {Schema, model, ObjectId} = require('mongoose');

const File = new Schema({
    name: {type: String, required: true},
    type: {type: String},
    path: {type: String, default: '', required: true},
    size: {type: Number, default: 0},
    order: {type: ObjectId, ref: 'Order', required: false},
    ticket: {type: ObjectId, ref: 'Ticket', required: false},
    message: {type: ObjectId, ref: 'Message', required: false},
    user: {type: ObjectId, ref: 'User'}
});

module.exports = model('File', File);