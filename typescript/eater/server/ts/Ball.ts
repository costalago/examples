import Physics from './Physics';

/**
 * Created by Manuel on 26/07/2015.
 */


export default class Ball {

    private static DENSITY:number = 1; // Kg / m2
    private _id:number;
    private _color:[number, number, number];
    private _position:[number, number];
    private _velocity:[number, number];
    private _force:[number, number] = [0, 0];
    private _mass:number = 0;
    private _radius:number = 0;
    private _isStatic:boolean = false;

    constructor(id:number, color:[number, number, number], position:[number, number], velocity:[number, number], mass:number) {
        this._id = id;
        this._color = color;
        this._position = position;
        this._velocity = velocity;
        this._mass = mass;
        this._radius = Physics.massToRadius(mass, Ball.DENSITY);
    }

    public update(step:number) {

        if (!this.isStatic) {

            var nextX:number[] = Physics.rk4(this._position[0], this._velocity[0], () => {
                return this._force[0] / this._mass
            }, step);
            var nextY:number[] = Physics.rk4(this._position[1], this._velocity[1], () => {
                return this._force[1] / this._mass
            }, step);

            this._velocity = [nextX[1], nextY[1]];
            this._position = [nextX[0], nextY[0]];
        }

    }

    /**
     * Eats mass, this changes the velocity, the mass and the radius
     * the new velocity comes from conservation of momentum m1*v1 = m1'*v2'
     * @param eatedMass
     */
    public eatMass(eatedMass:number) {

        var newMass:number = this._mass + eatedMass;

        // Change velocity
        this._velocity = [
            this._mass * this._velocity[0] / newMass,
            this._mass * this._velocity[1] / newMass]

        // Change radius
        this._radius = Physics.massToRadius(newMass, Ball.DENSITY);

        // Change mass
        this._mass = newMass;
    }

    get id():number {
        return this._id;
    }

    set color(color:[number, number, number]) {
        this._color = color;
    }

    get color():[number, number, number] {
        return this._color;
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

    get radius():number {
        return this._radius;
    }

    set force(force:[number, number]) {
        this._force = force;
    }

    get mass():number {
        return this._mass;
    }

    set isStatic(flag:boolean) {
        this._isStatic = flag;
    }

    get isStatic():boolean {
        return this._isStatic;
    }
}