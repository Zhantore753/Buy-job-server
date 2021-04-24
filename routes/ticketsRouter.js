const Router = require('express');
const router = new Router();
const Uuid = require('uuid');
const authMiddleware = require('../middleware/authMiddleware');
const Ticket = require('../models/Ticket');
const User = require("../models/User");
const File = require('../models/File');

router.post('', authMiddleware, async (req, res) => {
    try{
        const {title, description, date} = req.body;
        let body;
        if(date){
            body = {user: req.user.id, title, description, date, files: []};
        }else{
            body = {user: req.user.id, title, description, files: []}
        }
        const ticket = new Ticket(body);
        const user = await User.findById(req.user.id);

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
                    ticket: ticket._id,
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
                    ticket: ticket._id,
                    user: req.user.id
                });
                filesId.push(file._id);
                await file.save();
            }
        }
        
        ticket.files = filesId;
        user.tickets.push(ticket._id);
        await ticket.save();
        await user.save();
        return res.json({ticket, message: 'Тикет был создан'});
    }catch(e){
        console.log(e);
        return res.status(400).json({message: "Ошибка сервера"})
    }
});

router.get('', authMiddleware, async (req, res) => {
    try{
        const {startfrom} = req.query;
        const response = await Ticket.find({user: req.user.id}).skip(+startfrom).limit(10).sort({'date': -1});
        return res.json(response);
    }catch(e){
        console.log(e);
        return res.status(500).json({message: "Не удалось получить тикеты"});
    }
});

module.exports = router;