import { Injectable } from '@angular/core';
import { Socket, io } from 'socket.io-client';
import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root'
})


export class SocketService {
  private socket: Socket;
  private isConnected: boolean = false;

  constructor() {
    this.socket = io('http://localhost:3001');
    this.socket.on('connect', () => {
      console.log('Connected to Socket.IO server', this.socket.id);
    });
  }

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
    this.socket.emit('joinChat', chatId);
    console.log(`Socket joined chat room: ${chatId}`);
    this.isConnected = true;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
    }
  }
}