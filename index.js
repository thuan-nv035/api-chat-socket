const express = require('express')
const app = express()
const port = 3000
const dotenv = require('dotenv');
const mongoose = require('mongoose');

app.use(require("cors")());

dotenv.config()

mongoose.connect(process.env.DATABASE).then(() => console.log('Connected to database')).catch((e) => console.log('connection error'));

app.use(express.json())
app.use(express.urlencoded({ extended: true}))

//Bring in the routes
app.use("/user", require("./routers/user"));
app.use("/chatroom", require("./routers/chatroom"));

// setup error handlers
const errorHandlers = require('./handlers/errorHandlers')
app.use(errorHandlers.notFound)
app.use(errorHandlers.mongoseErrors)
if(process.env.ENV === 'DEVELOPMENT') {
    app.use(errorHandlers.developmentErrors)
}else {
    app.use(errorHandlers.productionErrors)
}

//Bring in the models
require("./models/User");
require("./models/Chatroom");
require("./models/Message");


const server = app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})

const io = require("socket.io")(server, {
    allowEIO3: true,
    cors: {
        origin: true,
        methods: ['GET', 'POST'],
        credentials: true
    }
});
const jwt = require("jwt-then");

io.use(async (socket, next) => {
    try {
        const token = socket.handshake.query.token;
        const payload = await jwt.verify(token, process.env.SECRET);
        socket.userId = payload.id;
        next();
    } catch (err) {}
});

const User = require("./models/User")
const Message = require("./models/Message")

io.on("connection", (socket) => {
    console.log("Connected: " + socket.userId);

    socket.on("disconnect", () => {
        console.log("Disconnected: " + socket.userId);
    });

    socket.on("joinRoom", ({ chatroomId }) => {
        socket.join(chatroomId);
        console.log("A user joined chatroom: " + chatroomId);
    });

    socket.on("leaveRoom", ({ chatroomId }) => {
        socket.leave(chatroomId);
        console.log("A user left chatroom: " + chatroomId);
    });

    socket.on("chatroomMessage", async ({ chatroomId, message }) => {
        if (message.trim().length > 0) {
            const user = await User.findOne({ _id: socket.userId });
            const newMessage = new Message({
                chatroom: chatroomId,
                user: socket.userId,
                message,
            });
            io.to(chatroomId).emit("newMessage", {
                message,
                name: user.name,
                userId: socket.userId,
            });
            await newMessage.save();
        }
    });
});
