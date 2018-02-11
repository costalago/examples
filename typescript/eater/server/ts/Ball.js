"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Physics_1 = require("./Physics");
/**
 * Created by Manuel on 26/07/2015.
 */
var Ball = /** @class */ (function () {
    function Ball(id, color, position, velocity, mass) {
        this._force = [0, 0];
        this._mass = 0;
        this._radius = 0;
        this._isStatic = false;
        this._id = id;
        this._color = color;
        this._position = position;
        this._velocity = velocity;
        this._mass = mass;
        this._radius = Physics_1.default.massToRadius(mass, Ball.DENSITY);
    }
    Ball.prototype.update = function (step) {
        var _this = this;
        if (!this.isStatic) {
            var nextX = Physics_1.default.rk4(this._position[0], this._velocity[0], function () {
                return _this._force[0] / _this._mass;
            }, step);
            var nextY = Physics_1.default.rk4(this._position[1], this._velocity[1], function () {
                return _this._force[1] / _this._mass;
            }, step);
            this._velocity = [nextX[1], nextY[1]];
            this._position = [nextX[0], nextY[0]];
        }
    };
    /**
     * Eats mass, this changes the velocity, the mass and the radius
     * the new velocity comes from conservation of momentum m1*v1 = m1'*v2'
     * @param eatedMass
     */
    Ball.prototype.eatMass = function (eatedMass) {
        var newMass = this._mass + eatedMass;
        // Change velocity
        this._velocity = [
            this._mass * this._velocity[0] / newMass,
            this._mass * this._velocity[1] / newMass
        ];
        // Change radius
        this._radius = Physics_1.default.massToRadius(newMass, Ball.DENSITY);
        // Change mass
        this._mass = newMass;
    };
    Object.defineProperty(Ball.prototype, "id", {
        get: function () {
            return this._id;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Ball.prototype, "color", {
        get: function () {
            return this._color;
        },
        set: function (color) {
            this._color = color;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Ball.prototype, "position", {
        get: function () {
            return this._position;
        },
        set: function (position) {
            this._position = position;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Ball.prototype, "velocity", {
        get: function () {
            return this._velocity;
        },
        set: function (velocity) {
            this._velocity = velocity;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Ball.prototype, "radius", {
        get: function () {
            return this._radius;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Ball.prototype, "force", {
        set: function (force) {
            this._force = force;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Ball.prototype, "mass", {
        get: function () {
            return this._mass;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Ball.prototype, "isStatic", {
        get: function () {
            return this._isStatic;
        },
        set: function (flag) {
            this._isStatic = flag;
        },
        enumerable: true,
        configurable: true
    });
    Ball.DENSITY = 1; // Kg / m2
    return Ball;
}());
exports.default = Ball;
