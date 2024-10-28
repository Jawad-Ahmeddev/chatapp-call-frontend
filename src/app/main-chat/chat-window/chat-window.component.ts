import { Component,SimpleChanges, OnDestroy, OnInit, ViewChild, ElementRef , Input, OnChanges,AfterViewChecked } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ChatServiceService } from '../../core/services/chat-service.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { UserServiceService } from 'src/app/core/services/user-service.service';
import { SocketService } from 'src/app/core/services/socket.service';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
// import { CallScreenComponentComponent } from 'src/app/call-screen-component/call-screen-component.component';

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
  currentUserEmail:string= '';
  currentUserAvatar: string = '';  // Declare current user avatar
  chatStatus: string = 'Online'; // Placeholder status; can be dynamically updated
  messages: any[] = [];
  newMessage: string = '';
  showOptions: boolean = false;
  currentUserId: any; // Assuming you have a way to get the current user's ID
  currentUser: any;  // To hold the current user's info
  receiverId! : string;
  isLoading: boolean = false;
  @Input() chatName: string | null = null;
  @Input() chatAvatar: string | null = null;
  @ViewChild('chatMessages') chatMessages!: ElementRef;
  messageSubscription!: Subscription;
  incomingCall = false;
  callerName = '';
  callerEmail = '';
  callType: 'audio' | 'video' | null = null;
  peerId: string= '';

  constructor(
    private route: ActivatedRoute,
    private chatService: ChatServiceService, 
    private authService : AuthService, 
    private userService : UserServiceService,
    private socketService: SocketService,
    private router : Router, 

    // private callScreenComponent : CallScreenComponentComponent

  ) { }

  ngOnChanges(changes: SimpleChanges): void {
    
    if (changes['chatId'] && changes['chatId'].currentValue) {
      this.loadMessages(changes['chatId'].currentValue);
    }
    // if (changes['chatAvatar'] && changes['chatAvatar'].currentValue) {
    //   this.chatAvatar=changes['chatId'].currentValue;
    // }
    
    if(this.chatId){
      this.socketService.joinChat(this.chatId);
      console.log("Chat ID in chat-Window: "+this.chatId)
      this.listenForMessages();
    }
    

    if(this.chatId=='64eaa9ed13649663736b0d05'){
      this.chatAvatar= 'https://th.bing.com/th?id=OIP.JzfMMdGGxHVW3zepnVulsgHaHw&w=244&h=255&c=8&rs=1&qlt=90&o=6&pid=3.1&rm=2'
      this.chatName= 'Community chat'

    }
    this.socketService.getPeerId().subscribe(id => {
      if (id) {
        this.peerId = id;
        this.listenForIncomingCalls();
      }
    });
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


  listenForIncomingCalls() {
    this.socketService.getPeerId().subscribe(peerId => {
      if (peerId) {
        console.log(`Listening for calls to peer ID: ${peerId}`);
      }
    });
  }

  acceptCall() {
    this.incomingCall = false;
    this.socketService.sendAcceptCall(this.currentUserId);
    this.router.navigate(['/call-screen'], { queryParams: { type: this.callType } });
  }

  rejectCall() {
    this.incomingCall = false;
    this.socketService.sendRejectCall(this.currentUserId);
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

  initiateAudioCall() {
    this.startCall('audio');
  }
  
  initiateVideoCall() {
    this.startCall('video');
  }
  
  startCall(callType: string) {
    const callData = {
      toUserId: this.receiverId,  // Use MongoDB user ID
      fromUserId: this.currentUserId,  // MongoDB ID of current user
      callType: callType  // 'audio' or 'video'
    };
    this.socketService.startCall(callData);
  }

  async startAudioCall() {
      this.socketService.initializeConnection(false); // true for video call

      await this.socketService.initiateCall(this.receiverId, false);

    this.router.navigate(['/call'], { queryParams: { type: 'audio', name: this.chatName, avatar: this.chatAvatar, id: this.receiverId, senderid: this.currentUserId } });
    // Future logic for initiating an audio call will go here
  }

  async startVideoCall() {
    await this.socketService.initiateCall(this.receiverId, true);
    this.socketService.initializeConnection(true); // true for video call
    this.router.navigate(['/call'], { queryParams: { type: 'video', name: this.chatName, avatar: this.chatAvatar, receiverid: this.receiverId, senderid: this.currentUserId } });
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
          this.currentUserEmail= message.sender.email; 
          this.currentUserName = message.sender.email

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
              this.callerName = msg.senderName
              this.callerEmail= user.email;
              
              // this.chatAvatar= msg.senderAvatar; 
              // this.chatName= msg.senderName
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