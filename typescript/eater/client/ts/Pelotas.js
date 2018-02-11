//
/**
 * Created by Manuel on 12/06/2015.
 */
///<reference path="reference.ts"/>
var Pelotas = /** @class */ (function () {
    function Pelotas(onPosChange) {
        // Camera stuff
        this.viewMatrix = mat4.identity(new Float32Array(16));
        this.projectionMatrix = mat4.perspective(new Float32Array(16), 45.0, $(window).width() / $(window).height(), 1, 0);
        this.campos = [0, 0, 0];
        this.onPosChange = onPosChange;
    }
    Pelotas.prototype.run = function () {
        var _this = this;
        var gl = Pelotas.gl;
        // Set up shader program
        this.shaderProgram = new ShaderProgram(gl, $('#vertex-shader')[0].innerText, $('#fragment-shader')[0].innerText);
        // Initialize meshes
        this.meshes = {};
        this.ring = new Ring(this.shaderProgram);
        this.ring.toGPU();
        this.grid = new Grid(this.shaderProgram, [0.7, 0.7, 0.7], 200);
        this.grid.toGPU();
        // Initialize camera
        this.campos = [0, 0, 100];
        // Main loop
        setInterval(function () {
            _this.mainLoop();
        }, 16.6);
        // Set up controls
        $('body').bind('mousewheel', function (event) {
            _this.campos[2] += event.originalEvent.wheelDelta / 5;
        });
        document.addEventListener('touchstart', function (event) {
            _this.inputxy(event.touches[0].pageX, event.touches[0].pageY);
        }, false);
        $(document).mousemove(function (event) {
            _this.inputxy(event.pageX, event.pageY);
        });
        window.addEventListener('keydown', function (event) {
            switch (event.keyCode) {
                case 37:// Left
                    break;
                case 38:// Up
                    break;
                case 39:// Right
                    break;
                case 40:// Down
                    break;
                case 65:// Zoom-in
                    _this.campos[2] -= 0.1;
                    break;
                case 90:// Zoom-out
                    _this.campos[2] += 0.1;
                    break;
                case 32:// Spacebar
                    break;
            }
        }, false);
    };
    Pelotas.prototype.inputxy = function (x, y) {
        var windowCenter = [$(window).width() / 2, $(window).height() / 2];
        var mousePos = [x, y];
        var difference = [mousePos[0] - windowCenter[0], mousePos[1] - windowCenter[1]];
        var lenght = Math.sqrt(difference[0] * difference[0] + difference[1] * difference[1]);
        var normalized = [difference[0] / lenght, difference[1] / lenght];
        var corrected = [normalized[0], normalized[1] * -1];
        this.onPosChange(this.userId, corrected);
    };
    Pelotas.prototype.mainLoop = function () {
        // Adapt the canvas to the window size
        this.resize();
        // Update camera
        if (this.meshes[this.userId] == undefined) {
            this.campos[0] = 0;
            this.campos[1] = 0;
        }
        else {
            this.campos[0] = this.meshes[this.userId].position[0];
            this.campos[1] = this.meshes[this.userId].position[1];
        }
        this.viewMatrix = mat4.identity(this.viewMatrix);
        mat4.translate(this.viewMatrix, this.viewMatrix, new Float32Array([-this.campos[0], -this.campos[1], -this.campos[2]]));
        // Render all entities
        this.render();
    };
    /**
     * Render all entities
     */
    Pelotas.prototype.render = function () {
        var gl = Pelotas.gl;
        gl.clearColor(1.0, 1.0, 1.0, 1.0);
        gl.enable(gl.DEPTH_TEST);
        gl.enable(gl.CULL_FACE);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        // Extract all balls and put them into a list, then reorder them by size before rendering
        // TODO: ordenar mas rapidamente
        var meshList = [];
        for (var meshId in this.meshes) {
            if (this.meshes.hasOwnProperty(meshId)) {
                meshList.push(this.meshes[meshId]);
            }
        }
        meshList.sort(function (a, b) {
            if (a.radius == b.radius) {
                return 0;
            }
            else if (a.radius > b.radius) {
                return -1;
            }
            else {
                return 1;
            }
        });
        for (var i = 0; i < meshList.length; i++) {
            meshList[i].render(this.viewMatrix, this.projectionMatrix);
        }
        // Render outer square
        this.ring.render(this.viewMatrix, this.projectionMatrix);
        // Render grid
        var transform = mat4.identity(new Float32Array(16));
        mat4.scale(transform, this.viewMatrix, new Float32Array([10, 10, 0]));
        mat4.translate(transform, transform, new Float32Array([-(this.grid.width / 2), -(this.grid.width / 2), 0]));
        this.grid.render(transform, this.projectionMatrix);
    };
    /**
     * http://webglfundamentals.org/webgl/lessons/webgl-resizing-the-canvas.html
     */
    Pelotas.prototype.resize = function () {
        // Lookup the size the browser is displaying the canvas.
        var canvas = document.getElementById("webgl");
        var displayWidth = canvas.clientWidth;
        var displayHeight = canvas.clientHeight;
        // Check if the canvas is not the same size.
        if (canvas.width != displayWidth ||
            canvas.height != displayHeight) {
            // Make the canvas the same size
            canvas.width = displayWidth;
            canvas.height = displayHeight;
            Pelotas.gl.viewport(0, 0, canvas.width, canvas.height);
        }
    };
    Pelotas.prototype.createBall = function (id, color, position, radius) {
        var ball = new Ball(this.shaderProgram, color, radius, [position[0], position[1], 0]);
        ball.toGPU();
        this.meshes[id] = ball;
    };
    Pelotas.prototype.updateBallPos = function (id, position) {
        this.meshes[id].position = [position[0], position[1], 0];
    };
    Pelotas.prototype.followBall = function (userId) {
        this.userId = userId;
    };
    Pelotas.prototype.deleteBall = function (id) {
        delete this.meshes[id];
    };
    Pelotas.prototype.updateBall = function (ball) {
        //(600/ (1+ e^(-x*0.007)))-300+100
        //((MaxZ*2)/ (1+ e^(-x*0.007)))-MaxZ+StartZ
        if (ball.i == this.userId) {
            this.campos[2] += 10;
        }
        if (this.meshes[ball.i] != undefined) {
            this.meshes[ball.i].radius = ball.r;
        }
    };
    Pelotas.gl = WebGLContext.getInstance().GL;
    return Pelotas;
}());
