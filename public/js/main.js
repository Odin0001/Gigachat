const chatForm = document.getElementById('chat-form')
const chatMessages = document.querySelector('.chat-messages')
const roomName = document.getElementById('room-name')
const usersList = document.getElementById('users')

//get username and room from url
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true
})

const socket = io()

//joined chatroom
socket.emit('joinRoom', {username, room})

//get room and users
socket.on('roomUsers', ({ room, users }) => {
  outputRoomName(room)
  outputUsers(users)
})

//message from the server
socket.on('message', message => {
  outputMessage(message)

  //scroll down
  chatMessages.scrollTop = chatMessages.scrollHeight
})

//message submit
chatForm.addEventListener('submit', (e) => {
  e.preventDefault()

  //get the message text
  const msg = e.target.elements.msg.value

  //emitting a message to the server
  socket.emit('chatMessage', msg);

  //clear inputs
  e.target.elements.msg.value = ''
  e.target.elements.msg.focus()
})

//output message to DOM
function outputMessage(message) {
  const div = document.createElement('div')
  div.classList.add('message')
  div.innerHTML = `<p class="meta">${message.username} <span>${message.time}</span></p>
  <p class="text">
    ${message.text}
  </p>`
  document.querySelector('.chat-messages').appendChild(div)
}

//add room name to dom
function outputRoomName(room) {
  roomName.innerText = room
}

//add users to dom
function outputUsers(users) {
  usersList.innerHTML = `
    ${users.map(user => `<li>${user.username}</li>`).join('')}
  `
}