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
    $("#playerInterface").show();
  });

  //mutual sockets
  socket.on('gamestart', function(){
    $("#gamestart").hide();
    //player code here
  });

  //host button sockets
  $("#host-connect").click(function(e){
    e.preventDefault();
    console.log("host connect click")
    var clientSessionId = socket.io.engine.id;
    socket.emit('hostConnectRequest', {clientId: clientSessionId});
  });

  $("#gamestart").click(function(e){
    e.preventDefault();
    console.log("host start click")
    socket.emit('gameStartRequest');
  })

  $("#gamereset").click(function(e){
    e.preventDefault();
    console.log("host reset click")
    socket.emit('gameResetRequest');
  });

  //player button sockets
  $("#player-connect").click(function(e){
    e.preventDefault();
    console.log("player connect click")
    var clientSessionId = socket.io.engine.id;
    socket.emit('playerConnectRequest', {clientId: clientSessionId});
  });

  //Shake
  var shake = initializeShake(window, document);

  var isMobile = jQuery.browser.mobile
  if (window.DeviceMotionEvent && isMobile) {
    // User device is a mobile device with the device motion event enabled
    window.addEventListener('shake', function(){
      shakeEventDidOccur();
    });
    $(".mobile-player").show();
  } else if (!isMobile) {
    // User device is a computer
    $(".computer-host").show();
  } else {
    // User device is a phone with the device motion event disabled
    $(".mobile-player").show();
    alert("Your device is not compatible. Sorry!")
  }

  // Actions that occur on shake when at title screen
  function shakeEventDidOccur () {
    console.log("Device shake registered")
    $("body").css("background-color", "red");
    setTimeout(function(){
      $("body").css("background-color", "black");
    }, 1000);
  };
}