import Entity from "./Entity";
import Physics from "./Physics";
/**
 * Created by Manuel on 17/08/2015.
 */

export default class PhysicsEntity extends Entity {

    protected _mass:number;
    protected _force:[number, number];

    constructor(position:[number, number], velocity:[number, number], mass:number) {
        super(position, velocity);
        this._mass = mass;
    }

    public update(step:number) {

        var nextX:number[] = Physics.rk4(this._position[0], this._velocity[0], () => {
            return this._force[0] / this._mass
        }, step);
        var nextY:number[] = Physics.rk4(this._position[1], this._velocity[1], () => {
            return this._force[1] / this._mass
        }, step);

        this._velocity = [nextX[1], nextY[1]];
        this._position = [nextX[0], nextY[0]];
    }

    set force(force:[number, number]) {
        this._force = force;
    }

    get mass():number {
        return this._mass;
    }

}