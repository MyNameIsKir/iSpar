//User Management
function Player(id, socketid, room) {
    this.id = id;
    this.socketid = socketid;
    this.room = room;
    this.gameStatus = "standby";
};

function Room(hostSocketId, latitude, longitude) {
    this.hostId = hostSocketId;
    this.latitude = latitude;
    this.longitude = longitude;
    this.players = []; //populate with Player objects
    this.playerCount = 0;
}

var currentRooms = {
    rooms: [],
    findRoomByLocation: function(longitude, latitude){
        var found = false;
        this.rooms.forEach(function(room){
            var distance = greatCircleDistance(longitude, latitude, room.longitude, room.latitude);
            console.log("room distance is " + distance);
            if(distance < 100000){
                console.log("found it!")
                found = room;
            }
        });
        return found;
    }
};

var connectedPlayers = {
    players: []
}

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
var _ = require('underscore');

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

//Great Circle Distance
if (typeof(Number.prototype.toRad) === "undefined") {
  Number.prototype.toRad = function() {
    return this * Math.PI / 180;
  }
}

function greatCircleDistance(lat1, lon1, lat2, lon2){
    var R = 6371; // km
    var dLat = (lat2-lat1).toRad();
    var dLon = (lon2-lon1).toRad();
    var lat1 = lat1.toRad();
    var lat2 = lat2.toRad();

    var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    var d = R * c;
    return d;
}

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
        console.log("host longitude: " + data.longitude + " latitude: " + data.latitude);
        var existing = currentRooms.findRoomByLocation(data.longitude, data.latitude);
        if(existing){
            socket.emit('hostAlreadyExists');
            console.log(currentRooms);
        } else {
            currentRooms.rooms.push(new Room(data.clientId, data.longitude, data.latitude));
            socket.emit('hostAdded');
            console.log(currentRooms);
        }
    });

    socket.on('gameStartRequest', function(data){
        console.log("host id = " + data.clientId);
        console.log("current rooms:" + currentRooms.rooms)
        var room = _.find(currentRooms.rooms, function(room){return room.hostId === data.clientId});
        console.log(room);
        var players = room.players
        if(players.length > 1){
            console.log("starting the game")
            socket.emit('gameStart');
            console.log(players)
            players.forEach(function(player){
                player.gameStatus = "active";
                io.sockets.connected[player.socketid].emit('gameStart');
            });
        } else {
            socket.emit('insufficientPlayers');
        }
    });

    socket.on('gameResetRequest', function(){
        var players = _.find(currentRooms.rooms, function(room){return room.hostId === data.clientId}).players
        socket.emit('gameReset');
        players.forEach(function(player){
            player.gameStatus = "standby";
            io.sockets.connected[player.socketid].emit('gameReset');
        });
    });

    //Player
    socket.on('playerConnectRequest', function(data){
        console.log("A player request has been made.");
        var longitude = data.longitude;
        var latitude = data.latitude;
        console.log("player longitude: " + longitude + " latitude: " + latitude);
        var room = currentRooms.findRoomByLocation(longitude, latitude);
        console.log(room);
        if(room){
            room.playerCount++;
            var player = new Player(room.playerCount, data.clientId, room);
            room.players.push(player);
            connectedPlayers.players.push(player);
            socket.emit('playerAdded', {playerid: room.playerCount});
            io.sockets.connected[room.hostId].emit('playerJoined', {playerid: room.playerCount});
    f    } else {
            socket.emit('roomDoesNotExist');
        }
    });

    socket.on('eliminationReport', function(data){
        var reportingPlayer = _.find(connectedPlayers.players, function(player){
            return player.socketid === data.clientId;
        })
        console.log(reportingPlayer);
        reportingPlayer.gameStatus = "eliminated";
        console.log(reportingPlayer);
        console.log(reportingPlayer.room);
        io.sockets.connected[reportingPlayer.room.hostId].emit('playerEliminated', {playerid: reportingPlayer.id});
        var remaining = _.find(reportingPlayer.room.players, function(player){
            return player.gameStatus === "active";
        });
        console.log("remaining players: " + remaining);
        if(remaining.length <= 1){
            io.sockets.connected[reportingPlayer.room.hostId].emit('gameOver', {winner: remaining[0].id});
        };
    });
});