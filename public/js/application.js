$(document).ready(function(){
  View.hideAll()
  var connection = new Connection()
  connection.bindListeners()

})

timestampData = {}
var serverBaseUrl = document.domain;

function Client(){
  this.sessionId = ''
  this.CurrentSongUrl = ''
}

Client.prototype = {
  isHost: function(data){
    return sessionId == data.participants[0].id
  }
}

function Connection(){
  this.socket = io.connect(serverBaseUrl);
}

Connection.prototype.bindListeners = function(){
  this.socket.on('connect', this.emitNewUser.bind(this))
  this.socket.on('newConnection', this.newConnection.bind(this) )
  this.socket.on('hostSentTimestamps', this.readyToConnect.bind(this))
  this.socket.on('songReadyForGuests', this.guestReadySong.bind(this))
  this.socket.on('error', this.errorMessage.bind(this))
  $(document).on("newSong", this.emitCurrentSong.bind(this))
  $(document).on("newGuest", this.emitGuestConnect.bind(this))
  $(document).on("sendHostClickedPlay", this.emitHostClickedPlay.bind(this))
}

Connection.prototype.emitNewUser = function(){
  sessionId = this.socket.io.engine.id;
  this.socket.emit('newUser', {id: sessionId, name: $('#name').val(), song: "", timestamp: 0, currentProgress: 0, playing: false});
}

Connection.prototype.newConnection = function(data){
  if (Helper.isHost(data)) {
    View.hideAll()
    View.showPlayer()
  } else {
    View.hideAll()
    View.changeView(data)
  }
}

Connection.prototype.guestReadySong = function(data){
  globalCurrentSongUrl = data.participants[0].song
}

Connection.prototype.readyToConnect = function(data){
  timestampData = data.participants[0]
  if (sessionId != data.participants[0].id) {
    $('#connect-button').show()
    $('#wait-screen').hide()
  }
}

Connection.prototype.errorMessage = function(reason){
    console.log('unable to connect to server sry bro', reason);
}

Connection.prototype.emitCurrentSong = function(event, data){
  this.socket.emit('hostPickedSong', {song: data});
}

Connection.prototype.emitGuestConnect = function(){
  this.socket.emit('userClickedConnect', {id: this.socket.io.engine.id, playing: true});
}

Connection.prototype.emitHostClickedPlay = function(event, timestamp, songProgress){
  this.socket.emit('hostClickedPlay', {timestamp: timestamp, songProgress: songProgress});
}


// ConnectionStore
Helper = {}
//change to client soon
Helper.isHost = function(data){
  return sessionId == data.participants[0].id
}
Helper.isHostPlaying = function(data){
  return data.participants[0].playing
}

Helper.setHostInfo = function(data){
  globalCurrentSongUrl = data.participants[0].song
  timestampData.timestamp = data.participants[0].timestamp
  timestampData.songProgress = data.participants[0].songProgress
}


View = {}

View.changeView = function(data){
  Helper.setHostInfo(data)
  var isClientPlaying = $.grep(data.participants, function(e){ return e.id == sessionId})[0].playing
  if (!Helper.isHostPlaying(data)) {
    View.showWaitScreen()
  }else if(Helper.isHostPlaying(data) && !isClientPlaying){
    $('#connect-button').show()
    $('#wait-screen').hide()
    $('#guest-playing').hide()
  }
}

View.showPlayer = function(){
  if(!$('#player').is(":visible")) {
    $('#player').show()
  }
}

View.showWaitScreen= function(){
  if(!$('#wait-screen').is(":visible")) {
    $('#wait-screen').show()
    View.waitTextAnimator()
  }
}

View.hideAll= function(){
  $('#connect-button').hide()
  $('#wait-screen').hide()
  $('#guest-playing').hide()
  $('#player').hide()
}

View.waitTextAnimator = function(){
  setInterval(function(){
  $('#wait-screen').find('h3').css( "margin-top", function( index ) {
    return (Math.floor(Math.random()*300));})
  $('#wait-screen').find('h3').css( "margin-left", function( index ) {
    return (Math.floor(Math.random()*250));})
  }, 2000)
}
