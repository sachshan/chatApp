import express from "express";
import path from 'path';
import { fileURLToPath } from 'url';
import http from 'http';
import { Server } from "socket.io";
import generateMessage from './utils/message.js'
import locationMessage from './utils/locationMessage.js';
import {addUser, removeUser, getUser, getUsersInRoom} from './utils/users.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

const server = http.createServer(app);


const io = new Server(server);

const port = process.env.PORT || 3000;
const publicDirPath = path.join(__dirname, '../public');

app.use(express.static(publicDirPath));

let count = 0;

// server(emit) -> client(recieve) - ack -> server
// client(emit) -> server(recieve) - ack -> client

io.on('connection', (socket)=>{
    console.log('New Web Socket Connection');

    

    socket.on('join', ({username, room}, callback)=>{
        
        const {error, user} = addUser({id: socket.id, username, room });

        if(error)
        {
            callback(error);
        }
        
        socket.join(user.room);

        socket.emit('sMessage', generateMessage("Welcome mr client"));
        socket.broadcast.to(user.room).emit('sMessage', generateMessage(`${user.username} has joined`));

        callback();

    });

    socket.on('newMessage', (message, callback)=>{
        io.to(getUser(socket.id).room).emit('sMessage',generateMessage(getUser(socket.id).username, message));
        callback("Delivered!");
    })

    socket.on('clientPosition', (position, callback)=>{
        io.to(getUser(socket.id).room).emit('sLocation', locationMessage(getUser(socket.id).username, "http://google.com/maps?q="+position.latitude+ ","+position.longitude ));
        callback('Location Shared!');
    });

    socket.on('disconnect', ()=>{
        const user = removeUser(socket.id);

        if(user)
        {
            io.to(user.room).emit('sMessage', `${user.username} has left`);
        }
        
    })
})


server.listen(port, ()=>{
    console.log("Server is up on port "+port);
});