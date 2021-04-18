const {Schema, model, ObjectId} = require('mongoose');

const User = new Schema({
    login: {type: String, required: true, unique: true},
    email: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    fullName: {type: String},
    phone: {type: Number},
    field: {type: String, enum: ['Технические', 'Естественные', 'Гуманитарные', 'Научные']},
    eduLevel: {type: String, enum: ['Общее', 'Среднее', 'Высшее']},
    avatar: {type: String},
    workTime: {type: Date, default: Date.now()},
    balance: {type: Number,  default: 0},
    balanceHistory: [{type: ObjectId, ref: 'BalanceAction'}],
    rating: {type: Number, default: 0, max: 5},
    role: {type: String, enum: ['admin', 'freelancer', 'customer'], required: true},
    eduInstitution: {type: String},
    eduInstitutionEnd: {type: Number},
    eduFaculty: {type: String},
    eduSpecialty: {type: String},
    eduCourse: {type: String},
    eduStatus: {stype: String},
    orders: [{type: ObjectId, ref: 'Order'}],
    tickets: [{type: ObjectId, red: 'Ticket'}]
});

module.exports = model('User', User);