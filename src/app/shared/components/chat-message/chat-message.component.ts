import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-chat-message',
  templateUrl: './chat-message.component.html',
  styleUrls: ['./chat-message.component.css']
})
export class ChatMessageComponent implements OnInit {
  @Input() messageText!: string;           // Text content of the message
  @Input() messageType: 'text' | 'image' | 'file' = 'text'; // Type of the message (text, image, file)
  @Input() messageContent?: string;        // Content for images and files (URL)
  @Input() messageFileName?: string;       // File name if the message is a file
  @Input() senderName!: string;            // Name of the sender
  @Input() senderAvatar?: string;          // Avatar URL of the sender (optional)
  @Input() timestamp!: Date;               // Timestamp of when the message was sent
  @Input() incoming: boolean = true;       // Whether the message is incoming or outgoing

  constructor() {}

  ngOnInit(): void {
    // Any initialization logic can go here if needed
  }
}