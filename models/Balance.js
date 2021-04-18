const {Schema, model, ObjectId} = require('mongoose');

const BalanceAction = new Schema({
    user: {type: ObjectId, ref: 'User'},
    date: {type: Date, default: Date.now()},
    action: {type: String, enum: ['Пополнение', 'Вывод']},
    sum: {type: Number, default: 0},
    status: {type: String, enum: ['Успешно', 'Отказ', 'Идет проверка']},
});

module.exports = model('BalanceAction', BalanceAction);