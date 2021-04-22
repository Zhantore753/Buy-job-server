const {Schema, model, ObjectId} = require('mongoose');

const User = new Schema({
    login: {type: String, required: true, unique: true},
    email: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    fullName: {type: String, default: ''},
    phone: {type: Number, default: ''},
    field: {type: String, enum: ['Технические', 'Естественные', 'Гуманитарные', 'Научные']},
    eduLevel: {type: String, enum: ['Общее', 'Среднее', 'Высшее']},
    avatar: {type: String, default: ''},
    workTime: {type: Date, default: Date.now()},
    balance: {type: Number,  default: 0},
    balanceHistory: [{type: ObjectId, ref: 'BalanceAction'}],
    rating: {type: Number, default: 0, max: 5},
    role: {type: String, enum: ['admin', 'moderator', 'freelancer', 'customer'], required: true},
    eduInstitution: {type: String, default:''},
    eduInstitutionEnd: {type: Number, default:''},
    eduFaculty: {type: String, default:''},
    eduSpecialty: {type: String, default:''},
    eduCourse: {type: String, default:''},
    eduStatus: {type: String, default:''},
    orders: [{type: ObjectId, ref: 'Order'}],
    tickets: [{type: ObjectId, ref: 'Ticket'}]
});

module.exports = model('User', User);