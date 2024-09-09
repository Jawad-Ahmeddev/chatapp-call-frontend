import { Component,SimpleChanges, OnDestroy, OnInit, ViewChild, ElementRef , Input, OnChanges,AfterViewChecked } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ChatServiceService } from '../../core/services/chat-service.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { UserServiceService } from 'src/app/core/services/user-service.service';
import { SocketService } from 'src/app/core/services/socket.service';
import { response } from 'express';

@Component({
  selector: 'app-chat-window',
  templateUrl: './chat-window.component.html',
  styleUrls: ['./chat-window.component.css']
})
export class ChatWindowComponent implements OnChanges ,AfterViewChecked, OnDestroy  {
  @Input() chatId!: string;  // Accepts chatId as an input from the parent component
  @Input() chatType!: string;  // Accepts chatType as an input from the parent component
  @ViewChild('chatMessages') private chatMessagesContainer!: ElementRef;
  currentUserName: string = '';  // Declare current user name
  currentUserAvatar: string = '';  // Declare current user avatar
  chatName: string = '';
  chatStatus: string = 'Online'; // Placeholder status; can be dynamically updated
  messages: any[] = [];
  newMessage: string = '';
  showOptions: boolean = false;
  currentUserId: string = ''; // Assuming you have a way to get the current user's ID
  chatAvatar!: string;
  currentUser: any;  // To hold the current user's info
  roomId! : string; 
  receiverId! : string;
  @ViewChild('chatMessages') chatMessages!: ElementRef;

  constructor(
    private route: ActivatedRoute,
    private chatService: ChatServiceService, 
    private authService : AuthService, 
    private userService : UserServiceService,
    private socketService: SocketService,

  ) { }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['chatId'] && changes['chatId'].currentValue) {
      this.loadMessages(changes['chatId'].currentValue);
    }
  }

  ngOnInit(): void {
    this.currentUserId = this.authService.getCurrentUserId();
    console.log("Current User Id : "+this.currentUserId)  // Get the current user ID
    this.loadCurrentUserProfile();
    if (this.chatId) {
      console.log("Current Chat ID:", this.chatId);

      // Join the chat room using chatId (or you can use roomId if it's distinct)
      this.socketService.emit('joinChat', this.chatId);

      // Load previous messages
      this.loadMessages(this.chatId);
  } else {
      console.error("Chat ID is undefined");
  }

  // Listening for new incoming messages
  this.socketService.listen('newMessage').subscribe((message: any) => {
      this.messages.push(message);
  });
  }
  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  ngOnDestroy(): void {
    // Ensure to disconnect from the socket when the component is destroyed
    this.socketService.disconnect();
  }


  getReceiverId() {
    this.receiverId = '66cf1cfeb8e56bd84d2d68b8'; // Example receiverId
  }

  // Get the room by participants
  getRoomByParticipants() {
    const data = {
      senderId: this.currentUserId,
      receiverId: this.receiverId,
    };

    this.chatService.getRoomByParticipants(this.currentUserId,this.receiverId).subscribe(
      (room: any) => {
        this.roomId = room._id; // Store roomId
        this.socketService.joinChat(this.chatId); // Join the room via socket
        // this.loadChatHistory();
      },
      (error) => {
        console.error('Error fetching room by participants:', error);
      }
    );
  }

  loadCurrentUserProfile() {
    this.loadMessages(this.currentUserId);

    this.userService.getUserProfile(this.currentUserId).subscribe((user: any) => {
      this.currentUserAvatar = user.profilePicture || 'assets/default-avatar.png';
    });
  }
  
  sendMessage(messageText: string) {
    if (!messageText.trim()) return;

    const messagePayload = {
      roomId: this.chatId,
      message: messageText,
      sender: this.currentUserId // The current user as the sender
    };

    this.chatService.sendMessage(messagePayload).subscribe(
      (response: any) => {
        this.messages.push(response); // Append new message to the array

      },
      (error: any) => {
        console.error('Error sending message:', error);
      }
    );

    this.scrollToBottom();

  }
  
  
  // Load the chat messages
  loadMessages(chatId: string) {
    this.chatService.getMessages(chatId).subscribe((messages: any[]) => {
      this.messages = messages;

      // For each message, fetch the profile of the sender
      this.messages.forEach((message) => {
        // Log the message sender and current user to verify
        console.log('Message:', message);
        console.log('Message Sender ID:', message.sender._id, 'Current User ID:', this.currentUserId);
        console.log('Class Applied:', message.sender._id === this.currentUserId ? 'message__wrapper--right' : 'message__wrapper--left');

        // Check if the message is from the current user
        if (message.sender._id === this.currentUserId) {
          message.isCurrentUser = true; // Mark as current user's message
          this.currentUserAvatar = message.sender.profilePicture || this.currentUserAvatar;
          console.log('This is the current user\'s message:', message);
        } else {
          this.fetchSenderProfile(message.sender._id); // Fetch profile data for other users
        }
      });
    })}

    fetchSenderProfile(senderId: string): void {
      this.userService.getUserProfile(senderId).subscribe(
        (user: any) => {
          this.messages.forEach((msg: any) => {
            if (msg.sender._id === senderId) {
              msg.senderName = user.username;
              msg.senderAvatar = user.profilePicture || 'assets/default-avatar.png';
              console.log('Fetched profile for sender:', senderId, user);
            }
          });
        },
        (error) =>{
          console.error('Error fetching user profile:', error);
        }
      );
    }
  





 

  setChatInfo(): void {
    // Set chatName and chatStatus based on chatType or chatId
    // Example logic:
    this.chatName = this.chatType === 'group' ? 'Group Chat' : 'Personal Chat';
    this.chatStatus = 'Online'; // Or fetch the actual status
  }

  // Scroll to the bottom of the chat messages
  scrollToBottom(): void {
    try {
      this.chatMessagesContainer.nativeElement.scrollTop = this.chatMessagesContainer.nativeElement.scrollHeight;
    } catch (err) {
      console.error('Scrolling error', err);
    }
  }

  // Toggle the options dropdown menu
  toggleOptions(): void {
    this.showOptions = !this.showOptions;
  }

  // Navigate to settings
  goToSettings(): void {
    // Implement navigation to settings
    console.log('Navigating to settings...');
  }

  // Exit the chat
  exitChat(): void {
    // Implement exiting the chat logic
    console.log('Exiting chat...');
  }
}