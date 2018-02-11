/**
 * Created by Manuel on 17/08/2015.
 */

import Physics from "./Physics";
/**
 * Object with a place and movement state in the world
 */
export default class Entity {

    protected _position:[number, number];
    protected _velocity:[number, number];

    constructor(position:[number, number], velocity:[number, number]) {
        this._position = position;
        this._velocity = velocity;
    }

    set position(position:[number, number]) {
        this._position = position;
    }

    get position():[number, number] {
        return this._position;
    }

    set velocity(velocity:[number, number]) {
        this._velocity = velocity;
    }

    get velocity():[number, number] {
        return this._velocity;
    }
}