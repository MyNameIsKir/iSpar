function shakeEventDidOccur () {
  $("body").css("background-color", "red");
  setTimeout(function(){
    $("body").css("background-color", "black");
  }, 1000);
};

window.onload = function(){
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
}