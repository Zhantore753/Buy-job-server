const Router = require("express");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Uuid = require('uuid');
const router = new Router();
const authMiddleware = require('../middleware/authMiddleware');

router.post('/avatar', authMiddleware, async (req, res) =>{
    try {
        const file = req.files.file;
        const user = await User.findById(req.user.id);
        const avatarName = Uuid.v4() + ".jpg";
        console.log(req.filePath);
        file.mv(req.filePath + "/" + avatarName);
        user.avatar = avatarName;
        await user.save();
        return res.json({message: "Аватарка успешно изменена"});
    } catch (e) {
        console.log(e);
        return res.status(400).json({message: 'Ошибка при изменении автарки'});
    }
});

router.post('/email', authMiddleware, async (req, res) =>{
    try {
        let candidate = await User.findOne({email});
        if(candidate){
            return res.status(400).json({message: `Пользователь с почтой ${email} уже зарегистрирован`})
        }
        const user = await User.findById(req.user.id);
        user.email = req.body.email;
        await user.save();
        return res.json({message: "Email успешно изменен"});
    } catch (e) {
        console.log(e);
        return res.status(400).json({message: 'Ошибка при изменении email'});
    }
});

router.post('/fullname', authMiddleware, async (req, res) =>{
    try {
        const user = await User.findById(req.user.id);
        user.fullname = req.body.fullname;
        await user.save();
        return res.json({message: "Имя было изменено"});
    } catch (e) {
        console.log(e);
        return res.status(400).json({message: 'Ошибка при изменении имени'});
    }
});

router.post('/edu', authMiddleware, async (req, res) =>{
    try {
        const {eduInstitution, eduFaculty, eduSpecialty, eduCourse, eduStatus} = req.body;
        const user = await User.findById(req.user.id);
        eduInstitution && (user.eduInstitution = eduInstitution);
        eduFaculty && (user.eduFaculty = eduFaculty);
        eduSpecialty && (user.eduSpecialty = eduSpecialty);
        eduCourse && (user.eduCourse = eduCourse);
        eduStatus && (user.eduStatus = eduStatus);
        await user.save();
        return res.json({message: "Информация была изменена"});
    } catch (e) {
        console.log(e);
        return res.status(400).json({message: 'Ошибка при изменении'});
    }
});

router.post('/password', authMiddleware, async (req, res) =>{
    try {
        const {newPassword, password} = req.body;
        const user = await User.findById(req.user.id);
        console.log(newPassword, password);

        const isPassValid = bcrypt.compareSync(password, user.password);
        if(!isPassValid){
            return res.status(400).json({message: "Неверный пароль"});
        }
        
        const hashPassword = await bcrypt.hash(newPassword, 8);

        user.password = hashPassword;

        await user.save();
        return res.json({message: "Пароль был изменен"});
    } catch (e) {
        console.log(e);
        return res.status(400).json({message: 'Ошибка при измении пароля'});
    }
});

module.exports = router;