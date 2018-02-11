//
///<reference path="reference.ts"/>
/**
 * Created by Manuel on 18/01/2015.
 */

class ShaderProgram {

    gl:WebGLRenderingContext;
    vertexShader:WebGLShader;
    fragmentShader:WebGLShader;
    program:WebGLProgram;
    uModelView:WebGLUniformLocation;
    uProjection:WebGLUniformLocation;
    aPosition:number;
    aColor:number;

    constructor(gl:WebGLRenderingContext, vertexShaderCode:string, fragmentShaderCode:string) {

        this.gl = gl;

        this.vertexShader = gl.createShader(gl.VERTEX_SHADER);
        gl.shaderSource(this.vertexShader, vertexShaderCode);
        gl.compileShader(this.vertexShader);

        this.fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
        gl.shaderSource(this.fragmentShader, fragmentShaderCode);
        gl.compileShader(this.fragmentShader);

        this.program = gl.createProgram();

        gl.attachShader(this.program, this.vertexShader);
        gl.attachShader(this.program, this.fragmentShader);

        gl.linkProgram(this.program);

        this.uModelView = gl.getUniformLocation(this.program, 'uModelViewMatrix');
        this.uProjection = gl.getUniformLocation(this.program, 'uProjectionMatrix');
        this.aPosition = gl.getAttribLocation(this.program, 'aPosition');
        this.aColor = gl.getAttribLocation(this.program, 'aColor');
    }

    public setModelViewMatrix(modelViewMatrix:Float32Array) {
        this.gl.uniformMatrix4fv(this.uModelView, false, modelViewMatrix);
    }

    public setProjectionMatrix(projectionMatrix:Float32Array) {
        this.gl.uniformMatrix4fv(this.uProjection, false, projectionMatrix);
    }

    //static initShaders(gl, vshader, fshader):WebGLProgram {
    //    var program = this.createProgram(gl, vshader, fshader);
    //    if (!program) {
    //        console.log('Failed to create program');
    //        return false;
    //    }
    //
    //    gl.useProgram(program);
    //    return program;
    //}
    //
    ///**
    // * Create the linked program object
    // * @param gl GL context
    // * @param vshader a vertex shader program (string)
    // * @param fshader a fragment shader program (string)
    // * @return created program object, or null if the creation has failed
    // */
    //static createProgram(gl, vshader, fshader) {
    //    // Create shader object
    //    var vertexShader = this.loadShader(gl, gl.createShader(type);, vshader);
    //    var fragmentShader = this.loadShader(gl, gl.FRAGMENT_SHADER, fshader);
    //    if (!vertexShader || !fragmentShader) {
    //        return null;
    //    }
    //
    //    // Create a program object
    //    var program = gl.createProgram();
    //    if (!program) {
    //        return null;
    //    }
    //
    //    // Attach the shader objects
    //    gl.attachShader(program, vertexShader);
    //    gl.attachShader(program, fragmentShader);
    //
    //    // Link the program object
    //    gl.linkProgram(program);
    //
    //    // Check the result of linking
    //    var linked = gl.getProgramParameter(program, gl.LINK_STATUS);
    //    if (!linked) {
    //        var error = gl.getProgramInfoLog(program);
    //        console.log('Failed to link program: ' + error);
    //        gl.deleteProgram(program);
    //        gl.deleteShader(fragmentShader);
    //        gl.deleteShader(vertexShader);
    //        return null;
    //    }
    //    return program;
    //}
    //
    ///**
    // * Create a shader object
    // * @param gl GL context
    // * @param type the type of the shader object to be created
    // * @param source shader program (string)
    // * @return created shader object, or null if the creation has failed.
    // */
    //static loadShader(gl, type, source) {
    //    // Create shader object
    //    var shader = gl.createShader(type);
    //    if (shader == null) {
    //        console.log('unable to create shader');
    //        return null;
    //    }
    //
    //    // Set the shader program
    //    gl.shaderSource(shader, source);
    //
    //    // Compile the shader
    //    gl.compileShader(shader);
    //
    //    // Check the result of compilation
    //    var compiled = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    //    if (!compiled) {
    //        var error = gl.getShaderInfoLog(shader);
    //        console.log('Failed to compile shader: ' + error);
    //        gl.deleteShader(shader);
    //        return null;
    //    }
    //
    //    return shader;
    //}
}





