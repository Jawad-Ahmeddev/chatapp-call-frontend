import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
@Injectable({
  providedIn: 'root'
})
export class ChatServiceService{
  private chatApiUrl = 'http://localhost:3001/api/chats';
  private roomApiUrl = 'http://localhost:3001/api/rooms';
  
  constructor(private http: HttpClient, private authService: AuthService) {}

  // Send a message
  sendMessage(messagePayload: { roomId: string, message: string, sender: string }): Observable<any> {
    console.log('Sending message payload to backend:', messagePayload);  // Debugging log
    return this.http.post(`${this.chatApiUrl}/send`, messagePayload);
  }



  

  
  

  // Get messages in a specific room
  getMessages(roomId: string): Observable<any> {
    return this.http.get(`${this.chatApiUrl}/room/${roomId}`);
  }

  // Get recent chats for the user
  getRecentChats(): Observable<any> {
    const userId = this.authService.getUserId();
    return this.http.post(`${this.roomApiUrl}/recent`, { userId });
  }
  

  // Get all private chats for the user
  getAllPrivateChats(): Observable<any> {
    const userId = this.authService.getUserId();
    return this.http.post(`${this.roomApiUrl}/private`, { userId });
  }

  // Get personal chats for the user
  getPersonalChats(): Observable<any> {
    const userId = this.authService.getUserId();
    return this.http.post(`${this.roomApiUrl}/personal`, { userId });
  }

  // Get group chat for the user
  getGroupChat(): Observable<any> {
    const userId = this.authService.getUserId();
    return this.http.post(`${this.roomApiUrl}/group`, { userId });
  }

  // Create or join a personal chat by email
  createOrJoinPersonalChatByEmail(email: string): Observable<any> {
    const userEmail1 = this.authService.getUserEmail(); // Assuming you have a method to get the logged-in user's email
    return this.http.post(`${this.roomApiUrl}/createOrJoin`, { userEmail1, userEmail2: email });
  }

  // chat-service.service.ts
getRoomByParticipants(senderId: string, receiverId: string): Observable<any> {
  return this.http.post(`${this.roomApiUrl}/roomByParticipants`, { senderId, receiverId });
}

getChatById(chatId: string): Observable<any> {
  return this.http.get(`${this.chatApiUrl}/chats/${chatId}`);
}
 
}