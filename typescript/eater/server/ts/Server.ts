/// <reference path="../typings/tsd.d.ts" />
/// <reference path="Ball.ts" />

import express = require("express");
import http = require("http");
import socketio = require("socket.io");
import Simulation from './Simulation';
import Ball from './Ball';

console.log('[*] Starting pelotas server..');



let app = express();
let socketioServer = socketio();
let httpServer = http.createServer(app);

httpServer.listen(3000, () => {
    console.log('[*] listening on *:3000');
});

app.get('/', (request, response) => {
    response.sendFile('index.html');
});


let sockets:{ [index: number]: SocketIO.Socket; }  = { };

let simulation:Simulation = new Simulation((eater:Ball, eaten:Ball) => {
    for (let userId in sockets) {
        if (sockets.hasOwnProperty(userId)) {
            sockets[userId].emit('delete', {
                i: eaten.id,
            });
            sockets[userId].emit('update', {
                i: eater.id,
                r: eater.radius
            });
        }
    }
});


socketioServer.listen(httpServer, {origins: '*:*'});
socketioServer.on('connection', (socket:SocketIO.Socket)=> {
    console.log('[*] User connected');

    // Register the socket with the userId
    let id:number = (new Date()).getTime();
    console.log(`   [*] Generated new id ${id}`);
    sockets[id] = socket;

    console.log(`   [*] Sending new id to client ${id}`);
    socket.emit('id', {id});

    console.log(`   [*] Creating new ball for user ${id}`);
    let currentBall = simulation.addBall(id, new Ball(id,
        [Math.random(), Math.random(), Math.random()],
        [(Math.random() - 0.5) * 500, (Math.random() - 0.5) * 500],
        [0, 0],
        5));

    console.log(`   [*] Sending game snapshot to the client with id ${id}`);
    let snapshot:any = [];
    for( let ballId in simulation.balls ) {
        if (simulation.balls.hasOwnProperty(ballId)) {
            let ball = simulation.balls[ballId];
            snapshot.push({
                i:ball.id,
                c:ball.color,
                p:ball.position,
                r:ball.radius
            });
        }
    }
    socket.emit('snapshot', snapshot);

    console.log(`   [*] Telling the rest of the clients about the new player ${id}`);
    for (let userId in sockets) {
        if (sockets.hasOwnProperty(userId) /*&& userId != id*/) {
            let socket:SocketIO.Socket = sockets[userId];
            socket.emit('create', {
                i: currentBall.id,
                c: currentBall.color,
                p: currentBall.position,
                r: currentBall.radius
            });
        }
    }

    socket.on('position', (pos:any) => {
        //console.log(`[*] User ${pos.i} given new velocity: ${pos.p}`);
        if(simulation.balls[pos.i] != undefined) {
            simulation.balls[pos.i].velocity = pos.p;
        }
    });

    socket.on('disconnect', () => {
        console.log(`[*] User ${id} disconnected`);
        console.log(`   [*] Telling the rest of the clients about the disconnected player ${id}`);
        delete sockets[id];
        simulation.removeBall(id);
        for (let userId in sockets) {
            if (sockets.hasOwnProperty(userId)) {
                sockets[userId].emit('delete', {
                    i: currentBall.id,
                });
            }
        }
    });
});

//// Start simulation
setInterval(() => {

    // Update simulation
    simulation.update(2);

    // Send the info about every ball to every user
    for (let userId in sockets) {
        if (sockets.hasOwnProperty(userId)) {
            for(let ballId in simulation.balls ) {
                if (simulation.balls.hasOwnProperty(ballId)) {
                    var ball = simulation.balls[ballId];
                    //console.log(`[*] New position ${ball.position}`);
                    if(!ball.isStatic) {
                        sockets[userId].emit("position", {
                            i: ball.id,
                            p: ball.position
                        });
                    }
                }
            }
        }
    }
}, 16.6);
