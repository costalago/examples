//
///<reference path="reference.ts"/>

/**
 * Created by Manuel on 02/07/2015.
 */

class Ball {

    private static FACES:number = 75;

    static gl:WebGLRenderingContext = WebGLContext.getInstance().GL;

    // Rendering data
    private shaderProgram:ShaderProgram;
    private vertexBuffer:WebGLBuffer;
    private colorBuffer:WebGLBuffer;
    private vertices:Float32Array;
    private colors:Float32Array;
    public modelMatrix:Float32Array;

    // State
    public position:number[]; // m
    public radius:number; // m

    constructor(shaderProgram:ShaderProgram,
                color:[number, number, number],
                radius:number,
                position:[number, number, number]) {
        this.shaderProgram = shaderProgram;

        this.radius = radius;

        // Init rendering data
        this.modelMatrix = mat4.identity(new Float32Array(16));
        this.vertices = new Float32Array([]);
        this.colors = new Float32Array([]);

        var vertnums:number[];
        var colornums:number[];
        [vertnums, colornums] = Geometry.createCircle(Ball.FACES, color);
        this.vertices = new Float32Array(vertnums);
        this.colors = new Float32Array(colornums);

        mat4.translate(this.modelMatrix, this.modelMatrix, new Float32Array(position));

        // Init state
        this.position = position;
    }

    /**
     * Move mesh data vertices and colors to GPU memory
     */
    public toGPU() {
        var gl:WebGLRenderingContext = Ball.gl;

        this.vertexBuffer = gl.createBuffer();
        this.colorBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.vertices, gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.colors, gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
    }

    public updateMatrices() {
        this.modelMatrix = mat4.identity(new Float32Array(16));
        mat4.translate(this.modelMatrix, this.modelMatrix, new Float32Array(this.position));
        mat4.scale(this.modelMatrix, this.modelMatrix, new Float32Array([this.radius, this.radius, 1]));
    }

    /**
     * Render this entity
     * TODO: Provide camera object instead of view and projection matrices
     * @param viewMatrix
     * @param projectionMatrix
     */
    public render(viewMatrix:Float32Array, projectionMatrix:Float32Array) {

        this.updateMatrices();

        var gl:WebGLRenderingContext = Ball.gl;

        // Activate a concrete shader
        gl.useProgram(this.shaderProgram.program);
        var modelViewMatrix:Float32Array = mat4.identity(new Float32Array(16));
        mat4.multiply(modelViewMatrix, viewMatrix, this.modelMatrix)
        this.shaderProgram.setModelViewMatrix(modelViewMatrix);
        this.shaderProgram.setProjectionMatrix(projectionMatrix);
        gl.enableVertexAttribArray(this.shaderProgram.aPosition);
        gl.enableVertexAttribArray(this.shaderProgram.aColor);

        // Draw VBO's
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.vertexAttribPointer(this.shaderProgram.aPosition, 3, gl.FLOAT, false, 0, 0);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuffer);
        gl.vertexAttribPointer(this.shaderProgram.aColor, 4, gl.FLOAT, false, 0, 0);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        gl.drawArrays(gl.TRIANGLE_FAN, 0, this.vertices.length / 3);
    }

}