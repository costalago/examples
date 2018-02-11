import CollisionEntity from "./CollisionEntity";
import PhysicsEntity from "./PhysicsEntity";
import Physics from "./Physics";

/**
 * Created by Manuel on 17/08/2015.
 *
 * Main traits:
 * - it's a positionable object in the world.
 * - it's physics aware, this means it follows F=ma.
 * - It's a CollisionEntity, this means it has some kind of collision shape attached to it and reacts to collisions
 * with other objects in the world
 *
 * Other non-inherited traits:
 * - It isn't a point mass, but a rigid body, this is a body that has mass spread across a limited region in space
 * and it's incompressible.
 * - It has graphically representable information like radius and color.
 */
export default class Ballz extends PhysicsEntity {

    private static DENSITY:number = 1; // Kg / m2
    private _color:[number, number, number];
    private _radius:number = 0;

    constructor(position:[number, number], velocity:[number, number], mass:number, color:[number, number, number]) {
        super(position, velocity, mass);
        this._color = color;
        this._radius = Physics.massToRadius(this._mass, Ballz.DENSITY);
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
        this._radius = Physics.massToRadius(newMass, Ballz.DENSITY);

        // Change mass
        this._mass = newMass;
    }

    set color(color:[number, number, number]) {
        this._color = color;
    }

    get color():[number, number, number] {
        return this._color;
    }

    set radius(radius:number) {
        this._radius = radius;
    }

}

function applyMixins(derivedCtor: any, baseCtors: any[]) {
    baseCtors.forEach(baseCtor => {
        Object.getOwnPropertyNames(baseCtor.prototype).forEach(name => {
            derivedCtor.prototype[name] = baseCtor.prototype[name];
        })
    });
}