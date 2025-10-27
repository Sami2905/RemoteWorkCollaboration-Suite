const express = require('express')
const http = require('http')
const cors = require('cors')
const { Server } = require('socket.io')

const app = express()
app.use(cors({ origin: 'http://localhost:5173' }))
const server = http.createServer(app)
const io = new Server(server, { cors: { origin: 'http://localhost:5173' } })

io.on('connection', socket => {
  socket.on('join', room => socket.join(room))
  socket.on('signal', ({ room, data }) => {
    socket.to(room).emit('signal', { from: socket.id, data })
  })
})

const PORT = process.env.PORT || 8082
server.listen(PORT, () => console.log(Signaling on :))
