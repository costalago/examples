//
///<reference path="reference.ts"/>
//var socket = io.connect('ns3000168.ip-5-196-67.eu:3000');
var socket = io.connect('localhost:3000');
var userId;
socket.on('connection', function (socket) {
    console.log('[*] conectado con exito');
});
socket.on('id', function (id) {
    userId = id.id;
    console.log("[*] following ball with id " + id.id);
    app.followBall(id.id);
});
socket.on('snapshot', function (snapshot) {
    console.log('[*] snapshot received');
    for (var i = 0; i < snapshot.length; i++) {
        app.createBall(snapshot[i].i, snapshot[i].c, snapshot[i].p, snapshot[i].r);
    }
    console.log(snapshot);
});
socket.on('position', function (position) {
    app.updateBallPos(position.i, position.p);
});
socket.on('create', function (ball) {
    console.log("[*] User with id  " + ball.i + " logged in, creating a new ball");
    app.createBall(ball.i, ball.c, ball.p, ball.r);
});
socket.on('delete', function (ball) {
    console.log("[*] User with id " + ball.i + " disconnected, removing the ball");
    app.deleteBall(ball.i);
});
socket.on('update', function (ball) {
    console.log("[*] " + ball.i + " updated");
    app.updateBall(ball);
});
var app = new Pelotas(function (userId, pos) {
    socket.emit('position', { i: userId, p: pos });
});
app.run();
//var rtc:WebRTC = new WebRTC();
