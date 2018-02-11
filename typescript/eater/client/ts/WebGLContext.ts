//
///<reference path="reference.ts"/>
/**
 * Created by Manuel on 02/07/2015.
 */

/**
 * Singleton WebGL context
 */
class WebGLContext {

    public GL:WebGLRenderingContext;

    private static _instance:WebGLContext = new WebGLContext();

    constructor() {
        if(WebGLContext._instance){
            throw new Error("Error: Instantiation failed: Use WebGLContext.getInstance() instead of new.");
        }
        WebGLContext._instance = this;
        this.GL = <WebGLRenderingContext>(<HTMLCanvasElement>$("#webgl")[0]).getContext("webgl");
    }

    public static getInstance():WebGLContext
    {
        return WebGLContext._instance;
    }

}