"use strict";
/**
 * Created by Manuel on 17/08/2015.
 */
Object.defineProperty(exports, "__esModule", { value: true });
var CollisionEntity = /** @class */ (function () {
    function CollisionEntity() {
    }
    Object.defineProperty(CollisionEntity.prototype, "radius", {
        get: function () {
            return this._radius;
        },
        enumerable: true,
        configurable: true
    });
    return CollisionEntity;
}());
exports.default = CollisionEntity;
