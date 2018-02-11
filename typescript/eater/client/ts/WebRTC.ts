//
/**
 * Created by Manuel on 12/07/2015.
 */

///<reference path="reference.ts"/>

declare var RTCPeerConnection:any;

class WebRTC {

    private remotePeerConnection:any;
    private localPeerConnection:any;
    private sendChannel:any;
    private receiveChannel:any;

    private dataChannelSend:any;
    private dataChannelReceive:any;

    private startButton:HTMLInputElement;
    private sendButton:HTMLInputElement;
    private closeButton:HTMLInputElement;

    constructor() {
        this.startButton = <HTMLInputElement>$('#startButton')[0];
        this.sendButton = <HTMLInputElement>$('#sendButton')[0];
        this.closeButton = <HTMLInputElement>$('#closeButton')[0];
        this.startButton.disabled = false;
        this.sendButton.disabled = true;
        this.closeButton.disabled = true;
        this.startButton.onclick = (e) => {this.createConnection();};
        this.sendButton.onclick = (e) => {this.sendData();};
        this.closeButton.onclick = (e) => { this.closeDataChannels();};

        this.dataChannelSend = $('#dataChannelSend')[0];
        this.dataChannelReceive = $('#dataChannelReceive')[0];

    }

    private trace(text:string) {
        console.log((window.performance.now() / 1000).toFixed(3) + ': ' + text);
    }

    private sendData() {
        var data = this.dataChannelSend.value;
        this.sendChannel.send(data);
        this.trace('Sent data: ' + data);
    }

    private closeDataChannels() {
        this.trace('Closing data channels');
        this.sendChannel.close();
        this.trace('Closed data channel with label: ' + this.sendChannel.label);
        this.receiveChannel.close();
        this. trace('Closed data channel with label: ' + this.receiveChannel.label);
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
    }

    private createConnection() {
        try {

            // Create local peer connection
            var servers:any = null;
            this.localPeerConnection = new RTCPeerConnection(servers, {
                optional: [{
                    RtpDataChannels: true
                }]
            });
            this.localPeerConnection.onicecandidate = (param:any) => { this.onLocalIceCandidateAvailable(param); };
            this.trace('Created local peer connection');

            this.sendChannel = this.localPeerConnection.createDataChannel('sendDataChannel', {reliable: false});
            this.sendChannel.onopen = (param:any) => { this.onSendChannelStateChange(); };
            this.sendChannel.onclose = (param:any) => { this.onSendChannelStateChange(); };
            this.trace('Created send data channel');

            // Create remote peer connection
            this.remotePeerConnection = new RTCPeerConnection(
                servers, {
                    optional: [{
                        RtpDataChannels: true
                    }]
                }
            );
            this.remotePeerConnection.onicecandidate = (param:any) => { this.onRemoteIceCandidateAvailable(param); };
            this.remotePeerConnection.ondatachannel = (param:any) => { this.onReceiveChannelAvailable(param); };
            this.trace('Created remote peer connection');

            this.localPeerConnection.createOffer((param:any) => {this.onLocalDescriptionAvailable(param); });
        } catch (e) {
            this.trace('Failed to stablish connection: ' + e.message);
        }

    }


    // DESCRIPTION AVAILABLE CALLBACKS
    private onLocalDescriptionAvailable(desc:any) {
        this.localPeerConnection.setLocalDescription(desc);
        this.trace('Offer from localPeerConnection \n' + desc.sdp);
        this.remotePeerConnection.setRemoteDescription(desc);
        this.remotePeerConnection.createAnswer((param:any) => {this.onRemoteDescriptionAvailable(param); });
    }
    private onRemoteDescriptionAvailable(desc:any) {
        this.remotePeerConnection.setLocalDescription(desc);
        this.trace('Answer from remotePeerConnection \n' + desc.sdp);
        this.localPeerConnection.setRemoteDescription(desc);
    }




    // LOCAL PEER EVENTS
    private onLocalIceCandidateAvailable(event:any) {
        this.trace('local ice callback');
        if (event.candidate) {
            this.remotePeerConnection.addIceCandidate(event.candidate);
            this.trace('Local ICE candidate: \n' + event.candidate.candidate);
        }
    }



    // REMOTE PEER EVENTS
    private onRemoteIceCandidateAvailable(event:any) {
        this.trace('remote ice callback');
        if (event.candidate) {
            this.remotePeerConnection.addIceCandidate(event.candidate);
            this. trace('Remote ICE candidate: \n ' + event.candidate.candidate);
        }
    }
    private onReceiveChannelAvailable(event:any) {
        this.trace('Receive Channel Callback');
        this.receiveChannel = event.channel;
        this.receiveChannel.onmessage = (param:any) => { this.onMessage(param); };
        this.receiveChannel.onopen = (param:any) => { this.onReceiveChannelStateChange(); };
        this.receiveChannel.onclose = (param:any) => { this.onReceiveChannelStateChange(); };
    }




    // RECEIVE CHANNEL EVENTS
    private onMessage(event:any) {
        this.trace('Received message: ' + event.data);
        this.dataChannelReceive.value = event.data;
    }

    private onReceiveChannelStateChange() {
        var readyState = this.receiveChannel.readyState;
        this.trace('Receive channel state is: ' + readyState);
    }




    // SEND CHANNEL EVENTS
    private onSendChannelStateChange() {
        var readyState = this.sendChannel.readyState;
        this.trace('Send channel state is: ' + readyState);
        if (readyState === 'open') {
            this.dataChannelSend.disabled = false;
            this.dataChannelSend.focus();
            this.dataChannelSend.placeholder = '';
            this.sendButton.disabled = false;
            this.closeButton.disabled = false;
        } else {
            this. dataChannelSend.disabled = true;
            this.sendButton.disabled = true;
            this.closeButton.disabled = true;
        }
    }


}
