const {Schema, model, ObjectId} = require('mongoose');

const Order = new Schema({
    title: {type: String, required: true},
    description: {type: String, required: true},
    date: {type: Date, default: Date.now()},
    price: {type: Number},
    type: {type: String},
    subject: {type: String},
    feedback: {type: ObjectId, ref: 'Feedback'},
    status: {type: String, enum: ['Участвует в конкурсе', 'Исполнено', 'Заказ отменён']},
    files: [{type: ObjectId, ref: 'File'}],
    user: {type: ObjectId, ref: 'User'}, // Заказчик
    responds: [{type: ObjectId, ref: 'Respond'}], // Список всех исполнителей подавших заявку
    executor: {type: ObjectId, ref: 'User'} // Выбраный исполнитель
});

module.exports = model('Order', Order);