"use strict";
/**
 * Created by Manuel on 17/08/2015.
 */
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Object with a place and movement state in the world
 */
var Entity = /** @class */ (function () {
    function Entity(position, velocity) {
        this._position = position;
        this._velocity = velocity;
    }
    Object.defineProperty(Entity.prototype, "position", {
        get: function () {
            return this._position;
        },
        set: function (position) {
            this._position = position;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Entity.prototype, "velocity", {
        get: function () {
            return this._velocity;
        },
        set: function (velocity) {
            this._velocity = velocity;
        },
        enumerable: true,
        configurable: true
    });
    return Entity;
}());
exports.default = Entity;
