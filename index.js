const express =require('express');
const mongoose = require('mongoose');
const config = require('config');
const fileUpload = require('express-fileupload');
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
const File = require('./models/File');
const Order = require('./models/Order');
const User = require('./models/User');

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

const messagesFilesPath = path.resolve(__dirname, 'files');
const socketIdtoUserId = [];

io.on('connection', socket => {
    let uploader = new siofu();
    uploader.listen(socket);
    uploader.dir = messagesFilesPath;
    uploader.maxFileSize = 2000000;

    uploader.on("saved", async function(event){
        if(event.file.success){
            const path = event.file.pathName.split('/');
            const name = path.pop();
            const message = new Message({
                user: socketIdtoUserId[socket.id][0],
                time: Date.now(),
                fileName: name,
                filePath: path.join("\\"),
            })
            const file = new File({
                name: name,
                path: path.join("\\"),
                size: event.file.bytesLoaded,
                user: socketIdtoUserId[socket.id][0],
                message: message._id
            });
            message.file = file._id;

            const respond = await Respond.findOne({_id: socketIdtoUserId[socket.id][1]});
            respond.messages.push(message);
            file.save();
            message.save();
            respond.save();

            socket.emit('FILE_UPLOAD_SUCCESS', {message: 'Файл был успешно загружен'});
            socket.broadcast.to(socketIdtoUserId[socket.id][1]).emit('NEW_FILE_MESSAGE', {message, file});
            socket.emit('NEW_FILE_MESSAGE', {message, file});
        }else{
            socket.emit('FILE_UPLOAD_ERROR', 'Произошла не предвиденная ошибка');
        }
    });
    uploader.on('error', () => {
        console.log('file upload error');
        socket.emit('FILE_UPLOAD_ERROR', 'Файлы должны быть меньше 2Мб');
    });
    socket.on('ROOM:JOIN', ({roomId, userId}) => {
        socket.join(roomId);
        socketIdtoUserId[socket.id] = [userId, roomId];
        console.log(socket.rooms)
    });
    socket.on('ROOM:LEAVE', (roomId) => {
        socket.leave(roomId);
        delete socketIdtoUserId[socket.id]
        console.log(socket.rooms)
    });
    socket.on('ACCEPT_RESPOND', async () => {
        const respond = await Respond.findOne({_id: socketIdtoUserId[socket.id][1]});
        const order = await Order.findOne({_id: respond.order});
        const executor = await User.findOne({_id: respond.executor});
        respond.status = 'Выполняется';
        order.executorRespond = respond._id;
        order.executor = executor._id;
        order.status = 'Выполняется';
        order.price = respond.offer;
        executor.orders.push(order);
        await respond.save();
        await order.save();
        await executor.save();

        socket.broadcast.to(socketIdtoUserId[socket.id][1]).emit('ACCEPT_RESPOND', {order, message: 'Ваше предложение было принято'});
    });

    socket.on('ACCEPT_WORK', async () => {
        const respond = await Respond.findOne({_id: socketIdtoUserId[socket.id][1]});
        const order = await Order.findOne({_id: respond.order});
        const user = await User.findOne({_id: order.user});
        const executor = await User.findOne({_id: respond.executor});

        user.balance = user.balance - respond.offer;
        executor.balance = executor.balance + respond.offer;

        respond.status = 'Исполнено';
        order.status = 'Исполнено';
        await respond.save();
        await order.save();
        await user.save();
        await executor.save();
        socket.broadcast.to(socketIdtoUserId[socket.id][1]).emit('ACCEPT_WORK', {order, balance: executor.balance, message: 'Работа была принята'});
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
        delete socketIdtoUserId[socket.id]
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