const socket = io ()

 const roomsTemplate = document.querySelector('#rooms-template').innerHTML

 socket.on('availableRooms', (rooms) => {
    const html = Mustache.render(roomsTemplate,
        rooms
    )
    document.querySelector('#rooms').insertAdjacentHTML('afterbegin', html)
})
