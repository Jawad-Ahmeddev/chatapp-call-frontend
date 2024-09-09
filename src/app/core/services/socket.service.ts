import { Injectable } from '@angular/core';
import { Socket, io } from 'socket.io-client';
import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private socket: Socket;

  constructor() {
    this.socket = io('http://localhost:3001');
  }

  emit(eventName: string, data: any) {
    this.socket.emit(eventName, data);
  }

  listen(eventName: string): Observable<any> {
    return new Observable((subscriber) => {
      this.socket.on(eventName, (data: any) => {
        subscriber.next(data);
      });
    });
  }
  
  joinChat(chatId: string) {
    this.socket.emit('joinChat', chatId);
  }

  sendMessage(messageData: any) {
    this.socket.emit('sendMessage', messageData);
  }

  listenForMessages(): Observable<any> {
    return new Observable((observer) => {
      this.socket.on('newMessage', (message) => {
        observer.next(message);
      });
    });
  }
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
    }
  }
}