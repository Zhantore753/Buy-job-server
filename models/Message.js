const {Schema, model, ObjectId} = require('mongoose');

const Message = new Schema({
    room: {type: ObjectId, tef: 'Respond'},
    text: {type: String},
    user: {type: ObjectId, ref: 'User', required: true},
    time: {type: Date, default: Date.now()},
    file: {type: ObjectId, ref: 'File'},
    fileName: {type: String},
    filePath: {type: String}
});

module.exports = model('Message', Message);