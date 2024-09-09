import { Component } from '@angular/core';
import { ChatInputComponent } from './chat-input/chat-input.component';
import { ChatWindowComponent } from './chat-window/chat-window.component';
@Component({
  selector: 'app-main-chat',
  templateUrl: './main-chat.component.html',
  styleUrls: ['./main-chat.component.css']
})
export class MainChatComponent {
  selectedChatId!: string ;  // ID of the selected chat
  selectedChatType!: string;  // Type of the selected chat

  // Handle the event when a chat is selected from the sidebar
  onChatSelected(event: { chatId: string, chatType: string }) {
    console.log('Chat selected:', event.chatId, event.chatType);  // Check the chat ID passed from the sidebar
    this.selectedChatId = event.chatId;
    this.selectedChatType = event.chatType;
  }
  
  

  // Handle the event when a message is sent
  onMessageSent(message: string): void {
    // Logic to handle sending the message to the chat window
    console.log('Message sent:', message);
  }
}