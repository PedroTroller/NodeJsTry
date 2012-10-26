var app         = require('http').createServer(handler)
  , io          = require('socket.io').listen(app)
  , _           = require('underscore')
  , Backbone    = require('backbone')
  , fs          = require('fs')

app.listen(8800);

function handler (req, res) {}

var Client = Backbone.Model.extend({});

var ClientList = Backbone.Collection.extend({
    model: Client
});

var clients = new ClientList();

clients.bind('add remove change', function(){
    io.sockets.emit('clients', clients.toJSON());
});

io.sockets.on('connection', function (socket) {

    clients.add(new Client({ id: socket.id, connected: true, pseudo: 'Anonymous' }));

    console.log(socket.id);

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

    socket.on('pseudo', function (data) {
        clients.get(socket.id).set({ pseudo: data.pseudo });
    });

    socket.on('disconnect', function () {
        clients.get(socket.id).set({connected: false});
    });

});

