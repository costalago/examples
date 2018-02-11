///<reference path="Geometry.ts"/>
/**
 * Created by Manuel on 26/07/2015.
 */
import Geometry from './Geometry';
import Ball from './Ball';

export default class Simulation {

    public static MAX_MASS:number = 1000;

    private _balls:{[key:number] : Ball} = {};
    private rightWallPosition:number[] = [1000, 0, 0];
    private leftWallPosition:number[] = [-1000, 0, 0];
    private topWallPosition:number[] = [0, 1000, 0];
    private bottomWallPosition:number[] = [0, -1000, 0];
    private _currentMass:number;

    private onEatedEvent:(eater:Ball, eaten:Ball) => any;

    constructor(onBallEated:(eater:Ball, eaten:Ball) => any) {
        this.onEatedEvent = onBallEated;

        this.currentMass = 0;

        this.createFood();
    }

    public addBall(id:number, ball:Ball):Ball {
        this._balls[id] = ball;
        this.currentMass += ball.mass;
        return ball;
    }

    public removeBall(id:number) {
        if(this._balls[id] != undefined) {
            this.currentMass -= this._balls[id].mass;
            delete this._balls[id];
        }
    }

    public update(dt:number) {

        this.checkCollisions();

        for (var ballId in this._balls) {
            if (this._balls.hasOwnProperty(ballId)) {
                this._balls[ballId].update(dt);
            }
        }
    }

    //TODO: mover esto al update de la bola
    public checkCollisions() {
        for (var checkedBallId in this._balls) {
            if (this._balls.hasOwnProperty(checkedBallId)) {
                var checkedBall:Ball = this._balls[checkedBallId];

                if(checkedBall.isStatic)
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
                        var otherBall:Ball = this._balls[otherBallId];

                        // if the checked ball is contained by the other ball.. the ball is eaten and the player dies
                        if(Geometry.isPointInCircle(checkedBall.position, otherBall.position, otherBall.radius) && checkedBall.radius < otherBall.radius) {
                            otherBall.eatMass(checkedBall.mass);
                            this.removeBall(checkedBall.id);
                            this.onEatedEvent(otherBall, checkedBall);

                            // if the checked ball contains the other ball then the other ball is eaten and the player ball gains mass
                        } else if(Geometry.isPointInCircle(otherBall.position, checkedBall.position, checkedBall.radius) && otherBall.radius < checkedBall.radius) {
                            checkedBall.eatMass(otherBall.mass);
                            this.removeBall(otherBall.id);
                            this.onEatedEvent(checkedBall, otherBall);
                        }
                    }
                }

            }
        }
    }

    public createFood() {
        console.log(`[TRACE] Simulation.ts: creating food...`);
        let nballs:number = 500;
        for (let i = 0; i < nballs; i++) {
            let id = Math.random() * 10000;
            let ball:Ball  = new Ball(id, [Math.random(), Math.random(), Math.random()], [(Math.random()-0.5)*1700, (Math.random()-0.5)*1700], [0, 0], Simulation.MAX_MASS / nballs);
            ball.isStatic = true;
            this.addBall(id, ball);
        }
    }

    get balls():{[key:number]:Ball} {
        return this._balls;
    }

    get currentMass():number {
        return this._currentMass;
    }

    set currentMass(mass:number) {
        this._currentMass = mass;
        console.log(`[TRACE] Simulation.ts: current mass changed: ${this._currentMass}`);
    }
}
