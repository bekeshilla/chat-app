const socket = io()

const $messageForm = document.querySelector('#formMsg')
const $messageFormInput = document.querySelector('#msg')
const $messageFormButton = document.querySelector('#msgSubmit')
const $locationButton = document.querySelector('#send-location')
const $messages = document.querySelector("#messages")


//templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationTemplate = document.querySelector('#location-template').innerHTML
const sideBarTemplate = document.querySelector('#sidebar-template').innerHTML

const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true })

const autoscroll = () => {
  // New message element
  const $newMessage = $messages.lastElementChild //
 // height of the new message
  const newMessagesStyles = getComputedStyle($newMessage)
  const newMessageMargin = parseInt(newMessagesStyles.marginBottom)
  const newMessageHeight = $newMessage.offsetHeight + newMessageMargin
  const visibleHeight = $messages.offsetHeight
  console.log(newMessageMargin)
  const containerHeight = $messages.scrollHeight
  const scrollOffSet = $messages.scrollTop + visibleHeight
  if (containerHeight - newMessageHeight <= containerHeight) {
        $messages.scrollTop = $messages.scrollHeight
  }
}
socket.on('locationMessage', (url) => {
    console.log(url)
    const html = Mustache.render(locationTemplate, {
        username: url.username,
        location: url.url,
        createdAt: moment(url.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

socket.on('message', (message) => {
    console.log(message)
    const html = Mustache.render(messageTemplate, {
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})
socket.on('roomData', ({room, users}) => {
    const html = Mustache.render(sideBarTemplate, {
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html
})
$messageForm.addEventListener('submit', (e) => {
    e.preventDefault();
    //disable
     $messageFormButton.setAttribute('disabled', 'disabled')
     
    const msg = e.target.elements.message.value

    socket.emit('sendMessage', msg, (error) => {
        //enable
        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value=''
        $messageFormInput.focus()
        if (error){
            return console.log(error)
        }
        console.log('Message delivered brothers')
    })
})
$locationButton.addEventListener('click', () => {
    
    if(!navigator.geolocation) {
        $locationButton.removeAttribute('disabled')
        return alert('Geolocation is not supported by browser bradar')
    }
    $locationButton.setAttribute('disabled', 'disabled')
    navigator.geolocation.getCurrentPosition((position) => {
        
        socket.emit('sendLocation', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        }, () => {
            $locationButton.removeAttribute('disabled')
            console.log("Location shared, SOLDIER")
        })
    })
})
socket.emit('join', { username, room }, (error) => {
    if (error){
        alert(error)
        location.href='/'
    }
})
