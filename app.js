//User Management
function Player(id, socketid) {
    this.id = id;
    this.socketid = socketid;
    this.gameStatus = "standby";
};

function Room(hostSocketId) {
    this.hostId = hostSocketId;
    this.players = []; //populate with Player objects
    this.playerCount = 0;
}

var currentRooms = {
    //populate with Room objects
};

var express = require('express');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes/index');
var users = require('./routes/users');

var app = express();

var http = require('http').createServer(app);
var io = require('socket.io').listen(http);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(favicon());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/users', users);

/// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;

http.listen(process.env.PORT || 3000, function(){
    console.log("Listening...")
});

//Socket.io

io.on('connection', function(socket){

    socket.on('connection', function(){
        var ipaddress = socket.handshake.address
        console.log("A user has connected. Their IP address is: " + ipaddress);
    });

    socket.on('disconnect', function(){
        console.log("A user has disconnected.");
    });

    //Host
    socket.on('hostConnectRequest', function(data){
        console.log("A host request has been made.");
        var ipaddress = socket.handshake.address;
        if(currentRooms[ipaddress] && currentRooms[ipaddress].hostId){
            socket.emit('hostAlreadyExists');
            console.log(currentRooms);
        } else {
            currentRooms[ipaddress] = new Room(data.clientId);
            socket.emit('hostAdded');
            console.log(currentRooms);
        }
    });

    socket.on('gameStartRequest', function(){
        var ipaddress = socket.handshake.address;
        var players = currentRooms[ipaddress].players;
        if(players.length > 1){
            socket.emit('gameStart');
            for(player in players){
                io.sockets.socket(player.socketid).emit('gameStart');
            }
        } else {
            socket.emit('insufficientPlayers');
        }
    });

    socket.on('gameResetRequest', function(){
        //todo
    });


    socket.on('playerConnectRequest', function(data){
        console.log("A player request has been made.");
        var ipaddress = socket.handshake.address;
        var room = currentRooms[ipaddress];
        if(room){
            room.playerCount++;
            room.players.push(new Player(room.playerCount, data.clientId));
            socket.emit('playerAdded');
        } else {
            socket.emit('roomDoesNotExist');
        }
    });
});