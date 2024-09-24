import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
@Injectable({
  providedIn: 'root'
})
export class ChatServiceService{
  private chatApiUrl = 'http://localhost:3001/api/chats';
  private messageApiUrl = 'http://localhost:3001/api/messages'; // For fetching and sending messages
  private selectedChatId: string = '';
  private selectedChatType: string = '';
  constructor(private http: HttpClient, private authService: AuthService) {}

  // Send a message
  sendMessage (chatId: any, message: any, sender: any ): Observable<any> {
    return this.http.post(`${this.messageApiUrl}/send`, { chatId,message,sender });
  }

  setSelectedChat(chatId: string, chatType: string) {
    this.selectedChatId = chatId;
    this.selectedChatType = chatType;
  }

  getChats(): Observable<any> {
    return this.http.get(`${this.chatApiUrl}/api/chats`);
  }

  getSelectedChat() {
    return { chatId: this.selectedChatId, chatType: this.selectedChatType };
  }
  

  // Get messages in a specific room
  getMessages(chatId: string): Observable<any> {
    return this.http.get(`${this.messageApiUrl}/getmessage/${chatId}`);
  }

  // Get recent chats for the user
  getRecentChats(): Observable<any> {
    const userId = this.authService.getUserId();
    return this.http.post(`${this.chatApiUrl}/recent`, { userId });
  }
  

  // Get all private chats for the user
  getAllPrivateChats(): Observable<any> {
    const userId = this.authService.getUserId();
    return this.http.post(`${this.chatApiUrl}/personal`, { userId });
  }

  // Get personal chats for the user
  getPersonalChats(): Observable<any> {
    const userId = this.authService.getUserId();
    return this.http.post(`${this.chatApiUrl}/personal`, { userId });
  }

  // Get group chat for the user
  getGroupChat(): Observable<any> {
    return this.http.get(`${this.chatApiUrl}/group`);
  }
  

  // Create or join a personal chat by email
  createOrJoinPersonalChatByEmail(userEmail: string): Observable<any> {
    const currentUserEmail = this.authService.getUserEmail(); // Assuming you have a method to get the current user's email
    return this.http.post(`${this.chatApiUrl}/createOrJoin`, { currentUserEmail, userEmail });
  }

  // chat-service.service.ts
getRoomByParticipants(senderId: string, receiverId: string): Observable<any> {
  return this.http.post(`${this.chatApiUrl}/roomByParticipants`, { senderId, receiverId });
}

getChatById(chatId: string): Observable<any> {
  return this.http.get(`${this.chatApiUrl}/chats/${chatId}`);
}
 
}