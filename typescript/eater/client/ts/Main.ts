//
///<reference path="reference.ts"/>

//var socket = io.connect('ns3000168.ip-5-196-67.eu:3000');
var socket:SocketIOClient.Socket = io.connect('localhost:3000');
var userId:number;

socket.on('connection', (socket:SocketIOClient.Socket) => {
    console.log('[*] conectado con exito');
});

socket.on('id', (id:any) => {
    userId = id.id;
    console.log(`[*] following ball with id ${id.id}`);
    app.followBall(id.id);
});

socket.on('snapshot', (snapshot:any) => {
    console.log('[*] snapshot received');
    for (var i = 0; i < snapshot.length; i++) {
        app.createBall(snapshot[i].i, snapshot[i].c, snapshot[i].p, snapshot[i].r);
    }
    console.log(snapshot);
});

socket.on('position', (position:any) => {
    app.updateBallPos(position.i, position.p);
});

socket.on('create', (ball:any) => {
    console.log(`[*] User with id  ${ball.i} logged in, creating a new ball`);
    app.createBall(ball.i, ball.c, ball.p, ball.r);
});

socket.on('delete', (ball:any) => {
    console.log(`[*] User with id ${ball.i} disconnected, removing the ball`);
    app.deleteBall(ball.i);
});

socket.on('update', (ball:any) => {
    console.log(`[*] ${ball.i} updated`);
    app.updateBall(ball);
});

var app:Pelotas = new Pelotas((userId:number, pos:[number, number])=>{
    socket.emit('position', {i:userId, p:pos});
});
app.run();

//var rtc:WebRTC = new WebRTC();






