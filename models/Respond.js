const {Schema, model, ObjectId} = require('mongoose');

const Respond = new Schema({
    executor: {type: ObjectId, ref: 'User'},
    offer: {type: Number, required: true},
    order: {type: ObjectId, ref: 'Order'},
    status: {type: String, enum: ['Участвует в конкурсе', 'Выполняется', 'Исполнено', 'Заказ отменён'], default: 'Участвует в конкурсе'},
    messages: [{type: ObjectId, ref: 'Message'}],
});

module.exports = model('Respond', Respond);