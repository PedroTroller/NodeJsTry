var app = require('http').createServer(handler)
  , io  = require('socket.io').listen(app)
  , _   = require('underscore')
  , fs  = require('fs')

app.listen(8800);

function handler (req, res) {}

io.sockets.on('connection', function (socket) {

    io.sockets.emit('notice', { message: 'New connection' });

    socket.on('message', function (data) {
        if(data.message != ''){
            data.pseudo = data.pseudo == '' ? 'Anonymous' : data.pseudo;
            io.sockets.emit('message', data);
        }else{
            socket.emit('error', { message: 'Empty message !' })
        }
    });

    socket.on('notice', function (data) {
        io.sockets.emit('notice', data);
    });

    socket.on('disconnect', function () {
        io.sockets.emit('notice', { message: 'Disconnected' });
    });

});

