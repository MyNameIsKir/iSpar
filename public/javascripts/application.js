var latitude;
var longitude;

window.onload = function(){

  //Sockets
  var socket = io.connect(document.domain);

  socket.on('connect', function(){
    console.log("Socket connected!");
  });

  //Host sockets
  socket.on('hostAlreadyExists', function(){
    $("#preexistinghost").show();
    setTimeout(function(){
      $("#preexistinghost").hide();
    }, 5000);
  });

  socket.on('hostAdded', function(){
    $("#index").hide();
    $("#playerlist").show();
  });

  socket.on('insufficientPlayers', function(){
    $("#notenoughplayers").show();
    setTimeout(function(){
      $("#notenoughplayers").hide();
    }, 5000);
  });

  socket.on('playerJoined', function(data){
    $("#players").append("<tr><td></td><td>Player " + data.playerid + "</td><td id='player" + data.playerid + "status' class='playerstatus'>Standby</td></tr>");
  });

  socket.on('playerEliminated', function(data){
    $("#player"+data.playerid+"status").html("Eliminated");
  })


  //player sockets
  socket.on('roomDoesNotExist', function(){
    $("#roomdoesnotexist").show();
    setTimeout(function(){
      $("#roomdoesnotexist").hide();
    }, 5000);
  });

  socket.on('playerAdded', function(data){
    $("#index").hide();
    $("#playerid").append(" " + data.playerid);
    $("#playerinterface").show();
    $("body").css("background-color", "yellow");
  });

  //mutual sockets
  socket.on('gameStart', function(){
    console.log("starting the game")
    $("#gamestart").hide();
    $("#waitmessage").hide;
    $(".playerstatus").html("Active");
    if(isPlayer){
      var clientSessionId = socket.io.engine.id;
      $("body").css("background-color", "#00FF00");
      // window.removeEventListener('shake', listener, false);
      window.addEventListener('shake', function(){
        socket.emit('eliminationReport', {clientId: clientSessionId});
        $("#playername").hide();
        $("#eliminated").show();
        $("body").css("background-color", "red");
      });
    }
  });

  socket.on('gameOver', function(data){
    console.log("game over");
    $("#gamereset").show();
    $("#winnermessage").html("Player " + data.winner + " wins!");
    $("#winnermessage").show();
  })

  socket.on('gameReset', function(){
    $("#gamereset").hide();
    $("#winnermessage").hide();
    $("#gamestart").show();
    //player code here
    if(isPlayer){
      $("body").css("background-color", "yellow");
      $("#playername").show();
      $("#eliminated").hide();
    }
  });

  //host button sockets
  $("#host-connect").click(function(e){
    e.preventDefault();
    if(longitude != undefined && latitude != undefined){
      console.log("host connect click")
      var clientSessionId = socket.io.engine.id;
      socket.emit('hostConnectRequest', {clientId: clientSessionId, longitude: longitude, latitude: latitude});
    } else {
      getLocation();
      $("#nolocation").show();
      setTimeout(function(){
        $("#nolocation").hide();
      }, 5000);
    }
  });

  $("#gamestart").click(function(e){
    e.preventDefault();
    console.log("host start click")
    var clientSessionId = socket.io.engine.id;
    socket.emit('gameStartRequest', {clientId: clientSessionId});
  });

  $("#gamereset").click(function(e){
    e.preventDefault();
    console.log("host reset click")
    var clientSessionId = socket.io.engine.id;
    socket.emit('gameResetRequest', {clientId: clientSessionId});
  });

  //player button sockets
  $("#player-connect").click(function(e){
    e.preventDefault();
    if(latitude && longitude){
      console.log("player connect click")
      var clientSessionId = socket.io.engine.id;
      socket.emit('playerConnectRequest', {clientId: clientSessionId, longitude: longitude, latitude: latitude});
    } else {
      getLocation();
      $("#nolocation").show();
      setTimeout(function(){
        $("#nolocation").hide();
      }, 5000);
    }
  });

  //Shake
  var shake = initializeShake(window, document);

  var isMobile = jQuery.browser.mobile;
  var isPlayer = window.DeviceMotionEvent && isMobile;
  if (isPlayer) {
    // User device is a mobile device with the device motion event enabled
    // window.addEventListener('shake', function(){
    //   shakeEventDidOccur();
    // });
    $(".mobile-player").show();
  } else if (!isMobile) {
    // User device is a computer
    $(".computer-host").show();
  } else {
    // User device is a phone with the device motion event disabled
    $(".mobile-player").show();
    alert("Your device is not compatible. Sorry!")
  }

  // title screen shake function
  function shakeEventDidOccur() {
    console.log("Device shake registered")
    var starting =  $("body").css("background-color");
    $("body").css("background-color", "red");
    setTimeout(function(){
      $("body").css("background-color", starting);
    }, 1000);
  };

  function getLocation() {
    navigator.geolocation.getCurrentPosition(function(position){
      latitude = position.coords.latitude;
      longitude = position.coords.longitude;
      console.log("geolocation found.")
    });
  };

  getLocation();
}