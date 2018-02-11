//
///<reference path="reference.ts"/>
/**
 * Geometry utilities
 */
class Geometry {

    /**
     * Creates a circle with nverts-1 edges
     * @param nverts
     * @param color
     * @returns {any[]}
     */
    public static createCircle(nverts:number, color:[number, number, number]) : [number[], number[]] {
        var radius:number = 1;
        var vertices:number[] = [];
        var colors:number[] = [];
        var step = 360.0 / nverts;

        var angle = 0.0;
        for (var i = 0; i < nverts; i++) {
            vertices[i*3] = radius * Math.cos(angle * Math.PI / 180);
            vertices[i*3+1] = radius * Math.sin(angle * Math.PI / 180);
            vertices[i*3+2] = 0.0;
            colors[i*4] = color[0];
            colors[i*4+1] = color[1];
            colors[i*4+2] = color[2];
            colors[i*4+3] = 1.0;
            angle += step;
        }

        return [vertices, colors];
    }


    public static isPointInCircle(checkedPoint:number[], circleCenter:number[], circleRadius:number):boolean {
        return ((checkedPoint[0] - circleCenter[0]) * (checkedPoint[0] - circleCenter[0])) +
            ((checkedPoint[1] - circleCenter[1]) * (checkedPoint[1] - circleCenter[1])) <= (circleRadius * circleRadius);
    }

    public static isCircleInCircle(checkedCircleCenter:number[], checkedCircleRadius:number, circleCenter:number[], circleRadius:number): boolean {
        return Geometry.isPointInCircle(checkedCircleCenter, circleCenter, circleRadius) && checkedCircleRadius < circleRadius;
    }

}