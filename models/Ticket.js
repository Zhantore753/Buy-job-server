const {Schema, model, ObjectId} = require('mongoose');

const Ticket = new Schema({
    user: {type: ObjectId, ref: 'User'},
    title: {type: String, required: true},
    description: {type: String, required: true},
    date: {type: Date, default: Date.now()},
    files: [{type: ObjectId, ref: 'File'}],
    status: {type: String, enum: ['В процессе', 'Исполнено'], default: 'В процессе'}
});

module.exports = model('Ticket', Ticket);