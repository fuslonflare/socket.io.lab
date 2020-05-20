let app = require('express')()
let http = require('http').createServer(app)
let io = require('socket.io')(http)
let _ = require('lodash')

const event2 = 'logout_other_sessions'
const event3 = 'force_logout'

app.get('/', (req, res) => {
    res.send('<p>socket.io : Welcome welcome speech 🤤🤤<p>')
})

let userInfos = []
io.on('connection', (socket) => {
    console.log(`${new Date().toISOString()} : [${socket.id} -> server] : on connection`)
    userInfos.push({ id: socket.id, username: null, uuid: null })

    socket.on('disconnect', () => {
        console.log(`${new Date().toISOString()} : [${socket.id} -> server] : on disconnect`)
        let username = _.find(userInfos, { id: socket.id })
        socket.leave(username)
        _.remove(userInfos, (e) => {
            return e.id == socket.id
        })
        console.log(`userInfos = ${userInfos}`)
    })

    socket.on(event2, (msg) => {
        console.log(`${new Date().toISOString()} : [${socket.id} -> server] : ${event2} : ${JSON.stringify(msg)}`)
        let info = _.find(userInfos, { id: socket.id })
        if (info) {
            info.username = msg.username
            info.uuid = msg.uuid
        }
        socket.join(msg.username)
        socket.to(msg.username).emit(event3)
        console.log(`userInfos = ${JSON.stringify(userInfos)}`)
    })
})

http.listen(4000, () => {
    console.log(new Date().toISOString() + ' : listening on *:4000')
})