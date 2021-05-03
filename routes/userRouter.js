const Router = require('express');
const router = new Router();
const authMiddleware = require('../middleware/authMiddleware');
const Feedback = require('../models/Feedback');
const User = require("../models/User");
const Order = require("../models/Order");

router.get('/user', authMiddleware, async (req, res) => {
    try{
        const {userId} = req.query;
        const user = await User.findOne({_id: userId});
        const customer = {
            fullName: user.fullName,
            avatar: user.avatar,
            email: user.email
        }
        return res.json({customer, message: "Все прошло успешно"});
    }catch(e){
        console.log(e);
        return res.status(400).json({message: "Ошибка сервера"});
    }
});

router.get('/get-user', authMiddleware, async (req, res) => {
    try{
        const {userId} = req.query;
        const user = await User.findOne({_id: userId});
        const resUser = {
            id: user.id,
            email: user.email,
            role: user.role,
            avatar: user.avatar,
            fullName: user.fullName,
            rating: user.rating,
            ratingCount: user.ratings.length,
            orders: user.orders
        }

        return res.json({resUser, message: "Пользователь найден"});
    }catch(e){
        console.log(e);
        return res.status(400).json({message: "Ошибка сервера"});
    }
});

router.get('/feedbacks', authMiddleware, async (req, res) => {
    try{
        const {userId, startfrom} = req.query;
        let response = await Feedback.find({toUser: userId}).skip(+startfrom).limit(5).sort({'date': -1});
        return res.json(response);
    }catch(e){
        console.log(e);
        return res.status(500).json({message: "Не удалось получить отзывы"});
    }
});

router.get('/orders', authMiddleware, async (req, res) => {
    try{
        const {userId, startfrom} = req.query;
        const user = await User.findOne({_id: userId});
        let response;
        if(user.role === 'freelancer'){
            response = await Order.find({executor: userId}).skip(+startfrom).limit(5).sort({'date': -1});
        }else{
            response = await Order.find({user: userId}).skip(+startfrom).limit(5).sort({'date': -1});
        }
        return res.json(response);
    }catch(e){
        console.log(e);
        return res.status(500).json({message: "Не удалось получить отзывы"});
    }
});

module.exports = router;