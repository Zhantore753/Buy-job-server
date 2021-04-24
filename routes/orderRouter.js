const Router = require("express");
const User = require("../models/User");
const File = require('../models/File');
const Order = require("../models/Order");
const fs = require('fs');
const Uuid = require('uuid');
const router = new Router();
const authMiddleware = require('../middleware/authMiddleware');

router.post('/create', authMiddleware, async (req, res) =>{
    try {
        const {category, subject, title, selectedDate, price, keyWords, description} = req.body;
        keyWordsArr = keyWords.split(',');
        const order = new Order({
            user: req.user.id,
            category,
            subject, 
            title, 
            deadline: selectedDate, 
            date: new Date(),
            price, 
            keyWords: keyWordsArr, 
            description, 
            files: []
        });

        let filesId = [];
        if(req.files){
            for(let i = 0; i < req.files.files.length; i++){
                const nameSplitted = req.files.files[i].name.split('.');
                const fileName = Uuid.v4() + '.' + nameSplitted[nameSplitted.length - 1];
                req.files.files[i].mv(req.filePath + "/" + fileName);
                const file = new File({
                    name: fileName,
                    type: req.files.files[i].mimetype,
                    size: req.files.files[i].size,
                    path: req.filePath,
                    order: order._id,
                    user: req.user.id
                });
                filesId.push(file._id);
                await file.save();
            }
        }
        order.files = filesId;
        const user = await User.findById(req.user.id);
        user.orders.push(order._id);
        await order.save();
        await user.save();
        return res.json({order, message: "Заказ был создан"});
    } catch (e) {
        console.log(e);
        return res.status(400).json({message: 'Ошибка при создании заказа'});
    }
});

router.get('/orders', authMiddleware, async (req, res) => {
    try{
        const {startfrom} = req.query;
        const response = await Order.find({user: req.user.id}).skip(+startfrom).limit(10).sort({'date': -1});
        return res.json(response);
    }catch(e){
        console.log(e);
        return res.status(500).json({message: "Не удалось получить тикеты"});
    }
});

module.exports = router;