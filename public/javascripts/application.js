function shakeEventDidOccur () {
  $("body").css("background-color", "red");
  setTimeout(function(){
    $("body").css("background-color", "white");
  }, 1000);
};

window.onload = function(){
  if (window.DeviceMotionEvent) {
      $('#shake').html("Supported!")
    window.addEventListener('shake', function(){
      shakeEventDidOccur();
    });
  } else {
    $('#shake').html("Not supported.")
  }
}