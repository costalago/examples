//
///<reference path="reference.ts"/>
/**
 * Created by Manuel on 02/07/2015.
 */
/**
 * Singleton WebGL context
 */
var WebGLContext = /** @class */ (function () {
    function WebGLContext() {
        if (WebGLContext._instance) {
            throw new Error("Error: Instantiation failed: Use WebGLContext.getInstance() instead of new.");
        }
        WebGLContext._instance = this;
        this.GL = $("#webgl")[0].getContext("webgl");
    }
    WebGLContext.getInstance = function () {
        return WebGLContext._instance;
    };
    WebGLContext._instance = new WebGLContext();
    return WebGLContext;
}());
