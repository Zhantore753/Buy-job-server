const Router = require("express");
const User = require("../models/User");
const File = require('../models/File');
const Order = require("../models/Order");
const Uuid = require('uuid');
const router = new Router();
const authMiddleware = require('../middleware/authMiddleware');
const fs = require('fs');
const Respond = require("../models/Respond");

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
            if(filesId.length < 1){
                const nameSplitted = req.files.files.name.split('.');
                const fileName = Uuid.v4() + '.' + nameSplitted[nameSplitted.length - 1];
                req.files.files.mv(req.filePath + "/" + fileName);
                const file = new File({
                    name: fileName,
                    type: req.files.files.mimetype,
                    size: req.files.files.size,
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
        return res.status(500).json({message: "Не удалось получить заказы"});
    }
});

router.get('/find-orders', authMiddleware, async (req, res) => {
    try{
        const {startfrom, category, search} = req.query;
        let response;
        if(category){
            response = await Order.find({status: 'Участвует в конкурсе', category}).skip(+startfrom).limit(10).sort({'date': -1});
        }else{
            response = await Order.find({status: 'Участвует в конкурсе'}).skip(+startfrom).limit(10).sort({'date': -1});
        }

        if(search){
            response = response.filter(order => {
                let check = order.title.includes(search) || order.subject.includes(search)
                let keyCheck = false;
                for(let i = 0; i < order.keyWords.length; i++){
                    if(order.keyWords.includes(search)){
                        keyCheck = true;
                        break;
                    }
                }
                return check || keyCheck
            });
        }
        return res.json(response);
    }catch(e){
        console.log(e);
        return res.status(500).json({message: "Не удалось получить заказы"});
    }
});

router.get('/files', authMiddleware, async (req, res) => {
    try{
        let {files} = req.query;
        files = files.split(',');

        let fullFiles = [];
        for(let i = 0; i < files.length; i++){
            const file = await File.findOne({_id: files[i]});
            fullFiles.push(file);
        }
        return res.json({fullFiles, message: "Файлы получены"});
    }catch(e){
        console.log(e);
        return res.status(500).json({message: "Не удалось получить файлы"});
    }
});

router.get('/download', authMiddleware, async (req, res) => {
    try {
        const {path, name} = req.query;
        console.log(path, name);
        if (fs.existsSync(path)) {
            const fullpath = path + "\\" + name;
            return res.download(fullpath);
        }
        return res.status(400).json({message: "Ошибка при скачивании"});
    } catch (e) {
        console.log(e);
        res.status(500).json({message: "Ошибка при скачивании"});
    }
});

router.post('/create-respond', authMiddleware, async (req, res) => {
    try{
        const {offer, order} = req.body;

        const respond = new Respond({
            executor: req.user.id,
            offer: offer,
            order: order
        });

        await respond.save();
        res.json({offer, message: "Предложение было отправлено"});
    }catch(e){
        console.log(e);
        res.status(400).json({message: "Ошибка сервера"});
    }
});

router.get('/find-respond', authMiddleware, async (req, res) => {
    try{
        const {orderId} = req.query;

        const response = await Respond.findOne({executor: req.user.id, order: orderId})
        if(response){
            res.json({offer: response.offer, message: "Получено"});
        }else{
            res.json({offer: 0, message: "Получено"});
        }
    }catch(e){
        console.log(e);
        res.status(400).json({message: "Ошибка сервера"});
    }
});

module.exports = router;