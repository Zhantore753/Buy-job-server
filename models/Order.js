const {Schema, model, ObjectId} = require('mongoose');

const Order = new Schema({
    title: {type: String, required: true},
    description: {type: String, required: true},
    deadline: {type: Date, default: Date.now()},
    date: {type: Date, default: Date.now()},
    price: {type: Number},
    keyWords: [{type: String}],
    category: {type: String},
    subject: {type: String},
    execFeedback: {type: ObjectId, ref: 'Feedback'}, // Отзыв исполнителя
    userFeedback: {type: ObjectId, ref: 'Feedback'}, // Отзыв заказчика
    status: {type: String, enum: ['Участвует в конкурсе', 'Выполняется', 'Исполнено', 'Заказ отменён'], default: 'Участвует в конкурсе'},
    files: [{type: ObjectId, ref: 'File'}],
    user: {type: ObjectId, ref: 'User'}, // Заказчик
    responds: [{type: ObjectId, ref: 'Respond'}], // Список всех исполнителей подавших заявку
    executorRespond: {type: ObjectId, ref: 'Respond'}, // Выбраный исполнитель
    executor: {type: String}
});

module.exports = model('Order', Order);