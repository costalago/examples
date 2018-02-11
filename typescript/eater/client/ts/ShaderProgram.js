//
///<reference path="reference.ts"/>
/**
 * Created by Manuel on 18/01/2015.
 */
var ShaderProgram = /** @class */ (function () {
    function ShaderProgram(gl, vertexShaderCode, fragmentShaderCode) {
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
    ShaderProgram.prototype.setModelViewMatrix = function (modelViewMatrix) {
        this.gl.uniformMatrix4fv(this.uModelView, false, modelViewMatrix);
    };
    ShaderProgram.prototype.setProjectionMatrix = function (projectionMatrix) {
        this.gl.uniformMatrix4fv(this.uProjection, false, projectionMatrix);
    };
    return ShaderProgram;
}());
