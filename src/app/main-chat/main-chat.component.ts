import { Component,OnInit} from '@angular/core';
import { ChatInputComponent } from './chat-input/chat-input.component';
import { ChatWindowComponent } from './chat-window/chat-window.component';
import { ChatServiceService } from '../core/services/chat-service.service';
@Component({
  selector: 'app-main-chat',
  templateUrl: './main-chat.component.html',
  styleUrls: ['./main-chat.component.css']
})
export class MainChatComponent implements OnInit {
  selectedChatId!: string ;  // ID of the selected chat
  selectedChatType!: string;  // Type of the selected chat

  constructor(private chatService : ChatServiceService){

  }
  ngOnInit(): void {
    
    this.chatService.getAllPrivateChats().subscribe((chats: any[]) => {
      if (chats && chats.length > 0) {
        const defaultChat = chats[0];  // Select the first chat as default
        this.selectedChatId = defaultChat._id; // Set the chatId
        this.selectedChatType = defaultChat.type; // Set the chat type
      }
    });
  }
  
  // Handle the event when a chat is selected from the sidebar
  onChatSelected(chatDetails: { chatId: string, chatType: string }): void {
    this.selectedChatId = chatDetails.chatId;
    this.selectedChatType = chatDetails.chatType;
    console.log('MainChatComponent: Chat selected:', this.selectedChatId); // Debug here
  }
  
  

  // Handle the event when a message is sent
  onMessageSent(message: string): void {
    // Logic to handle sending the message to the chat window
    console.log('Message sent:', message);
  }
}