//
/**
 * Created by Manuel on 12/07/2015.
 */
///<reference path="reference.ts"/>
var WebRTC = /** @class */ (function () {
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
            // Create local peer connection
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
            // Create remote peer connection
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
    // DESCRIPTION AVAILABLE CALLBACKS
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
    // LOCAL PEER EVENTS
    WebRTC.prototype.onLocalIceCandidateAvailable = function (event) {
        this.trace('local ice callback');
        if (event.candidate) {
            this.remotePeerConnection.addIceCandidate(event.candidate);
            this.trace('Local ICE candidate: \n' + event.candidate.candidate);
        }
    };
    // REMOTE PEER EVENTS
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
    // RECEIVE CHANNEL EVENTS
    WebRTC.prototype.onMessage = function (event) {
        this.trace('Received message: ' + event.data);
        this.dataChannelReceive.value = event.data;
    };
    WebRTC.prototype.onReceiveChannelStateChange = function () {
        var readyState = this.receiveChannel.readyState;
        this.trace('Receive channel state is: ' + readyState);
    };
    // SEND CHANNEL EVENTS
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
}());
