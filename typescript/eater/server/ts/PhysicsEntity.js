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
var Entity_1 = require("./Entity");
var Physics_1 = require("./Physics");
/**
 * Created by Manuel on 17/08/2015.
 */
var PhysicsEntity = /** @class */ (function (_super) {
    __extends(PhysicsEntity, _super);
    function PhysicsEntity(position, velocity, mass) {
        var _this = _super.call(this, position, velocity) || this;
        _this._mass = mass;
        return _this;
    }
    PhysicsEntity.prototype.update = function (step) {
        var _this = this;
        var nextX = Physics_1.default.rk4(this._position[0], this._velocity[0], function () {
            return _this._force[0] / _this._mass;
        }, step);
        var nextY = Physics_1.default.rk4(this._position[1], this._velocity[1], function () {
            return _this._force[1] / _this._mass;
        }, step);
        this._velocity = [nextX[1], nextY[1]];
        this._position = [nextX[0], nextY[0]];
    };
    Object.defineProperty(PhysicsEntity.prototype, "force", {
        set: function (force) {
            this._force = force;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PhysicsEntity.prototype, "mass", {
        get: function () {
            return this._mass;
        },
        enumerable: true,
        configurable: true
    });
    return PhysicsEntity;
}(Entity_1.default));
exports.default = PhysicsEntity;
