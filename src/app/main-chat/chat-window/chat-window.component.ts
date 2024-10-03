import { Component,SimpleChanges, OnDestroy, OnInit, ViewChild, ElementRef , Input, OnChanges,AfterViewChecked } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ChatServiceService } from '../../core/services/chat-service.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { UserServiceService } from 'src/app/core/services/user-service.service';
import { SocketService } from 'src/app/core/services/socket.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-chat-window',
  templateUrl: './chat-window.component.html',
  styleUrls: ['./chat-window.component.css']
})
export class ChatWindowComponent implements OnChanges ,AfterViewChecked, OnDestroy  {
  @Input() roomId!: string; // Get the roomId from the selected chat
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
  currentUserId: any; // Assuming you have a way to get the current user's ID
  chatAvatar!: string;
  currentUser: any;  // To hold the current user's info
  receiverId! : string;
  isLoading: boolean = false;

  @ViewChild('chatMessages') chatMessages!: ElementRef;
  messageSubscription!: Subscription;

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
    if(this.chatId){
      this.socketService.joinChat(this.chatId);
      console.log("Chat ID in chat-Window: "+this.chatId)
      this.listenForMessages();
    }
    
  }

  ngOnInit(): void {
    this.currentUserId = this.authService.getCurrentUserId();
    console.log("Current User Id : "+this.currentUserId)  // Get the current user ID
    console.log("Chat ID in chat-Window: "+this.chatId)
    
    if (this.messageSubscription) {
      // Unsubscribe from previous room's message listener to prevent duplication
      this.messageSubscription.unsubscribe();
    }
    if(this.chatId){
      this.socketService.joinChat(this.chatId);

      this.loadCurrentUserProfile();

      this.socketService.receiveMessage().subscribe((message: any) => {
        console.log('Message received from socket in chat-window:', message);  // Add this log to ensure messages are received

        if (message.chatId === this.chatId) {
          console.log('New message for this chat:', message);

          this.messages.push(message);
          console.log('Updated messages array:', this.messages);
        }
      });
      
      this.loadMessages(this.chatId);
      // this.listenForMessages();
    }  
  }
  

  // // Listening for new incoming messages
  // this.socketService.receiveMessage().subscribe((message) => {
  //   this.messages.push(message);
  //   console.log('New message received via socket:', message);
  // });
  
  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  ngOnDestroy(): void {
    if (this.messageSubscription) {
      this.messageSubscription.unsubscribe();
    }
  }

  joinChat() {
  }
  

  // Get the room by participants
  // getRoomByParticipants() {
  //   const data = {
  //     senderId: this.currentUserId,
  //     receiverId: this.receiverId,
  //   };

  //   this.chatService.getRoomByParticipants(this.currentUserId,this.receiverId).subscribe(
  //     (room: any) => {
  //       this.roomId = room._id; // Store roomId
  //       this.socketService.joinRoom(this.chatId); // Join the room via socket
  //       // this.loadChatHistory();
  //     },
  //     (error) => {
  //       console.error('Error fetching room by participants:', error);
  //     }
  //   );
  // }

  listenForMessages(): void {
    this.socketService.receiveMessage().subscribe((messageData) => {
      // Ensure the message is for the currently selected chat
      console.log("message data from chatWindow : "+messageData)
      if (messageData.chatId === this.chatId) {
        // Check if sender's avatar and name are provided
      
        this.messages.push(messageData);
        console.log('New message added:', messageData);
        // Push the new message to the chat window
        this.scrollToBottom();  // Scroll to the latest message
      }
    });
  }

  loadCurrentUserProfile() {
    this.loadMessages(this.currentUserId);

    this.userService.getUserProfile(this.currentUserId).subscribe((user: any) => {
      this.currentUserAvatar = user.profilePicture || 'assets/default-avatar.png';
    });
  }
  
  sendMessage() {
    if (this.newMessage.trim() !== '') {
      const messageData = {
        chatId: this.chatId,
        message: this.newMessage,
        sender: this.currentUserId, // Fetch current user
      };

      // Emit the message to the backend
      this.socketService.sendMessage(messageData);

      this.newMessage = ''; // Reset input field
    }
  }
  
  
  // Load the chat messages
  loadMessages(chatId: string) {
    this.isLoading= true;

    this.chatService.getMessages(chatId).subscribe((messages: any[]) => {
      this.messages = messages;
       console.log("I am from the chatWindow getmessage, ChatID :"+chatId)   
      // For each message, fetch the profile of the sender
      this.messages.forEach((message) => {
        // Log the message sender and current user to verify
        // console.log('Message:', message);
        // console.log('Message Sender ID:', message.sender._id, 'Current User ID:', this.currentUserId);
        // console.log('Class Applied:', message.sender._id === this.currentUserId ? 'message__wrapper--right' : 'message__wrapper--left');

        // Check if the message is from the current user
        if (message.sender._id === this.currentUserId) {
          message.isCurrentUser = true; // Mark as current user's message
          this.currentUserAvatar = message.sender.profilePicture || this.currentUserAvatar;
          this.isLoading= false;

          // console.log('This is the current user\'s message:', message);
        } else {
          this.isLoading= false;
          this.fetchSenderProfile(message.sender._id); // Fetch profile data for other users

        }
      });
      this.isLoading= false;

    })

    this.scrollToBottom();  // Scroll to the latest message

  }

    fetchSenderProfile(senderId: string): void {
      this.userService.getUserProfile(senderId).subscribe(
        (user: any) => {
          this.messages.forEach((msg: any) => {
            if (msg.sender._id === senderId) {
              msg.senderName = user.username;
              msg.senderAvatar = user.profilePicture || 'assets/default-avatar.png';
              // console.log('Fetched profile for sender:', senderId, user);
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
  private scrollToBottom(): void {
    try {
      this.chatMessagesContainer.nativeElement.scrollTop = this.chatMessagesContainer.nativeElement.scrollHeight;
    } catch (err) {
      console.log('Error scrolling to bottom:', err);
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