"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var PhysicsEntity_1 = require("./PhysicsEntity");
var Physics_1 = require("./Physics");
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
var Ballz = /** @class */ (function (_super) {
    __extends(Ballz, _super);
    function Ballz(position, velocity, mass, color) {
        var _this = _super.call(this, position, velocity, mass) || this;
        _this._radius = 0;
        _this._color = color;
        _this._radius = Physics_1.default.massToRadius(_this._mass, Ballz.DENSITY);
        return _this;
    }
    /**
     * Eats mass, this changes the velocity, the mass and the radius
     * the new velocity comes from conservation of momentum m1*v1 = m1'*v2'
     * @param eatedMass
     */
    Ballz.prototype.eatMass = function (eatedMass) {
        var newMass = this._mass + eatedMass;
        // Change velocity
        this._velocity = [
            this._mass * this._velocity[0] / newMass,
            this._mass * this._velocity[1] / newMass
        ];
        // Change radius
        this._radius = Physics_1.default.massToRadius(newMass, Ballz.DENSITY);
        // Change mass
        this._mass = newMass;
    };
    Object.defineProperty(Ballz.prototype, "color", {
        get: function () {
            return this._color;
        },
        set: function (color) {
            this._color = color;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Ballz.prototype, "radius", {
        set: function (radius) {
            this._radius = radius;
        },
        enumerable: true,
        configurable: true
    });
    Ballz.DENSITY = 1; // Kg / m2
    return Ballz;
}(PhysicsEntity_1.default));
exports.default = Ballz;
function applyMixins(derivedCtor, baseCtors) {
    baseCtors.forEach(function (baseCtor) {
        Object.getOwnPropertyNames(baseCtor.prototype).forEach(function (name) {
            derivedCtor.prototype[name] = baseCtor.prototype[name];
        });
    });
}
