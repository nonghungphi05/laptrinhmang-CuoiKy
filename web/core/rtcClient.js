const RTC_CONFIG = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' }
  ]
};

export class RtcClient {
  constructor({ store, wsClient }) {
    this.store = store;
    this.wsClient = wsClient;
    this.peerConnections = new Map();
    this.remoteStreams = new Map();
    this.localStream = null;
    this.roomId = null;
    this.listeners = new Set();
    this.micEnabled = true;
    this.camEnabled = true;
    this.onIncomingCall = null;
    this.onCallEnd = null;
    this.hadRemotePeer = false;
  }
  
  setIncomingCallHandler(handler) {
    this.onIncomingCall = handler;
  }

  setCallEndHandler(handler) {
    this.onCallEnd = handler;
  }

  onUpdate(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  emit() {
    const payload = {
      localStream: this.localStream,
      remoteStreams: Array.from(this.remoteStreams.entries())
    };
    this.listeners.forEach((listener) => listener(payload));
  }

  async start(roomId, isAnswering = false) {
    this.roomId = roomId;
    this.hadRemotePeer = false;
    const stream = await this.ensureLocalStream();
    this.store.setCallState({ activeRoomId: roomId });

     if (!isAnswering) {
      const state = this.store.getState();
      const callerName = state.user?.displayName || state.user?.phone || 'Người dùng';
      this.wsClient.sendRtc({ t: 'rtc-call-start', roomId, callerName });
    }
    
   
    this.wsClient.sendRtc({ t: 'rtc-join', roomId });
    
    return stream;
  }

  async ensureLocalStream() {
    if (!this.localStream) {
      console.log('🎥 Requesting camera and microphone access...');
      try {
        this.localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        console.log('✅ Local stream obtained:', this.localStream.getTracks().map(t => `${t.kind}: ${t.enabled}`));
        this.emit();
      } catch (err) {
        console.error('❌ Failed to get local stream:', err.name, err.message);
        
        // Show user-friendly error message
        if (err.name === 'NotAllowedError') {
          alert('Vui lòng cho phép truy cập camera và microphone để thực hiện cuộc gọi.');
        } else if (err.name === 'NotReadableError') {
          alert('Camera đang được sử dụng bởi ứng dụng khác. Vui lòng đóng các ứng dụng khác và thử lại.');
        } else if (err.name === 'NotFoundError') {
          alert('Không tìm thấy camera hoặc microphone. Vui lòng kiểm tra thiết bị của bạn.');
        } else {
          alert('Không thể truy cập camera/microphone: ' + err.message);
        }
        
        throw err;
      }
    }
    return this.localStream;
  }
  async stop() {
    const currentRoomId = this.roomId;
    const hadPeers = this.hadRemotePeer;
    
    this.peerConnections.forEach((pc) => pc.close());
    this.peerConnections.clear();
    this.remoteStreams.forEach((stream) => stream.getTracks().forEach((track) => track.stop()));
    this.remoteStreams.clear();
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => track.stop());
      this.localStream = null;
    }
    if (currentRoomId) {
      if (!hadPeers) {
        console.log('📵 Cancelling call (no one joined yet)');
        this.wsClient.sendRtc({ t: 'rtc-call-cancel', roomId: currentRoomId });
      } else {
        console.log('👋 Leaving call');
        this.wsClient.sendRtc({ t: 'rtc-leave', roomId: currentRoomId });
      }
    }
    this.store.setCallState({ activeRoomId: null, peers: [] });
    this.emit();
    this.roomId = null;
    this.hadRemotePeer = false;
  }

  handleSignal(event) {
    switch (event.t) {
      case 'rtc-call-incoming':
        if (this.onIncomingCall) {
          this.onIncomingCall(event.roomId, event.from, event.callerName);
        }
        break;
      case 'rtc-call-declined':
        // Handle when someone declines the call
        if (this.roomId === event.roomId) {
          console.log('Call declined by user:', event.userId);
          // Show notification to caller
          this.showCallDeclinedNotification();
          // Auto close the call after a short delay
          setTimeout(() => {
            const roomId = this.roomId;
            this.stop();
            // Notify app to close modal and add call history
            if (this.onCallEnd) {
              this.onCallEnd(roomId, 'declined');
            }
          }, 2000);
        }
        break;
      case 'rtc-call-cancelled':
        // Handle when caller cancels the call before we answer
        console.log('Call cancelled by caller:', event.userId);
        // This will be handled by app.js to hide incoming call notification
        if (this.onCallEnd) {
          this.onCallEnd(event.roomId, 'cancelled');
        }
        break;
      case 'rtc-peers':
        console.log(`👥 Existing peers in room:`, event.peers);
        this.store.setCallState({ peers: event.peers });
        if (event.peers && event.peers.length) {
          this.hadRemotePeer = true;
        }
        event.peers.forEach((peerId) => this.createPeer(peerId, true));
        break;
      case 'rtc-joined':
        console.log(`👤 User ${event.userId} joined the call`);
        this.store.setCallState({ peers: [...new Set([...(this.store.getState().call.peers || []), event.userId])] });
        this.hadRemotePeer = true;
        break;
      case 'rtc-left':
        console.log(`👋 User ${event.userId} left the call`);
        this.closePeer(event.userId);
        
        // Check if there are any remaining peers
        const remainingPeers = this.store.getState().call.peers || [];
        console.log(`Remaining peers after ${event.userId} left:`, remainingPeers);
        
        // If no one else is in the call, show notification and auto-close after delay
        if (remainingPeers.length === 0) {
          console.log('No more peers in call, auto-closing...');
          this.showCallEndedNotification();
          setTimeout(() => {
            const roomId = this.roomId;
            this.stop();
            if (this.onCallEnd) {
              this.onCallEnd(roomId, 'ended');
            }
          }, 2000);
        }
        break;
      case 'rtc-offer':
        console.log(`📨 Received offer from ${event.from}`);
        this.ensurePeer(event.from, false).then(async (pc) => {
          console.log(`📝 Setting remote description and creating answer for ${event.from}`);
          await pc.setRemoteDescription(new RTCSessionDescription(event.sdp));
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          console.log(`📤 Sending answer to ${event.from}`);
          this.wsClient.sendRtc({ t: 'rtc-answer', roomId: this.roomId, to: event.from, sdp: answer });
        }).catch(err => {
          console.error(`❌ Error handling offer from ${event.from}:`, err);
        });
        break;
      case 'rtc-answer':
        console.log(`📨 Received answer from ${event.from}`);
        const pc = this.peerConnections.get(event.from);
        if (pc) {
          pc.setRemoteDescription(new RTCSessionDescription(event.sdp))
            .then(() => console.log(`✅ Remote description set for ${event.from}`))
            .catch(err => console.error(`❌ Error setting remote description for ${event.from}:`, err));
        } else {
          console.error(`❌ No peer connection found for ${event.from}`);
        }
        break;
      case 'rtc-ice':
        if (event.candidate) {
          this.peerConnections.get(event.from)?.addIceCandidate(new RTCIceCandidate(event.candidate));
        }
        break;
      default:
        break;
    }
  }