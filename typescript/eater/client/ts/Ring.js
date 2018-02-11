//
///<reference path="reference.ts"/>
/**
 * Created by Manuel on 02/07/2015.
 */
var Ring = /** @class */ (function () {
    function Ring(shaderProgram) {
        this.shaderProgram = shaderProgram;
        // Init rendering data
        this.modelMatrix = mat4.identity(new Float32Array(16));
        this.vertices = new Float32Array([
            1000.0, -1000.0, 0.0,
            1000.0, 1000.0, 0.0,
            -1000.0, 1000.0, 0.0,
            -1000.0, -1000.0, 0.0
        ]);
        this.colors = new Float32Array([
            0.0, 0.0, 0.0, 1.0,
            0.0, 0.0, 0.0, 1.0,
            0.0, 0.0, 0.0, 1.0,
            0.0, 0.0, 0.0, 1.0
        ]);
    }
    /**
     * Move mesh data vertices and colors to GPU memory
     */
    Ring.prototype.toGPU = function () {
        var gl = Ring.gl;
        this.vertexBuffer = gl.createBuffer();
        this.colorBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.vertices, gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.colors, gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
    };
    /**
     * Render this entity
     * TODO: Provide camera object instead of view and projection matrices
     * @param viewMatrix
     * @param projectionMatrix
     */
    Ring.prototype.render = function (viewMatrix, projectionMatrix) {
        var gl = Ring.gl;
        // Activate a concrete shader
        gl.useProgram(this.shaderProgram.program);
        var modelViewMatrix = mat4.identity(new Float32Array(16));
        mat4.multiply(modelViewMatrix, viewMatrix, this.modelMatrix);
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
        gl.drawArrays(gl.LINE_LOOP, 0, this.vertices.length / 3);
    };
    /**
     * Update the entity state following F = ma
     */
    Ring.prototype.update = function (step) {
    };
    Ring.gl = WebGLContext.getInstance().GL;
    return Ring;
}());
