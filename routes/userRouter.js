const Router = require('express');
const router = new Router();
const authMiddleware = require('../middleware/authMiddleware');
const User = require("../models/User");

router.get('/user', authMiddleware, async (req, res) => {
    try{
        const {userId} = req.query;
        const user = await User.findOne({_id: userId});
        const customer = {
            fullName: user.fullName,
            avatar: user.avatar,
            email: user.email
        }
        console.log(customer)
        return res.json({customer, message: "Все прошло успешно"});
    }catch(e){
        console.log(e);
        return res.status(400).json({message: "Ошибка сервера"});
    }
})

module.exports = router;