const Router = require('express');
const router = new Router();
const authMiddleware = require('../middleware/authMiddleware');
const Ticket = require('../models/Ticket');

router.post('', authMiddleware, async (req, res) => {
    try{
        const {title, description, date} = req.body;
        let body;
        if(date){
            body = {user: req.user.id, title, description, date};
        }else{
            body = {user: req.user.id, title, description}
        }
        const ticket = new Ticket(body);
        await ticket.save();
        return res.json(ticket);
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