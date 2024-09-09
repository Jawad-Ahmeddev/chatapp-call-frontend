import { Component, EventEmitter, Output, ViewChild, ElementRef , Input, OnChanges} from '@angular/core';
import { ChatServiceService } from '../../core/services/chat-service.service';
import { AuthService } from 'src/app/core/services/auth.service';

@Component({
  selector: 'app-chat-input',
  templateUrl: './chat-input.component.html',
  styleUrls: ['./chat-input.component.css']
})
export class ChatInputComponent{
  @Input() chatId!: string;  // Make sure this is defined

  @Output() messageSent = new EventEmitter<string>(); // Emit the message to the parent component
  @ViewChild('fileInput') fileInput!: ElementRef;

  messageText: string = '';
  showEmojiPicker: boolean = false;
  currentUserId!: any;
  messages: any[] = [];
  newMessage: string = '';

  constructor(private chatService: ChatServiceService, private authService: AuthService) {}

  // Send the message when the user clicks the send button or presses Enter
  // sendMessage() {
  //   if (this.messageText && this.chatId) {
  //     const messagePayload = {
  //       roomId: this.chatId,
  //       message: this.messageText
  //     };

  //     // Call the chat service to send the message
  //     this.chatService.sendMessage(messagePayload).subscribe(
  //       (response) => {
  //         console.log('Message sent:', response);
  //         this.messageText = ''; // Clear input after sending
  //       },
  //       (error) => {
  //         console.error('Error sending message:', error);
  //       }
  //     );
  //   }
  // }

  addEmoji(event: any) {  // Change the type to 'any' for now
    this.messageText += event.emoji.native;  // Add the emoji to the message input
    this.showEmojiPicker = false;  // Close the picker after choosing an emoji
  }

   // Send a new message
   sendMessage() {
    if (this.messageText && this.chatId) {
      // Get the current user's ID from AuthService
      const senderId = this.authService.getCurrentUserId();  // You need to implement this in AuthService

      const messagePayload = {
        roomId: this.chatId,  // Room ID passed here
        message: this.messageText,
        sender: senderId // Pass the actual sender ID
      };

      this.chatService.sendMessage(messagePayload).subscribe(
        (response) => {
          console.log('Message sent successfully:', response);
          this.messageText = '';  // Clear input after sending
        },
        (error) => {
          console.error('Error sending message:', error);
        }
      );
    }
  }
  

scrollToBottom(): void {
  setTimeout(() => {
    const chatMessages = document.querySelector('.chat-window__messages');
    if (chatMessages) {
      chatMessages.scrollTop = chatMessages.scrollHeight;
    }
  }, 0);
}
  

  // Toggle the emoji picker visibility
  toggleEmojiPicker(): void {
    this.showEmojiPicker = !this.showEmojiPicker;
  }

  // Trigger the file input click event
  triggerFileInput(): void {
    this.fileInput.nativeElement.click();
  }

  // Handle file input change event
  handleFileInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.uploadFile(file);
    }
  }

  // Upload the selected file (You can implement your upload logic here)
  uploadFile(file: File): void {
    console.log('Uploading file:', file.name);
    // Implement file upload logic here, e.g., using ChatService or directly interacting with a file server
  }

  
}