var serverBaseUrl = "http://127.0.0.0"
io = { connect: function() { return new Socket }};
function Socket(){
  this.on = function(){}
  this.emit = function(){}
}
describe("Application Testing", function(){
  describe("for the host", function(){
    it("should show player if host", function(){
      var sessionId = "afakeid"
      var participants = [{id: "afakeid"}]
      var data = {participants: participants, song: "https://soundcloud.com/hudsonmohawke/chimes", timestamp: 0, currentProgress: 0, playing: false}
      newConnection(data)
      expect($("#connect-button").is(":visible")).toBe(false)
      expect($('#guest-playing').is(":visible")).toBe(false)
      expect($("#wait-screen").is(":visible")).toBe(false)
      // expect($("#player").is(":visible")).toBe(true)
    })

  })

})
