"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
///<reference path="Geometry.ts"/>
/**
 * Created by Manuel on 26/07/2015.
 */
var Geometry_1 = require("./Geometry");
var Ball_1 = require("./Ball");
var Simulation = /** @class */ (function () {
    function Simulation(onBallEated) {
        this._balls = {};
        this.rightWallPosition = [1000, 0, 0];
        this.leftWallPosition = [-1000, 0, 0];
        this.topWallPosition = [0, 1000, 0];
        this.bottomWallPosition = [0, -1000, 0];
        this.onEatedEvent = onBallEated;
        this.currentMass = 0;
        this.createFood();
    }
    Simulation.prototype.addBall = function (id, ball) {
        this._balls[id] = ball;
        this.currentMass += ball.mass;
        return ball;
    };
    Simulation.prototype.removeBall = function (id) {
        if (this._balls[id] != undefined) {
            this.currentMass -= this._balls[id].mass;
            delete this._balls[id];
        }
    };
    Simulation.prototype.update = function (dt) {
        this.checkCollisions();
        for (var ballId in this._balls) {
            if (this._balls.hasOwnProperty(ballId)) {
                this._balls[ballId].update(dt);
            }
        }
    };
    //TODO: mover esto al update de la bola
    Simulation.prototype.checkCollisions = function () {
        for (var checkedBallId in this._balls) {
            if (this._balls.hasOwnProperty(checkedBallId)) {
                var checkedBall = this._balls[checkedBallId];
                if (checkedBall.isStatic)
                    continue;
                // Collisions against walls
                if (checkedBall.position[0] + checkedBall.radius > this.rightWallPosition[0]) {
                    checkedBall.position[0] -= (checkedBall.position[0] + checkedBall.radius) - this.rightWallPosition[0];
                    //console.log("collision right wall, changing velocity from ==>" + checkedBall.velocity);
                    checkedBall.velocity[0] *= -1;
                    //console.log("to ==>" + checkedBall.velocity);
                }
                if (checkedBall.position[0] - checkedBall.radius < this.leftWallPosition[0]) {
                    checkedBall.position[0] += this.leftWallPosition[0] - (checkedBall.position[0] - checkedBall.radius);
                    checkedBall.velocity[0] *= -1;
                }
                if (checkedBall.position[1] + checkedBall.radius > this.topWallPosition[1]) {
                    checkedBall.position[1] -= (checkedBall.position[1] + checkedBall.radius) - this.topWallPosition[1];
                    checkedBall.velocity[1] *= -1;
                }
                if (checkedBall.position[1] - checkedBall.radius < this.bottomWallPosition[1]) {
                    checkedBall.position[1] += this.bottomWallPosition[1] - (checkedBall.position[1] - checkedBall.radius);
                    checkedBall.velocity[1] *= -1;
                }
                // Check collisions with other balls
                for (var otherBallId in this._balls) {
                    if (this._balls.hasOwnProperty(otherBallId) && otherBallId != checkedBallId) {
                        var otherBall = this._balls[otherBallId];
                        // if the checked ball is contained by the other ball.. the ball is eaten and the player dies
                        if (Geometry_1.default.isPointInCircle(checkedBall.position, otherBall.position, otherBall.radius) && checkedBall.radius < otherBall.radius) {
                            otherBall.eatMass(checkedBall.mass);
                            this.removeBall(checkedBall.id);
                            this.onEatedEvent(otherBall, checkedBall);
                            // if the checked ball contains the other ball then the other ball is eaten and the player ball gains mass
                        }
                        else if (Geometry_1.default.isPointInCircle(otherBall.position, checkedBall.position, checkedBall.radius) && otherBall.radius < checkedBall.radius) {
                            checkedBall.eatMass(otherBall.mass);
                            this.removeBall(otherBall.id);
                            this.onEatedEvent(checkedBall, otherBall);
                        }
                    }
                }
            }
        }
    };
    Simulation.prototype.createFood = function () {
        console.log("[TRACE] Simulation.ts: creating food...");
        var nballs = 500;
        for (var i = 0; i < nballs; i++) {
            var id = Math.random() * 10000;
            var ball = new Ball_1.default(id, [Math.random(), Math.random(), Math.random()], [(Math.random() - 0.5) * 1700, (Math.random() - 0.5) * 1700], [0, 0], Simulation.MAX_MASS / nballs);
            ball.isStatic = true;
            this.addBall(id, ball);
        }
    };
    Object.defineProperty(Simulation.prototype, "balls", {
        get: function () {
            return this._balls;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Simulation.prototype, "currentMass", {
        get: function () {
            return this._currentMass;
        },
        set: function (mass) {
            this._currentMass = mass;
            console.log("[TRACE] Simulation.ts: current mass changed: " + this._currentMass);
        },
        enumerable: true,
        configurable: true
    });
    Simulation.MAX_MASS = 1000;
    return Simulation;
}());
exports.default = Simulation;
