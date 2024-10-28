import { Injectable } from '@angular/core';
import { Socket, io } from 'socket.io-client';
import { Observable,BehaviorSubject  } from 'rxjs';
import { AuthService } from './auth.service';
import Peer from 'peerjs';

import firebase from 'firebase/compat/app';
import 'firebase/database';
const firebaseConfig = {
  apiKey: "AIzaSyAmdlCrDZDKKnC5EzXGldPKIJkZi6YREn8",
  authDomain: "chat-notification-c4f7e.firebaseapp.com",
  databaseURL: "https://chat-notification-c4f7e-default-rtdb.firebaseio.com",  // Your Realtime Database URL here

  projectId: "chat-notification-c4f7e",
  storageBucket: "chat-notification-c4f7e.appspot.com",
  messagingSenderId: "468614911686",
  appId: "1:468614911686:web:af387ad70c4035a608e9c7",
  measurementId: "G-VEGDM5HMYR"
};
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
@Injectable({
  providedIn: 'root'
})


export class SocketService {
  private socket: Socket;
  private isConnected: boolean = false;
  public peer!: Peer;
  private peerId$ = new BehaviorSubject<string | null>(null);

  private peerConnection!: RTCPeerConnection;
  private localStream!: MediaStream;
  private remoteStream!: MediaStream | null;
  private recipientSocketId!:any;
  private db = firebase.database(); // Reference to Firebase Realtime Database

  constructor(private authService: AuthService) {
    this.socket = io('http://localhost:3001');
    this.socket.on('connect', () => {
      this.initializePeer();

      console.log('Connected to Socket.IO server', this.socket.id);
    });
  }

   private initializePeer() {
    this.peer = new Peer({
      host: 'localhost', 
      port: 9000,        
      path: '/peerjs'
    });

    this.peer.on('open', id => {
      this.peerId$.next(id);
      this.db.ref(`peers/${id}`).set({ peerId: id });
    });

    this.peer.on('call', (call) => {
      call.answer(); // Automatically answer the call for testing
      this.handleCallEvents(call);
    });
  }

  getPeerId(): Observable<string | null> {
    return this.peerId$.asObservable();
  }

  async initiateCall(receiverPeerId: string, isVideoCall: boolean) {
    const callerId = this.peerId$.getValue();
    if (callerId) {
      await this.db.ref(`calls/${callerId}_${receiverPeerId}`).set({
        callerId,
        receiverPeerId,
        status: 'ringing'
      });
    }

    navigator.mediaDevices.getUserMedia({ video: isVideoCall, audio: true })
      .then((stream) => {
        const call = this.peer.call(receiverPeerId, stream);
        this.handleCallEvents(call);
      })
      .catch(error => console.error('Error accessing media devices:', error));
  }

  private handleCallEvents(call: any) {
    call.on('stream', (remoteStream : any) => {
      console.log('Received remote stream:', remoteStream);
    });

    call.on('close', () => {
      console.log('Call ended');
    });
  }

  endCall() {
    this.peer.disconnect();
  }
  

  

  

  getRecipientId(){
    this.socket.on('userJoined', (data) => {
      const { userId, socketId } = data;
    
      // Store the socketId of the recipient (other user in the chat)
      if (userId !== this.authService.getUserId()) {
        this.recipientSocketId = socketId;
        console.log(`Stored recipient's socket ID: ${socketId} for user: ${userId}`);
      }
    });
    return this.recipientSocketId;
  }

  callUser(data: { offer: any, toUserId: string, fromUserId: string }) {
    console.log('Creating offer for user:', data.toUserId);  // MongoDB user ID
    this.socket.emit('offer', data);  // Emit the offer with MongoDB IDs
}

sendAnswer(data: { answer: any, toUserId: string, fromUserId: string }) {
    console.log('Sending answer to user:', data.toUserId);  // MongoDB user ID
    this.socket.emit('answer', data);  // Emit the answer with MongoDB IDs
}

sendIceCandidate(data: { candidate: any, toUserId: string }) {
    console.log('Sending ICE candidate to user:', data.toUserId);  // MongoDB user ID
    this.socket.emit('ice-candidate', data);  // Emit the ICE candidate with MongoDB IDs
}

startCall(callData: { toUserId: string, fromUserId: string, callType: string }) {
  this.socket.emit('offer', callData);  // Emit the offer event
}

 
   // Initialize peer connection and signaling
   initializeConnection(isVideoCall: boolean) {
    const configuration = {
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
    };
    
    this.peerConnection = new RTCPeerConnection(configuration);

    // Handle ICE candidates
    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        this.socket.emit('ice-candidate', { candidate: event.candidate });
      }
    };

    // Handle remote stream
    this.peerConnection.ontrack = (event) => {
      this.remoteStream = event.streams[0];
    };

    // Get user media
    navigator.mediaDevices.getUserMedia({ video: isVideoCall, audio: true })
      .then(stream => {
        this.localStream = stream;
        stream.getTracks().forEach(track => this.peerConnection.addTrack(track, stream));
      })
      .catch(err => console.error('Error accessing media devices:', err));
  }

  // Signaling methods
  createOffer(recipientId: string) {
    this.peerConnection.createOffer().then((offer) => {
      this.peerConnection.setLocalDescription(offer);
      // Send the offer to the backend with recipientId
      this.socket.emit('offer', { offer, recipientId });  // No socketId, only recipientId
    });
  }

  createAnswer(chatId: string) {
    this.peerConnection.createAnswer().then((answer) => {
      this.peerConnection.setLocalDescription(answer);
      this.socket.emit('answer', { answer, to: chatId });
    });
  }

  // Handle incoming offer
  handleOffer(offer: RTCSessionDescriptionInit) {
    this.peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
    this.createAnswer('recipient-chat-id');  // Replace with dynamic chatId if needed
  }

  // Handle incoming answer
  handleAnswer(answer: RTCSessionDescriptionInit) {
    this.peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
  }

  // Handle incoming ICE candidates
  handleIceCandidate(candidate: RTCIceCandidate) {
    this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
  }

   // Public methods to expose the events
   listenForOffer(callback: (data: any) => void) {
    this.socket.on('offer', callback);
  }

  listenForAnswer(callback: (data: any) => void) {
    this.socket.on('answer', callback);
  }

  listenForIceCandidate(callback: (data: any) => void) {
    this.socket.on('ice-candidate', callback);
  }
  // End call
 
    // Emit event for sending a new message
  sendMessage(messageData: any) {
    console.log('Sending message through socket :', messageData);
    this.socket.emit('message', messageData);
  }

  // Listen for new incoming messages
  receiveMessage(): Observable<any> {
    return new Observable(observer => {
      this.socket.off('message'); // Ensure no previous listeners are attached

      this.socket.on('message', (message: any) => {
        console.log('Message received from socket:', message);  // Add a log here to confirm reception
        observer.next(message);
      });
    });
  }
  

  

  sendAcceptCall(fromUserId: string) {
    this.socket.emit('accept-call', { fromUserId });
  }

  sendRejectCall(fromUserId: string) {
    this.socket.emit('reject-call', { fromUserId });
  }

  onCallRequest(): Observable<any> {
    return new Observable(observer => {
      this.socket.on('call-request', (data) => {
        observer.next(data);
      });
    });
  }

  onRejectCall(): Observable<any> {
    return new Observable(observer => {
      this.socket.on('reject-call', () => {
        observer.next();
      });
    });
  }

  onNewMessage(callback: (messageData: any) => void): void {
    this.socket.on('message', (messageData: any) => {
      console.log('Message received via socket:', messageData);
      callback(messageData);
    });
  }

  joinChat(chatId: string) {
    if (this.isConnected) {
      // Leave previous room before joining new one
      this.socket.emit('leaveChat', chatId);
    }
    this.socket.emit('joinChat', chatId, this.authService.getCurrentUserId);
    console.log(`Socket joined chat room: ${chatId}`);
    this.isConnected = true;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
    }
  }
  sendTokenToServer(userId : string,token: string) {
    
    this.socket.emit('registerToken',{ userId, token }); // Emit the token to the backend
  }
}