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
    this.chatAvatar= 'data:image/jpeg;base64,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'
              this.chatName = 'Unknown'

    if(this.chatId=='64eaa9ed13649663736b0d05'){
      this.chatAvatar= 'https://th.bing.com/th?id=OIP.JzfMMdGGxHVW3zepnVulsgHaHw&w=244&h=255&c=8&rs=1&qlt=90&o=6&pid=3.1&rm=2'
      this.chatName= 'Community chat'

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
    else{
      this.loadDefaultChat();

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
  loadDefaultChat() {
    // Fetch the first chat as default and assign it
    
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
              
              this.chatAvatar= msg.senderAvatar; 
              this.chatName= msg.senderName
              // console.log('Fetched profile for sender:', senderId, user);
            }
            if(this.chatId=='64eaa9ed13649663736b0d05'){
              this.chatAvatar= 'https://th.bing.com/th?id=OIP.JzfMMdGGxHVW3zepnVulsgHaHw&w=244&h=255&c=8&rs=1&qlt=90&o=6&pid=3.1&rm=2'
              this.chatName= 'Community chat'
        
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