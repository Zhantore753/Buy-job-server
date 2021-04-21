const Router = require("express");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("config");
const {check, validationResult} = require("express-validator");
const router = new Router();
const authMiddleware = require('../middleware/authMiddleware');

router.post('/registration',
    [
        check('login', 'Логин должен быть длиннее 4 и короче 14 символов').isLength({min: 4, max: 14}),
        check('email', 'Неправильная почта').isEmail(),
        check('password', 'Password must be longer than 4 and shorter than 20').isLength({min: 4, max: 20})
    ],
    async (req, res) => {
    try{
        const errors = validationResult(req);
        if(!errors.isEmpty()){
            return res.status(400).json({message: "Неверный запрос", errors});
        }

        const {login, email, password} = req.body;

        let candidate = await User.findOne({email});
        if(candidate){
            return res.status(400).json({message: `Пользователь с почтой ${email} уже зарегистрирован`})
        }

        candidate = await User.findOne({login});
        if(candidate){
            return res.status(400).json({message: `Введенный вами логин ${login} занят`})
        }

        const hashPassword = await bcrypt.hash(password, 8);
        const user = new User({login, email, password: hashPassword, role: 'customer'});
        await user.save();
        return res.json({message: "Пользователь успешно создан"});
    }catch(e){
        console.log(e);
        res.send({message: "Ошибка сервера"});
    }
});

router.post('/login', async (req, res) => {
    try{
        const {login, password} = req.body;
        const user = await User.findOne({login});
        if(!user){
            return res.status(404).json({message: "Пользователь с таким логином не найден"});
        }

        const isPassValid = bcrypt.compareSync(password, user.password);
        if(!isPassValid){
            return res.status(400).json({message: "Неверный пароль"});
        }

        const token = jwt.sign({id: user.id}, config.get("secretKey"), {expiresIn: "1h"})
        return res.json({
            token,
            user: {
                id: user.id,
                login: user.login,
                email: user.email,
                balance: user.balance,
                role: user.role,
                avatar: user.avatar,
                fullName: user.fullName,
                rating: user.rating,
                eduInstitution: user.eduInstitution,
                eduFaculty: user.eduFaculty,
                eduSpecialty: user.eduSpecialty,
                eduCourse: user.eduCourse,
                eduStatus: user.eduStatus
            },
            message: "Вы вошли"
        });
    }catch(e){
        console.log(e);
        res.send({message: "Ошибка сервера"});
    }
});

router.get('/auth',
    authMiddleware,
    async (req, res) => {
        try{
            const user = await User.findOne({_id: req.user.id});
            const token = jwt.sign({id: user.id}, config.get("secretKey"), {expiresIn: "1h"})
            return res.json({
                token,
                user: {
                    id: user.id,
                    login: user.login,
                    email: user.email,
                    balance: user.balance,
                    role: user.role,
                    avatar: user.avatar,
                    fullName: user.fullName,
                    rating: user.rating,
                    eduInstitution: user.eduInstitution,
                    eduFaculty: user.eduFaculty,
                    eduSpecialty: user.eduSpecialty,
                    eduCourse: user.eduCourse,
                    eduStatus: user.eduStatus
                }
            });
        }catch(e){
            console.log(e);
            res.send({message: "Ошибка сервера"});
        }
    }
);

module.exports = router;