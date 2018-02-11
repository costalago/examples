//
///<reference path="reference.ts"/>
/**
 * Geometry utilities
 */
var Geometry = /** @class */ (function () {
    function Geometry() {
    }
    /**
     * Creates a circle with nverts-1 edges
     * @param nverts
     * @param color
     * @returns {any[]}
     */
    Geometry.createCircle = function (nverts, color) {
        var radius = 1;
        var vertices = [];
        var colors = [];
        var step = 360.0 / nverts;
        var angle = 0.0;
        for (var i = 0; i < nverts; i++) {
            vertices[i * 3] = radius * Math.cos(angle * Math.PI / 180);
            vertices[i * 3 + 1] = radius * Math.sin(angle * Math.PI / 180);
            vertices[i * 3 + 2] = 0.0;
            colors[i * 4] = color[0];
            colors[i * 4 + 1] = color[1];
            colors[i * 4 + 2] = color[2];
            colors[i * 4 + 3] = 1.0;
            angle += step;
        }
        return [vertices, colors];
    };
    Geometry.isPointInCircle = function (checkedPoint, circleCenter, circleRadius) {
        return ((checkedPoint[0] - circleCenter[0]) * (checkedPoint[0] - circleCenter[0])) +
            ((checkedPoint[1] - circleCenter[1]) * (checkedPoint[1] - circleCenter[1])) <= (circleRadius * circleRadius);
    };
    Geometry.isCircleInCircle = function (checkedCircleCenter, checkedCircleRadius, circleCenter, circleRadius) {
        return Geometry.isPointInCircle(checkedCircleCenter, circleCenter, circleRadius) && checkedCircleRadius < circleRadius;
    };
    return Geometry;
}());
