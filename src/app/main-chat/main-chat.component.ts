import { Component,OnInit} from '@angular/core';
import { ChatInputComponent } from './chat-input/chat-input.component';
import { ChatWindowComponent } from './chat-window/chat-window.component';
import { ChatServiceService } from '../core/services/chat-service.service';
import { AuthService } from '../core/services/auth.service';
@Component({
  selector: 'app-main-chat',
  templateUrl: './main-chat.component.html',
  styleUrls: ['./main-chat.component.css']
})
export class MainChatComponent implements OnInit {
  selectedChatId!: string ;  // ID of the selected chat
  selectedChatType!: string;  // Type of the selected chat
  selectedChatName: string | null = null;
  selectedChatAvatar: string | null = null;
  
  constructor(private chatService : ChatServiceService, 
    private authService : AuthService){

  }
  ngOnInit(): void {
    
    this.chatService.getAllPrivateChats().subscribe((chats: any[]) => {
      if (chats && chats.length > 0) {
        const defaultChat = chats[0];  // Select the first chat as default
        this.selectedChatId = defaultChat._id; // Set the chatId
        this.selectedChatType = defaultChat.type; // Set the chat type
        console.log("I am from Mainchat:",defaultChat.participants[0])

        if(defaultChat.participants[1]._id!= this.authService.getCurrentUserId){
          this.selectedChatAvatar= defaultChat.participants[1].profilePicture
          this.selectedChatName= defaultChat.participants[1].username
        }
        else{
          this.selectedChatAvatar= defaultChat.participants[0].profilePicture
          this.selectedChatName= defaultChat.participants[0].username
        }
       

      }
    });
  }
  
  // Handle the event when a chat is selected from the sidebar
  onChatSelected(chatDetails: { chatId: string, chatType: string, chatName: string, chatAvatar: string }): void {
    this.selectedChatId = chatDetails.chatId;
    this.selectedChatType = chatDetails.chatType;
    this.selectedChatName = chatDetails.chatName;
    this.selectedChatAvatar = chatDetails.chatAvatar;
    console.log('MainChatComponent: Chat selected:', this.selectedChatId,this.selectedChatAvatar); // Debug here
  }
  
  

  // Handle the event when a message is sent
  onMessageSent(message: string): void {
    // Logic to handle sending the message to the chat window
    console.log('Message sent:', message);
  }
}