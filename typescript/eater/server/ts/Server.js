"use strict";
/// <reference path="../typings/tsd.d.ts" />
/// <reference path="Ball.ts" />
Object.defineProperty(exports, "__esModule", { value: true });
var express = require("express");
var http = require("http");
var socketio = require("socket.io");
var Simulation_1 = require("./Simulation");
var Ball_1 = require("./Ball");
console.log('[*] Starting pelotas server..');
var app = express();
var socketioServer = socketio();
var httpServer = http.createServer(app);
httpServer.listen(3000, function () {
    console.log('[*] listening on *:3000');
});
app.get('/', function (request, response) {
    response.sendFile('index.html');
});
var sockets = {};
var simulation = new Simulation_1.default(function (eater, eaten) {
    for (var userId in sockets) {
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
socketioServer.listen(httpServer, { origins: '*:*' });
socketioServer.on('connection', function (socket) {
    console.log('[*] User connected');
    // Register the socket with the userId
    var id = (new Date()).getTime();
    console.log("   [*] Generated new id " + id);
    sockets[id] = socket;
    console.log("   [*] Sending new id to client " + id);
    socket.emit('id', { id: id });
    console.log("   [*] Creating new ball for user " + id);
    var currentBall = simulation.addBall(id, new Ball_1.default(id, [Math.random(), Math.random(), Math.random()], [(Math.random() - 0.5) * 500, (Math.random() - 0.5) * 500], [0, 0], 5));
    console.log("   [*] Sending game snapshot to the client with id " + id);
    var snapshot = [];
    for (var ballId in simulation.balls) {
        if (simulation.balls.hasOwnProperty(ballId)) {
            var ball = simulation.balls[ballId];
            snapshot.push({
                i: ball.id,
                c: ball.color,
                p: ball.position,
                r: ball.radius
            });
        }
    }
    socket.emit('snapshot', snapshot);
    console.log("   [*] Telling the rest of the clients about the new player " + id);
    for (var userId in sockets) {
        if (sockets.hasOwnProperty(userId) /*&& userId != id*/) {
            var socket_1 = sockets[userId];
            socket_1.emit('create', {
                i: currentBall.id,
                c: currentBall.color,
                p: currentBall.position,
                r: currentBall.radius
            });
        }
    }
    socket.on('position', function (pos) {
        //console.log(`[*] User ${pos.i} given new velocity: ${pos.p}`);
        if (simulation.balls[pos.i] != undefined) {
            simulation.balls[pos.i].velocity = pos.p;
        }
    });
    socket.on('disconnect', function () {
        console.log("[*] User " + id + " disconnected");
        console.log("   [*] Telling the rest of the clients about the disconnected player " + id);
        delete sockets[id];
        simulation.removeBall(id);
        for (var userId in sockets) {
            if (sockets.hasOwnProperty(userId)) {
                sockets[userId].emit('delete', {
                    i: currentBall.id,
                });
            }
        }
    });
});
//// Start simulation
setInterval(function () {
    // Update simulation
    simulation.update(2);
    // Send the info about every ball to every user
    for (var userId in sockets) {
        if (sockets.hasOwnProperty(userId)) {
            for (var ballId in simulation.balls) {
                if (simulation.balls.hasOwnProperty(ballId)) {
                    var ball = simulation.balls[ballId];
                    //console.log(`[*] New position ${ball.position}`);
                    if (!ball.isStatic) {
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
