//
///<reference path="reference.ts"/>
/**
 * Created by Manuel on 02/07/2015.
 */
var Grid = /** @class */ (function () {
    function Grid(shaderProgram, color, width) {
        this.shaderProgram = shaderProgram;
        this.width = width;
        // Init rendering data
        this.modelMatrix = mat4.identity(new Float32Array(16));
        var vertices;
        var colors;
        var indices;
        _a = this.createGeometry(width, color), vertices = _a[0], colors = _a[1], indices = _a[2];
        this.vertices = new Float32Array(vertices);
        this.colors = new Float32Array(colors);
        this.indices = new Uint16Array(indices);
        var _a;
    }
    Grid.prototype.createGeometry = function (width, color) {
        var vertices = [];
        var colors = [];
        var indices = [];
        // Horizontal lines
        var iRow;
        for (iRow = 0; iRow < width + 1; iRow++) {
            vertices[iRow * 2 * 3] = 0;
            vertices[iRow * 2 * 3 + 1] = iRow;
            vertices[iRow * 2 * 3 + 2] = 0;
            colors[iRow * 2 * 4] = color[0];
            colors[iRow * 2 * 4 + 1] = color[1];
            colors[iRow * 2 * 4 + 2] = color[2];
            colors[iRow * 2 * 4 + 3] = 1.0;
            vertices[iRow * 2 * 3 + 3] = width;
            vertices[iRow * 2 * 3 + 4] = iRow;
            vertices[iRow * 2 * 3 + 5] = 0;
            colors[iRow * 2 * 4 + 4] = color[0];
            colors[iRow * 2 * 4 + 5] = color[1];
            colors[iRow * 2 * 4 + 6] = color[2];
            colors[iRow * 2 * 4 + 7] = 1.0;
        }
        // Vertical lines
        for (var iCol = 0; iCol < width + 1; iCol++) {
            vertices[(iRow + iCol) * 2 * 3] = iCol;
            vertices[(iRow + iCol) * 2 * 3 + 1] = 0;
            vertices[(iRow + iCol) * 2 * 3 + 2] = 0;
            colors[(iRow + iCol) * 2 * 4] = color[0];
            colors[(iRow + iCol) * 2 * 4 + 1] = color[1];
            colors[(iRow + iCol) * 2 * 4 + 2] = color[2];
            colors[(iRow + iCol) * 2 * 4 + 3] = 1.0;
            vertices[(iRow + iCol) * 2 * 3 + 3] = iCol;
            vertices[(iRow + iCol) * 2 * 3 + 4] = width;
            vertices[(iRow + iCol) * 2 * 3 + 5] = 0;
            colors[(iRow + iCol) * 2 * 4 + 4] = color[0];
            colors[(iRow + iCol) * 2 * 4 + 5] = color[1];
            colors[(iRow + iCol) * 2 * 4 + 6] = color[2];
            colors[(iRow + iCol) * 2 * 4 + 7] = 1.0;
        }
        // Indices
        for (var i = 0; i < vertices.length / 3; i++) {
            indices[i] = i;
        }
        return [vertices, colors, indices];
    };
    /**
     * Move mesh data vertices and colors to GPU memory
     */
    Grid.prototype.toGPU = function () {
        var gl = Grid.gl;
        this.vertexBuffer = gl.createBuffer();
        this.colorBuffer = gl.createBuffer();
        this.indicesBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.vertices, gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.colors, gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indicesBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.indices, gl.STATIC_DRAW);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
    };
    /**
     * Render this entity
     * TODO: Provide camera object instead of view and projection matrices
     * @param viewMatrix
     * @param projectionMatrix
     */
    Grid.prototype.render = function (viewMatrix, projectionMatrix) {
        var gl = Grid.gl;
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
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indicesBuffer);
        gl.drawElements(gl.LINES, this.indices.length, gl.UNSIGNED_SHORT, 0);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
    };
    /**
     * Update the entity state following F = ma
     */
    Grid.prototype.update = function (step) {
    };
    Grid.gl = WebGLContext.getInstance().GL;
    return Grid;
}());
