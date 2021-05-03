const Router = require("express");
const User = require("../models/User");
const File = require('../models/File');
const Order = require("../models/Order");
const Uuid = require('uuid');
const router = new Router();
const authMiddleware = require('../middleware/authMiddleware');
const fs = require('fs');
const Respond = require("../models/Respond");
const Message = require("../models/Message");
const Feedback = require("../models/Feedback");

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
                req.files.files[i].mv(req.filePath + "\\" + fileName);
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
                req.files.files.mv(req.filePath + "\\" + fileName);
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
        let response = await Order.find({user: req.user.id}).skip(+startfrom).limit(10).sort({'date': -1});
        if(response.length < 1){
            response = await Order.find({executor: req.user.id}).skip(+startfrom).limit(10).sort({'date': -1});
        }
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
        if (fs.existsSync(path)) {
            console.log(path, name)
            const fullpath = path + "\\" + name;
            return res.download(path, name);
        }
        return res.status(400).json({message: "Ошибка при скачивании"});
    } catch (e) {
        console.log(e);
        res.status(500).json({message: "Ошибка при скачивании"});
    }
});

router.post('/create-respond', authMiddleware, async (req, res) => {
    try{
        const {offer, order, respondId} = req.body;

        let respond;
        if(respondId){
            respond = await Respond.findOne({_id: respondId});
            respond.offer = offer;
        }else{
            respond = new Respond({
                executor: req.user.id,
                offer: offer,
                order: order
            });
        }

        const findOrder = await Order.findOne({_id: order});

        if(findOrder.responds.includes(respond._id)){
            console.log(findOrder.responds);
        }else{
            findOrder.responds.push(respond._id);
        }

        const user = await User.findOne({_id: req.user.id});

        user.orders.push(respond._id);

        await respond.save();
        await findOrder.save();
        await user.save();
        res.json({respond, message: "Предложение было отправлено"});
    }catch(e){
        console.log(e);
        res.status(400).json({message: "Ошибка сервера"});
    }
});

router.get('/find-respond', authMiddleware, async (req, res) => {
    try{
        const {orderId} = req.query;

        const respond = await Respond.findOne({executor: req.user.id, order: orderId});
        if(respond){
            res.json({respond, message: "Получено"});
        }else{
            res.json({message: "Предложения еще не было"});
        }
    }catch(e){
        console.log(e);
        res.status(400).json({message: "Ошибка сервера"});
    }
});

router.post('/update-order', authMiddleware, async (req, res) => {
    try{
        const {orderId, price, status} = req.body;
        const order = await Order.findOne({_id: orderId});
        order.price = price;
        order.status = status;
        await order.save();
        res.json({order, message: "Изменения были сохранены"});
    }catch(e){
        console.log(e);
        res.status(400).json({message: "Ошибка при обновлении заказа"});
    }
});

router.get('/get-responds', authMiddleware, async (req, res) => {
    try{
        const {orderId} = req.query;
        const order = await Order.findOne({_id: orderId});
        let responds = [];
        for(let i = 0; i < order.responds.length; i++){
            const respond = await Respond.findOne({_id: order.responds[i]});
            const user = await User.findOne({_id: respond.executor});
            const newRespond = {
                _id: respond._id,
                offer: respond.offer,
                executor: respond.executor,
                userAvatar: user.avatar,
                userFullName: user.fullName,
                userEmail: user.email
            }
            responds.push(newRespond);
        }
        res.json({responds, message: "Отклики получены"});
    }catch(e){
        console.log(e);
        res.status(400).json({message: "Ошибка при получении откликов"});
    }
});

router.get('/get-messages', authMiddleware, async(req, res) => {
    try{
        const {respondId, skip} = req.query;
        const respond = await Respond.findOne({_id: respondId});
        let messages = [];
        let start = respond.messages.length - skip - 1;
        let end = respond.messages.length - (15 + +skip) - 1;
        let hasMore = true
        if(end < -1){
            end = -1;
            hasMore = false;
        }
        for(let i = start; i > end; i--){
            const message = await Message.findOne({_id: respond.messages[i]});
            messages.push(message);
        }
        res.json({messages, hasMore, message: "Сообщения получены"});
    }catch(e){
        console.log(e);
        res.status(400).json({message: "Ошибка при получении сообщений"});
    }
});

router.get('/get-respond', authMiddleware, async(req, res) => {
    try{
        const {respondId} = req.query;
        const resRespond = await Respond.findOne({_id: respondId});
        const user = await User.findOne({_id: resRespond.executor});

        const respond = {
            _id: resRespond._id,
            offer: resRespond.offer,
            executor: resRespond.executor,
            userAvatar: user.avatar,
            userFullName: user.fullName,
            userEmail: user.email
        }

        res.json({respond});
    }catch(e){
        console.log(e);
        res.status(400).json({message: "Ошибка сервера, попробуйте еще раз"});
    }
});

router.post('/feedback', authMiddleware, async(req, res) => {
    try{
        const {orderId, toUser, fromUser, rating} = req.body;

        const order = await Order.findOne({_id: orderId});
        const user = await User.findOne({_id: toUser});

        let feedback;

        if(user.role === 'customer'){
            if(order.execFeedback){
                feedback = await Feedback.findOne({_id: order.execFeedback});
                feedback.rating = rating;
                Feedback.date = Date.now();
            }else{
                feedback = new Feedback({
                    orderId,
                    toUser,
                    fromUser,
                    rating,
                    date: Date.now()
                });

                user.ratings.push(feedback);
                order.execFeedback = feedback;
            }
        }
        if(user.role === 'freelancer'){
            if(order.userFeedback){
                feedback = await Feedback.findOne({_id: order.userFeedback});
                feedback.rating = rating;
                Feedback.date = Date.now();
            }else{
                feedback = new Feedback({
                    orderId,
                    toUser,
                    fromUser,
                    rating,
                    date: Date.now()
                });

                user.ratings.push(feedback);
                order.userFeedback = feedback;
            }
        }

        if(feedback){
            await feedback.save();
            await order.save();
        }

        await Feedback.aggregate(
            [
                {'$group':{
                    '_id': '$toUser',
                    'avgRating': {'$avg': '$rating'}
                }}
            ],
            async function(err, users){
                users.map(async function(result){
                    if(JSON.stringify(result._id, undefined, 2) === JSON.stringify(user._id, undefined, 2)){
                        user.rating = result.avgRating;
                        await user.save();
                    }
                });
            }
        );

        res.json({feedback, message: 'Оценка успешно поставлена'});
    }catch(e){
        console.log(e);
        res.json({status: 500, message: 'Ошибка сервера'});
    }
});

router.get('/get-feedback', authMiddleware, async(req, res) => {
    try{
        const {feedbackId} = req.query;
        const feedback = await Feedback.findOne({_id: feedbackId})
        res.json({feedback, message: 'Оценка получена'});
    }catch(e){
        console.log(e);
        res.json({status: 500, message: 'Ошибка сервера'});
    }
});

module.exports = router;