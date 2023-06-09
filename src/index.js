const http = require('http')
const path = require('path')
const express = require('express')
const socketio = require('socket.io')
const Filter = require ('bad-words')

const {generateMessage, generateLocationMessage} = require('./utils/messages')
const {  addUser, removeUser, getUser, getUsersInRoom, getRooms } = require ('./utils/users')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT || 3000
const publicDirectoryPath = path.join(__dirname, '../public')
app.use(express.static(publicDirectoryPath))


io.on('connection', (socket) => {

    console.log('New WebSocket connection')
    socket.emit('availableRooms', (getRooms()))
    socket.on('join', ({username, room}, callback) => {
        
        const   { error ,user }  = addUser({id: socket.id, username, room})

         if(error){
             return callback(error)
         }

        socket.join(user.room)
        socket.emit('message', generateMessage('Admin', 'Welcome'))
        socket.broadcast.to(user.room).emit('message', generateMessage('Admin', `${user.username} has joined!`))
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        })
        callback()
    })
    socket.on('sendMessage', (msg, callback) => {
    
        const {error, user} = getUser(socket.id)
        if (error){
            return callback(error)
        }
        const filter = new Filter()
        if (filter.isProfane(msg)){
            return callback("Profanity is not allowed!")
        }


         io.to(user.room).emit('message' ,generateMessage(user.username, msg))
        callback('Delivered!')
    
    })
    socket.on('disconnect', () => {
        const user = removeUser(socket.id)
        if (user) {
            io.to(user.room).emit('message',  generateMessage('Admin', `${user.username} left`))
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }
        
    })
    socket.on('sendLocation', (coordonates, callback) => {
        const {error, user} = getUser(socket.id)
        if (error){
            return callback(error)
        }
        io.to(user.room).emit('locationMessage', generateLocationMessage(user.username,`https://google.com/maps?q=${coordonates.latitude},${coordonates.longitude}`))
        callback()
    })
    
    
})
server.listen(port, () => {
    console.log('Server is up on port 3000')
})