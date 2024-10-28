import { Component, ViewChild, ElementRef, OnInit,AfterViewInit,ChangeDetectorRef  } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SocketService } from '../core/services/socket.service';
import firebase from 'firebase/compat/app';
import 'firebase/compat/database';  // Import Firebase Realtime Database
// import { ChatWindowComponent } from '../main-chat/chat-window/chat-window.component';
@Component({
  selector: 'app-call-screen-component',
  templateUrl: './call-screen-component.component.html',
  styleUrls: ['./call-screen-component.component.css']
})
export class CallScreenComponentComponent implements AfterViewInit {
  @ViewChild('localVideo') localVideo!: ElementRef;
  @ViewChild('remoteVideo') remoteVideo!: ElementRef;
  peerConnection: RTCPeerConnection | null = null;
  localStream!: MediaStream;
  receiverId  !: string
  callName!: string;
  callAvatar!: string;
  isCallActive: boolean = false;
  isVideoCall: boolean = false;
  senderId!: string;
  constructor(private route: ActivatedRoute, 
    private socketService: SocketService, 
    private router: Router, 
    private cdr: ChangeDetectorRef
    
    // private chatWindow: ChatWindowComponent
    ) {}

  ngAfterViewInit(): void {
    // Determine call type (audio/video) from query parameters
    if (!firebase.apps.length) {
      console.error('Firebase is not initialized!');
    }else{
    this.route.queryParams.subscribe(params => {
      const callType = params['type'];
      this.isVideoCall = callType === 'video';    
        this.callName = params['name'];
      this.callAvatar = params['avatar'];
      this.receiverId= params['receiverid']; 
      this.senderId= params['senderid']
      this.cdr.detectChanges();
      this.initializeMedia();

    });

    this.socketService.getPeerId().subscribe(peerId => {
      if (peerId) {
        this.listenForConnection(peerId);
      }
    });
  }

    

      // // Listen for WebRTC signaling events
      // this.socketService.listenForOffer(data => {
      //   this.socketService.handleOffer(data.offer);
      // });
  
      // this.socketService.listenForAnswer(data => {
      //   this.socketService.handleAnswer(data.answer);
      // });
  
      // this.socketService.listenForIceCandidate(data => {
      //   this.socketService.handleIceCandidate(data.candidate);
      // });
  }

  initializeMedia() {
    navigator.mediaDevices.getUserMedia({ video: this.isVideoCall, audio: true }).then(stream => {
      this.localStream = stream;
      this.localVideo.nativeElement.srcObject = stream;
    });
  }

  listenForConnection(peerId: string) {
    this.socketService.peer.on('call', (call) => {
      call.answer(this.localStream);
      call.on('stream', (remoteStream) => {
        this.remoteVideo.nativeElement.srcObject = remoteStream;
      });
    });
  }

  endCall() {
    this.localStream.getTracks().forEach(track => track.stop());
    this.socketService.endCall();
    console.log('Call ended');
    this.router.navigate(['/chat'])
  }
  // Initialize the call (audio/video)
  startCall(isVideo: boolean) {
    navigator.mediaDevices.getUserMedia({
      video: isVideo,
      audio: true
    }).then((stream: MediaStream) => {
      this.localStream = stream;
  
      if (this.localVideo?.nativeElement) {
        this.localVideo.nativeElement.srcObject = stream;
      }
  
      this.peerConnection = new RTCPeerConnection();
  
      stream.getTracks().forEach(track => {
        this.peerConnection?.addTrack(track, stream);
      });
  
      this.peerConnection.onicecandidate = (event: RTCPeerConnectionIceEvent) => {
        if (event.candidate) {
          firebase.database().ref(`calls/${this.receiverId}/iceCandidates`).push(event.candidate);
        }
      };
  
      this.peerConnection.ontrack = (event: RTCTrackEvent) => {
        if (this.remoteVideo?.nativeElement) {
          this.remoteVideo.nativeElement.srcObject = event.streams[0];
        }
      };
  
      this.peerConnection.createOffer().then((offer: RTCSessionDescriptionInit) => {
        this.peerConnection?.setLocalDescription(offer);
        firebase.database().ref(`calls/${this.receiverId}/offer`).set(offer);
      });
    }).catch((error: Error) => {
      console.error('Error accessing media devices:', error);
  
      // Add user feedback here
      if (error.name === 'NotReadableError') {
        alert('Could not start video source. Make sure no other application is using your webcam.');
      }
    });
  }
  

  // Receive a call and handle signaling
  receiveCall() {
    firebase.database().ref(`calls/${this.receiverId}/offer`).on('value', snapshot => {
      const offer = snapshot.val();
      if (offer && this.peerConnection) {
        this.peerConnection.setRemoteDescription(new RTCSessionDescription(offer));

        // Create an answer and store it in Firebase
        this.peerConnection.createAnswer().then(answer => {
          this.peerConnection?.setLocalDescription(answer);
          firebase.database().ref(`calls/${this.senderId}/answer`).set(answer);
        });
      }
    });

    // Receive ICE candidates
    firebase.database().ref(`calls/${this.receiverId}/iceCandidates`).on('child_added', snapshot => {
      const candidate = new RTCIceCandidate(snapshot.val());
      this.peerConnection?.addIceCandidate(candidate);
    });
  }

  toggleMute() {
    console.log('Mute toggled');
    // Logic for muting the call (audio) will go here
  }

  toggleVideo() {
    console.log('Video toggled');
    // Logic for toggling video during a call
  }

  
}
