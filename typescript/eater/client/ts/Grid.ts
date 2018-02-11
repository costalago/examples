//
///<reference path="reference.ts"/>

/**
 * Created by Manuel on 02/07/2015.
 */

class Grid {

    static gl:WebGLRenderingContext = WebGLContext.getInstance().GL;

    // Rendering data
    private shaderProgram:ShaderProgram;
    private vertexBuffer:WebGLBuffer;
    private colorBuffer:WebGLBuffer;
    private indicesBuffer:WebGLBuffer;
    private vertices:Float32Array;
    private colors:Float32Array;
    private indices:Uint16Array;
    private modelMatrix:Float32Array;

    private color:number[];
    public width:number;

    constructor(shaderProgram:ShaderProgram, color:[number, number, number], width:number) {
        this.shaderProgram = shaderProgram;
        this.width = width;

        // Init rendering data
        this.modelMatrix = mat4.identity(new Float32Array(16));

        var vertices:number[];
        var colors:number[];
        var indices:number[];
        [vertices, colors, indices] = this.createGeometry(width, color);
        this.vertices = new Float32Array(vertices);
        this.colors = new Float32Array(colors);
        this.indices = new Uint16Array(indices);

    }

    private createGeometry(width:number, color:[number, number, number]) : [number[], number[], number[]] {

        var vertices:number[] = [];
        var colors:number[] = [];
        var indices:number[] = [];

        // Horizontal lines
        var iRow:number;
        for(iRow = 0; iRow < width+1; iRow ++) {
            vertices[iRow*2*3] = 0;
            vertices[iRow*2*3 + 1] = iRow;
            vertices[iRow*2*3 + 2] = 0;
            colors[iRow*2*4] = color[0];
            colors[iRow*2*4+1] = color[1];
            colors[iRow*2*4+2] = color[2];
            colors[iRow*2*4+3] = 1.0;

            vertices[iRow*2*3 + 3] = width;
            vertices[iRow*2*3 + 4] = iRow;
            vertices[iRow*2*3 + 5] = 0;
            colors[iRow*2*4+4] = color[0];
            colors[iRow*2*4+5] = color[1];
            colors[iRow*2*4+6] = color[2];
            colors[iRow*2*4+7] = 1.0;
        }

        // Vertical lines
        for(var iCol=0; iCol < width+1; iCol ++) {
            vertices[(iRow + iCol)*2*3] = iCol;
            vertices[(iRow + iCol)*2*3 + 1] = 0;
            vertices[(iRow + iCol)*2*3 + 2] = 0;
            colors[(iRow + iCol)*2*4] = color[0];
            colors[(iRow + iCol)*2*4+1] = color[1];
            colors[(iRow + iCol)*2*4+2] = color[2];
            colors[(iRow + iCol)*2*4+3] = 1.0;

            vertices[(iRow + iCol)*2*3 + 3] = iCol;
            vertices[(iRow + iCol)*2*3 + 4] = width;
            vertices[(iRow + iCol)*2*3 + 5] = 0;
            colors[(iRow + iCol)*2*4+4] = color[0];
            colors[(iRow + iCol)*2*4+5] = color[1];
            colors[(iRow + iCol)*2*4+6] = color[2];
            colors[(iRow + iCol)*2*4+7] = 1.0;
        }

        // Indices
        for(var i=0; i < vertices.length / 3; i++) {
            indices[i] = i;
        }

        return [vertices, colors, indices];
    }

    /**
     * Move mesh data vertices and colors to GPU memory
     */
    public toGPU() {
        var gl:WebGLRenderingContext = Grid.gl;

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
    }

    /**
     * Render this entity
     * TODO: Provide camera object instead of view and projection matrices
     * @param viewMatrix
     * @param projectionMatrix
     */
    public render(viewMatrix:Float32Array, projectionMatrix:Float32Array) {

        var gl:WebGLRenderingContext = Grid.gl;

        // Activate a concrete shader
        gl.useProgram(this.shaderProgram.program);
        var modelViewMatrix:Float32Array = mat4.identity(new Float32Array(16));
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
    }

    /**
     * Update the entity state following F = ma
     */
    public update(step:number) {

    }

}
