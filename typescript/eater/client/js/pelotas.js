//
///<reference path="reference.ts"/>
/**
 * Created by Manuel on 02/07/2015.
 */
var WebGLContext = (function () {
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
})();
//
///<reference path="reference.ts"/>
var Ball = (function () {
    function Ball(shaderProgram, color, radius, position) {
        this.shaderProgram = shaderProgram;
        this.radius = radius;
        this.modelMatrix = mat4.identity(new Float32Array(16));
        this.vertices = new Float32Array([]);
        this.colors = new Float32Array([]);
        var vertnums;
        var colornums;
        _a = Geometry.createCircle(Ball.FACES, color), vertnums = _a[0], colornums = _a[1];
        this.vertices = new Float32Array(vertnums);
        this.colors = new Float32Array(colornums);
        mat4.translate(this.modelMatrix, this.modelMatrix, new Float32Array(position));
        this.position = position;
        var _a;
    }
    Ball.prototype.toGPU = function () {
        var gl = Ball.gl;
        this.vertexBuffer = gl.createBuffer();
        this.colorBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.vertices, gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.colors, gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
    };
    Ball.prototype.updateMatrices = function () {
        this.modelMatrix = mat4.identity(new Float32Array(16));
        mat4.translate(this.modelMatrix, this.modelMatrix, new Float32Array(this.position));
        mat4.scale(this.modelMatrix, this.modelMatrix, new Float32Array([this.radius, this.radius, 1]));
    };
    Ball.prototype.render = function (viewMatrix, projectionMatrix) {
        this.updateMatrices();
        var gl = Ball.gl;
        gl.useProgram(this.shaderProgram.program);
        var modelViewMatrix = mat4.identity(new Float32Array(16));
        mat4.multiply(modelViewMatrix, viewMatrix, this.modelMatrix);
        this.shaderProgram.setModelViewMatrix(modelViewMatrix);
        this.shaderProgram.setProjectionMatrix(projectionMatrix);
        gl.enableVertexAttribArray(this.shaderProgram.aPosition);
        gl.enableVertexAttribArray(this.shaderProgram.aColor);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.vertexAttribPointer(this.shaderProgram.aPosition, 3, gl.FLOAT, false, 0, 0);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuffer);
        gl.vertexAttribPointer(this.shaderProgram.aColor, 4, gl.FLOAT, false, 0, 0);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        gl.drawArrays(gl.TRIANGLE_FAN, 0, this.vertices.length / 3);
    };
    Ball.FACES = 75;
    Ball.gl = WebGLContext.getInstance().GL;
    return Ball;
})();
///<reference path="reference.ts"/>
var Geometry = (function () {
    function Geometry() {
    }
    Geometry.createCircle = function (nverts, color) {
        var radius = 1;
        var vertices = [];
        var colors = [];
        var step = 360.0 / nverts;
        var angle = 0.0;
        for (var i = 0; i < nverts; i++) {
            vertices[i * 3] = radius * Math.cos(angle * Math.PI / 180);
            vertices[i * 3 + 1] = radius * Math.sin(angle * Math.PI / 180);
            vertices[i * 3 + 2] = 0.0;
            colors[i * 4] = color[0];
            colors[i * 4 + 1] = color[1];
            colors[i * 4 + 2] = color[2];
            colors[i * 4 + 3] = 1.0;
            angle += step;
        }
        return [vertices, colors];
    };
    Geometry.isPointInCircle = function (checkedPoint, circleCenter, circleRadius) {
        return ((checkedPoint[0] - circleCenter[0]) * (checkedPoint[0] - circleCenter[0])) +
            ((checkedPoint[1] - circleCenter[1]) * (checkedPoint[1] - circleCenter[1])) <= (circleRadius * circleRadius);
    };
    Geometry.isCircleInCircle = function (checkedCircleCenter, checkedCircleRadius, circleCenter, circleRadius) {
        return Geometry.isPointInCircle(checkedCircleCenter, circleCenter, circleRadius) && checkedCircleRadius < circleRadius;
    };
    return Geometry;
})();
//
///<reference path="reference.ts"/>
var Grid = (function () {
    function Grid(shaderProgram, color, width) {
        this.shaderProgram = shaderProgram;
        this.width = width;
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
        for (var i = 0; i < vertices.length / 3; i++) {
            indices[i] = i;
        }
        return [vertices, colors, indices];
    };
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
    Grid.prototype.render = function (viewMatrix, projectionMatrix) {
        var gl = Grid.gl;
        gl.useProgram(this.shaderProgram.program);
        var modelViewMatrix = mat4.identity(new Float32Array(16));
        mat4.multiply(modelViewMatrix, viewMatrix, this.modelMatrix);
        this.shaderProgram.setModelViewMatrix(modelViewMatrix);
        this.shaderProgram.setProjectionMatrix(projectionMatrix);
        gl.enableVertexAttribArray(this.shaderProgram.aPosition);
        gl.enableVertexAttribArray(this.shaderProgram.aColor);
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
    Grid.prototype.update = function (step) {
    };
    Grid.gl = WebGLContext.getInstance().GL;
    return Grid;
})();
//
///<reference path="reference.ts"/>
var Ring = (function () {
    function Ring(shaderProgram) {
        this.shaderProgram = shaderProgram;
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
    Ring.prototype.render = function (viewMatrix, projectionMatrix) {
        var gl = Ring.gl;
        gl.useProgram(this.shaderProgram.program);
        var modelViewMatrix = mat4.identity(new Float32Array(16));
        mat4.multiply(modelViewMatrix, viewMatrix, this.modelMatrix);
        this.shaderProgram.setModelViewMatrix(modelViewMatrix);
        this.shaderProgram.setProjectionMatrix(projectionMatrix);
        gl.enableVertexAttribArray(this.shaderProgram.aPosition);
        gl.enableVertexAttribArray(this.shaderProgram.aColor);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.vertexAttribPointer(this.shaderProgram.aPosition, 3, gl.FLOAT, false, 0, 0);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuffer);
        gl.vertexAttribPointer(this.shaderProgram.aColor, 4, gl.FLOAT, false, 0, 0);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        gl.drawArrays(gl.LINE_LOOP, 0, this.vertices.length / 3);
    };
    Ring.prototype.update = function (step) {
    };
    Ring.gl = WebGLContext.getInstance().GL;
    return Ring;
})();
//
/**
 * Created by Manuel on 12/07/2015.
 */
///<reference path="reference.ts"/>
var WebRTC = (function () {
    function WebRTC() {
        var _this = this;
        this.startButton = $('#startButton')[0];
        this.sendButton = $('#sendButton')[0];
        this.closeButton = $('#closeButton')[0];
        this.startButton.disabled = false;
        this.sendButton.disabled = true;
        this.closeButton.disabled = true;
        this.startButton.onclick = function (e) { _this.createConnection(); };
        this.sendButton.onclick = function (e) { _this.sendData(); };
        this.closeButton.onclick = function (e) { _this.closeDataChannels(); };
        this.dataChannelSend = $('#dataChannelSend')[0];
        this.dataChannelReceive = $('#dataChannelReceive')[0];
    }
    WebRTC.prototype.trace = function (text) {
        console.log((window.performance.now() / 1000).toFixed(3) + ': ' + text);
    };
    WebRTC.prototype.sendData = function () {
        var data = this.dataChannelSend.value;
        this.sendChannel.send(data);
        this.trace('Sent data: ' + data);
    };
    WebRTC.prototype.closeDataChannels = function () {
        this.trace('Closing data channels');
        this.sendChannel.close();
        this.trace('Closed data channel with label: ' + this.sendChannel.label);
        this.receiveChannel.close();
        this.trace('Closed data channel with label: ' + this.receiveChannel.label);
        this.localPeerConnection.close();
        this.remotePeerConnection.close();
        this.localPeerConnection = null;
        this.remotePeerConnection = null;
        this.trace('Closed peer connections');
        this.startButton.disabled = false;
        this.sendButton.disabled = true;
        this.closeButton.disabled = true;
        this.dataChannelSend.value = '';
        this.dataChannelReceive.value = '';
        this.dataChannelSend.disabled = true;
        this.dataChannelSend.placeholder =
            'Press Start, enter some text, then press Send.';
    };
    WebRTC.prototype.createConnection = function () {
        var _this = this;
        try {
            var servers = null;
            this.localPeerConnection = new RTCPeerConnection(servers, {
                optional: [{
                        RtpDataChannels: true
                    }]
            });
            this.localPeerConnection.onicecandidate = function (param) { _this.onLocalIceCandidateAvailable(param); };
            this.trace('Created local peer connection');
            this.sendChannel = this.localPeerConnection.createDataChannel('sendDataChannel', { reliable: false });
            this.sendChannel.onopen = function (param) { _this.onSendChannelStateChange(); };
            this.sendChannel.onclose = function (param) { _this.onSendChannelStateChange(); };
            this.trace('Created send data channel');
            this.remotePeerConnection = new RTCPeerConnection(servers, {
                optional: [{
                        RtpDataChannels: true
                    }]
            });
            this.remotePeerConnection.onicecandidate = function (param) { _this.onRemoteIceCandidateAvailable(param); };
            this.remotePeerConnection.ondatachannel = function (param) { _this.onReceiveChannelAvailable(param); };
            this.trace('Created remote peer connection');
            this.localPeerConnection.createOffer(function (param) { _this.onLocalDescriptionAvailable(param); });
        }
        catch (e) {
            this.trace('Failed to stablish connection: ' + e.message);
        }
    };
    WebRTC.prototype.onLocalDescriptionAvailable = function (desc) {
        var _this = this;
        this.localPeerConnection.setLocalDescription(desc);
        this.trace('Offer from localPeerConnection \n' + desc.sdp);
        this.remotePeerConnection.setRemoteDescription(desc);
        this.remotePeerConnection.createAnswer(function (param) { _this.onRemoteDescriptionAvailable(param); });
    };
    WebRTC.prototype.onRemoteDescriptionAvailable = function (desc) {
        this.remotePeerConnection.setLocalDescription(desc);
        this.trace('Answer from remotePeerConnection \n' + desc.sdp);
        this.localPeerConnection.setRemoteDescription(desc);
    };
    WebRTC.prototype.onLocalIceCandidateAvailable = function (event) {
        this.trace('local ice callback');
        if (event.candidate) {
            this.remotePeerConnection.addIceCandidate(event.candidate);
            this.trace('Local ICE candidate: \n' + event.candidate.candidate);
        }
    };
    WebRTC.prototype.onRemoteIceCandidateAvailable = function (event) {
        this.trace('remote ice callback');
        if (event.candidate) {
            this.remotePeerConnection.addIceCandidate(event.candidate);
            this.trace('Remote ICE candidate: \n ' + event.candidate.candidate);
        }
    };
    WebRTC.prototype.onReceiveChannelAvailable = function (event) {
        var _this = this;
        this.trace('Receive Channel Callback');
        this.receiveChannel = event.channel;
        this.receiveChannel.onmessage = function (param) { _this.onMessage(param); };
        this.receiveChannel.onopen = function (param) { _this.onReceiveChannelStateChange(); };
        this.receiveChannel.onclose = function (param) { _this.onReceiveChannelStateChange(); };
    };
    WebRTC.prototype.onMessage = function (event) {
        this.trace('Received message: ' + event.data);
        this.dataChannelReceive.value = event.data;
    };
    WebRTC.prototype.onReceiveChannelStateChange = function () {
        var readyState = this.receiveChannel.readyState;
        this.trace('Receive channel state is: ' + readyState);
    };
    WebRTC.prototype.onSendChannelStateChange = function () {
        var readyState = this.sendChannel.readyState;
        this.trace('Send channel state is: ' + readyState);
        if (readyState === 'open') {
            this.dataChannelSend.disabled = false;
            this.dataChannelSend.focus();
            this.dataChannelSend.placeholder = '';
            this.sendButton.disabled = false;
            this.closeButton.disabled = false;
        }
        else {
            this.dataChannelSend.disabled = true;
            this.sendButton.disabled = true;
            this.closeButton.disabled = true;
        }
    };
    return WebRTC;
})();
//
///<reference path="reference.ts"/>
/**
 * Created by Manuel on 18/01/2015.
 */
var ShaderProgram = (function () {
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
})();
//
/**
 * Created by Manuel on 12/06/2015.
 */
///<reference path="reference.ts"/>
var Pelotas = (function () {
    function Pelotas(onPosChange) {
        this.viewMatrix = mat4.identity(new Float32Array(16));
        this.projectionMatrix = mat4.perspective(new Float32Array(16), 45.0, $(window).width() / $(window).height(), 1, 0);
        this.campos = [0, 0, 0];
        this.onPosChange = onPosChange;
    }
    Pelotas.prototype.run = function () {
        var _this = this;
        var gl = Pelotas.gl;
        this.shaderProgram = new ShaderProgram(gl, $('#vertex-shader')[0].innerText, $('#fragment-shader')[0].innerText);
        this.meshes = {};
        this.ring = new Ring(this.shaderProgram);
        this.ring.toGPU();
        this.grid = new Grid(this.shaderProgram, [0.7, 0.7, 0.7], 200);
        this.grid.toGPU();
        this.campos = [0, 0, 100];
        setInterval(function () {
            _this.mainLoop();
        }, 16.6);
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
                case 37:
                    break;
                case 38:
                    break;
                case 39:
                    break;
                case 40:
                    break;
                case 65:
                    _this.campos[2] -= 0.1;
                    break;
                case 90:
                    _this.campos[2] += 0.1;
                    break;
                case 32:
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
        this.resize();
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
        this.render();
    };
    Pelotas.prototype.render = function () {
        var gl = Pelotas.gl;
        gl.clearColor(1.0, 1.0, 1.0, 1.0);
        gl.enable(gl.DEPTH_TEST);
        gl.enable(gl.CULL_FACE);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
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
        this.ring.render(this.viewMatrix, this.projectionMatrix);
        var transform = mat4.identity(new Float32Array(16));
        mat4.scale(transform, this.viewMatrix, new Float32Array([10, 10, 0]));
        mat4.translate(transform, transform, new Float32Array([-(this.grid.width / 2), -(this.grid.width / 2), 0]));
        this.grid.render(transform, this.projectionMatrix);
    };
    Pelotas.prototype.resize = function () {
        var canvas = document.getElementById("webgl");
        var displayWidth = canvas.clientWidth;
        var displayHeight = canvas.clientHeight;
        if (canvas.width != displayWidth ||
            canvas.height != displayHeight) {
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
        if (ball.i == this.userId) {
            this.campos[2] += 10;
        }
        if (this.meshes[ball.i] != undefined) {
            this.meshes[ball.i].radius = ball.r;
        }
    };
    Pelotas.gl = WebGLContext.getInstance().GL;
    return Pelotas;
})();
//
///<reference path="reference.ts"/>
var socket = io.connect('localhost:3000');
var userId;
socket.on('connection', function (socket) {
    console.log('[*] conectado con exito');
});
socket.on('id', function (id) {
    userId = id.id;
    console.log("[*] following ball with id " + id.id);
    app.followBall(id.id);
});
socket.on('snapshot', function (snapshot) {
    console.log('[*] snapshot received');
    for (var i = 0; i < snapshot.length; i++) {
        app.createBall(snapshot[i].i, snapshot[i].c, snapshot[i].p, snapshot[i].r);
    }
    console.log(snapshot);
});
socket.on('position', function (position) {
    app.updateBallPos(position.i, position.p);
});
socket.on('create', function (ball) {
    console.log("[*] User with id  " + ball.i + " logged in, creating a new ball");
    app.createBall(ball.i, ball.c, ball.p, ball.r);
});
socket.on('delete', function (ball) {
    console.log("[*] User with id " + ball.i + " disconnected, removing the ball");
    app.deleteBall(ball.i);
});
socket.on('update', function (ball) {
    console.log("[*] " + ball.i + " updated");
    app.updateBall(ball);
});
var app = new Pelotas(function (userId, pos) {
    socket.emit('position', { i: userId, p: pos });
});
app.run();
///<reference path="../bower_components/gl-matrix.d.ts/gl-matrix.d.ts"/>
/// <reference path="WebGLContext.ts" />
/// <reference path="Ball.ts" />
/// <reference path="Geometry.ts" />
/// <reference path="Grid.ts" />
/// <reference path="Ring.ts" />
/// <reference path="WebRTC.ts" />
/// <reference path="typings/jquery/jquery.d.ts" />
/// <reference path="typings/socket.io-client/socket.io-client.d.ts" />
/// <reference path="typings/tsd.d.ts" />
/// <reference path="ShaderProgram.ts" />
/// <reference path="Pelotas.ts" />
/// <reference path="Main.ts" /> 
//# sourceMappingURL=pelotas.js.map