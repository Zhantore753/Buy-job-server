const express =require('express');
const mongoose = require('mongoose');
const config = require('config');
const PORT = process.env.PORT || config.get('serverPort');

const app = express();

app.use(express.json());

const start = async () => {
    try{
        await mongoose.connect(config.get("dbUrl"), {
            useNewUrlParser:true,
            useUnifiedTopology:true
        });

        app.listen(PORT, () => {
            console.log(`Сервер запущен на порту ${PORT}`);
        });
    }catch(e){
        console.log(e);
    }
}

start();