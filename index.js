const express =require('express');
const mongoose = require('mongoose');
const config = require('config');
const fileUpload = require('express-fileupload');
const authRouter = require('./routes/authRouter');
const ticketsRouter = require('./routes/ticketsRouter');
const updateRouter = require('./routes/updateRouter');
const PORT = process.env.PORT || config.get('serverPort');
const app = express();
const corsMiddleware = require('./middleware/corsMiddleware');
const staticPathMiddleware = require('./middleware/staticMiddleware');
const path = require('path');

app.use(fileUpload({}));
app.use(corsMiddleware);
app.use(staticPathMiddleware(path.resolve(__dirname, 'static')));
app.use(express.json());
app.use(express.static('static'));
app.use("/api/auth", authRouter);
app.use("/api/tickets", ticketsRouter);
app.use("/api/update", updateRouter);

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