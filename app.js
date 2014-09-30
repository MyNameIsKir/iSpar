//User Management
function Player(id, socketid) {
    this.id = id;
    this.socketid = socketid;
    this.room;
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
    findRoomByLocation: function(socket, longitude, latitude){
        var foundRoom = false;
        for(room in currentRooms.rooms){
            var distance = greatCircleDistance(longitude, latitude, room.longitude, room.latitude);
            console.log("room distance is " + distance);
            if(distance < 0.1){
                foundRoom = room;
                room.playerCount++;
                room.players.push(new Player(room.playerCount, data.clientId, room));
                socket.emit('playerAdded', {playerid: room.playerCount + 1});
                io.sockets.socket(room.hostId).emit('playerJoined', {playerid: room.playerCount + 1});
            }
        };
        if(!foundRoom){socket.emit('roomDoesNotExist');}
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
        var ipaddress = socket.handshake.address;
        if(currentRooms[ipaddress] && currentRooms[ipaddress].hostId){
            socket.emit('hostAlreadyExists');
            console.log(currentRooms);
        } else {
            currentRooms[ipaddress] = new Room(data.clientId, data.longitude, data.latitude);
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
                player.gameStatus = "active";
                io.sockets.socket(player.socketid).emit('gameStart');
            }
        } else {
            socket.emit('insufficientPlayers');
        }
    });

    socket.on('gameResetRequest', function(){
        var ipaddress = socket.handshake.address;
        var players = currentRooms[ipaddress].players;
        for(player in players){
            player.gameStatus = "standby";
            io.sockets.socket(player.socketid).emit('gameReset');
        }
    });

    //Player
    socket.on('playerConnectRequest', function(data){
        console.log("A player request has been made.");
        var longitude = data.longitude;
        var latitude = data.latitude;
        console.log("player longitude: " + longitude + " latitude: " + latitude);
        var room = currentRooms.findRoomByLocation(socket, longitude, latitude);
    });

    socket.on('eliminationReport', function(data){
        var reportingPlayer = _.find(connectedPlayers.players, function(player){
            return player.socketid === socket;
        })
        reportingPlayer.gameStatus = "eliminated";
        io.sockets.socket(reportingPlayer.room.hostId).emit('playerEliminated', {playerid: reportingPlayer.id});
    });
});