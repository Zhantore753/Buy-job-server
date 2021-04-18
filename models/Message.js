const {Schema, model, ObjectId} = require('mongoose');

const Message = new Schema({
    room: {type: ObjectId, tef: 'Respond'},
    text: {type: String, required: true},
    user: {type: ObjectId, ref: 'User', required: true},
    time: {type: Date, default: Date.now()},
    files: [{type: ObjectId, ref: 'File'}]
});

module.exports = model('Message', Message);