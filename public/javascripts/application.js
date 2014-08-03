alert("I loaded!")
window.onload=function(){
  console.log("loaded!")
  if (window.DeviceMotionEvent) {
      $('#shake').html("Supported!")
    window.addEventListener('devicemotion', function(){
      $('#shake').append("<p>shake!</p>")
    });
  } else {
    $('#shake').html("Not supported.")
  }
}