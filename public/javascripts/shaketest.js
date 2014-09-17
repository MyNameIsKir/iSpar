window.onload = function() {
  window.addEventListener('shake', shakeEventDidOccur, false);

  //define a custom method to fire when shake occurs.
  function shakeEventDidOccur () {
    $("body").css("background-color", "red");
    setTimeout(function(){
      $("body").css("background-color", "white");
    }, 1000);
  };
};