const users = []

const addUser = ({ id, username, room }) => {
    username = username.trim().toLowerCase()
    // room = room.trim().toLowerCase()

    if(!username || !room){
        return {
            error: 'Username and room are required'
        }
    }

    const existingUser = users.find((user)=>{
        return user.room === room && user.username === username
    })
    if(existingUser){
        return {
            error: 'There is already an username with this name in the room'
        }
    }
    const user = {id, username, room}
    users.push(user)
    return  {user} 
}
const removeUser = (id) => {
    const index = users.findIndex((user) => user.id === id)
    if (index!==-1){
        return users.splice(index, 1)[0]
    }
}
const getUser = (id) => {
    const user = users.find((user) => {
        return user.id === id;
    })
    if (!user) {
       return  { error: 'There is not user with this id' }
    }
    return {user}
}
const getUsersInRoom = (room) => {
    const usersMatch = users.filter((user) => {
    return room.trim().toLowerCase() === user.room
    })
    return usersMatch
}
const getRooms = () => {
   let rooms = []
    users.forEach((user)=>{
        rooms.push(user.room)
    })
    rooms = rooms.filter((room, index) => {
        return rooms.indexOf(room) === index
    })
    return rooms
}

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom,
    getRooms
}