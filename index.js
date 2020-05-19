var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var _ = require('lodash');

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

var idToUsernames = [];
io.on('connection', (socket) => {
    console.log(new Date().toISOString() + ' : [' + socket.id + ' -> server] : on connection');
    idToUsernames.push({ id: socket.id, username: null });

    socket.on('disconnect', () => {
        console.log(new Date().toISOString() + ' : [' + socket.id + ' -> server] : on disconnect');
        var item = _.find(idToUsernames, { id: socket.id });
        var username = { ...item }.username;
        if (item) {
            var username = { ...item }.username;
            _.remove(idToUsernames, { id: socket.id });
            if (username) io.emit('messages', '<li><b>ประกาศ 📢:</b> ' + item.username + ' ออกจากการสนทนาไปแล้ว, จำนวนผู้สนทนาทั้งหมด ' + _.filter(idToUsernames, x => x.username).length + ' ท่าน');
        }
    });

    socket.on('chat message', (msg) => {
        console.log(new Date().toISOString() + ' : [' + socket.id + ' -> server] : chat message : ' + msg);
        io.emit('messages', '<li><b>' + _.find(idToUsernames, { id: socket.id }).username + ': </b>' + msg);
    });

    socket.on('setUsername', (username) => {
        console.log(new Date().toISOString() + ' : [' + socket.id + ' -> server] : setUsername : ' + username);
        var index = _.findIndex(idToUsernames, { username: username });
        if (index >= 0) socket.emit('validateUsername', { isSuccess: false, message: 'มีผู้ใช้ชื่อ ' + username + ' แล้ว กรุณาตั้งชื่อใหม่' });
        else {
            var item = _.find(idToUsernames, { id: socket.id });
            item.username = username;
            socket.emit('validateUsername', { isSuccess: true, message: username });
            console.log('[array-tag] idToUsernames =', idToUsernames);
            io.emit('messages', '<li><b>ประกาศ 📢:</b> ' + username + ' เข้าร่วมการสนทนาแล้ว, จำนวนผู้สนทนาทั้งหมด ' + _.filter(idToUsernames, x => x.username).length + ' ท่าน');
        }
    });
});

http.listen(3000, () => {
    console.log(new Date().toISOString() + ' : listening on *:3000');
});