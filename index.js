const express =require('express');
const mongoose = require('mongoose');
const config = require('config');
const fileUpload = require('express-fileupload');
const Uuid = require('uuid');
const authRouter = require('./routes/authRouter');
const ticketsRouter = require('./routes/ticketsRouter');
const updateRouter = require('./routes/updateRouter');
const orderRouter = require('./routes/orderRouter');
const userRouter = require('./routes/userRouter');
const PORT = process.env.PORT || config.get('serverPort');
const app = express();
const server = require('http').Server(app);
const siofu = require("socketio-file-upload");
const io = require('socket.io')(server, {
    cors: {
        origin: '*',
        methods: ["GET", "POST"],
        credentials: true,
        transports: ['websocket']
    }
});
const corsMiddleware = require('./middleware/corsMiddleware');
const staticPathMiddleware = require('./middleware/staticMiddleware');
const path = require('path');
const Message = require('./models/Message');
const Respond = require('./models/Respond');

app.use(siofu.router);
app.use(fileUpload({}));
app.use(corsMiddleware);
app.use(staticPathMiddleware(path.resolve(__dirname, 'files')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }))
app.use(express.static('files'));
app.use("/api/auth", authRouter);
app.use("/api/tickets", ticketsRouter);
app.use("/api/update", updateRouter);
app.use("/api/order", orderRouter);
app.use("/api/user", userRouter);

const messagesFilesPath = path.resolve(__dirname, 'static');

io.on('connection', socket => {
    let uploader = new siofu();
    uploader.listen(socket);
    uploader.dir = messagesFilesPath;
    uploader.maxFileSize = 2000000;

    uploader.on("saved", function(event, params){
        console.log(event, params);
    });
    uploader.on('error', () => {
        console.log('file upload error');
        socket.emit('FILE_UPLOAD_ERROR', 'Файлы должны быть меньше 2Мб');
    });
    socket.on('ROOM:JOIN', (roomId) => {
        socket.join(roomId);
        console.log(socket.rooms);
    });
    socket.on('ROOM:LEAVE', (roomId) => {
        socket.leave(roomId);
        console.log(socket.rooms);
    });
    socket.on('NEW_MESSAGE', async ({room, text, user, time, files}) => {
        const message = new Message({
            room,
            text,
            user,
            time,
            files: []
        });
        const respond = await Respond.findOne({_id: room});
        respond.messages.push(message);

        await message.save();
        await respond.save();
        
        socket.broadcast.to(room).emit('NEW_MESSAGE', {room, text, user, time, files});
    });

    socket.on('disconnecting', () => {
        // console.log(socket.rooms); // the Set contains at least the socket ID
    });

    socket.on('disconnect', () => {
        console.log('user disconnected', socket.id);
    });

    console.log('user connected', socket.id);
});

const start = async () => {
    try{
        await mongoose.connect(config.get("dbUrl"), {
            useNewUrlParser:true,
            useUnifiedTopology:true
        });

        server.listen(PORT, () => {
            console.log(`Сервер запущен на порту ${PORT}`);
        });
    }catch(e){
        console.log(e);
    }
}

start();