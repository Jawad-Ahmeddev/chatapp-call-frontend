import { Component , OnInit,OnChanges,SimpleChanges, DoCheck  } from '@angular/core';
import { Router } from '@angular/router';
import { ChatServiceService } from '../core/services/chat-service.service';
import {  Output} from '@angular/core';
import { EventEmitter } from '@angular/core';
import { AuthService } from '../core/services/auth.service';
import { SocketService } from '../core/services/socket.service';
@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit,OnChanges, DoCheck {
  personalChats: any[] = [];
  groupChat: any = null;
  groupChatId = '64eaa9ed13649663736b0d05';  // Group chat ID
  selectedChatId: string = '';

  recentChats: any[] = []; // Define recentChats here
  newChatEmail: string = ''; // Holds the email for the new chat
  showModal: boolean = false; // Controls modal visibility
  userId: any;
  public showAllPrivateChats = false; // Toggle flag
  public allPrivateChats: any[] = [];
  groupChats: any;
  showGroupChats: boolean = false;
  showPersonalChats: boolean = false;

  @Output() chatSelected = new EventEmitter<{ chatId: string, chatType: string, chatName: string, chatAvatar: string }>();
  currentChatView: string = 'recent';  // 'recent' or 'group'
  searchTerm: string = '';  // To store the search term entered by the user
  allChats: any[] = [];     // This will store all chats fetched from the backend
  filteredChats: any[] = []; // This will store the filtered chats for display
  filteredPrivateChats: any[] = []; // This will store the filtered private chats for display
  isLoading: boolean = false;
  newMessageChatId = null;  // To track new messages
  private previousChatsState :any = [];

  constructor(
    private chatService: ChatServiceService,
    private router: Router,
    private authService : AuthService,
    private socketService : SocketService
  ) {}

  ngOnInit(): void {
    console.log('Initializing sidebar component');

    this.userId = this.authService.getUserId() || '';
    this.isLoading = true;

    // this.loadRecentChats();
    // this.loadGroupChat(); // Load the group chat in the sidebar
    this.fetchRecentChats(); // Fetch recent chats by default
    this.fetchChats();
    console.log('Subscribing to new messages');
    this.socketService.onNewMessage((message) => {
      console.log('Message received from socket:', message);
      this.updateChatWithNewMessage(message);
    });
   
  }
  ngDoCheck() {
    // Manually trigger updates to check for any changes
    
    this.socketService.onNewMessage((message) => {
      if (message.sender._id == this.userId) {
        
        this.fetchRecentChats(); // Fetch recent chats by default
      }
      else{
        console.log('Message received from socket:', message);
      this.updateChatWithNewMessage(message);
      }
      
    });

    if (JSON.stringify(this.recentChats) !== JSON.stringify(this.previousChatsState)) {
      this.previousChatsState = [...this.recentChats];  // Save the state
      // Force update for UI
    }
  }
  

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['newMessage'] && changes['newMessage'].currentValue) {
      console.log('Change detected in newMessage:', changes['newMessage'].currentValue);
      this.updateChatWithNewMessage(changes['newMessage'].currentValue);
    }
  }


  handleNewMessage(message:any) {
    const chatId = message.chatId;
    this.newMessageChatId = chatId;

    // Find the chat in recent chats or private chats
    const chat = this.recentChats.find(chat => chat._id === chatId) || 
                 this.allPrivateChats.find(chat => chat._id === chatId);
    
    if (chat) {
      chat.hasNewMessage = true;  // Set the chat as having a new message
      chat.lastMessage = message;  // Update the last message

      // Move the chat to the top
      this.moveChatToTop(chat);
    }
  }

  moveChatToTop(chat:any) {
    // Remove the chat from its current position
    this.recentChats = this.recentChats.filter(c => c._id !== chat._id);
    this.allPrivateChats = this.allPrivateChats.filter(c => c._id !== chat._id);
    
    // Re-insert the chat at the top
    this.recentChats.unshift(chat);
  }
  updateChatWithNewMessage(message: any) {
  console.log('Updating chat with new message:', message);

  // Find the chat where the new message belongs
  let chatToUpdate = this.recentChats.find(chat => chat._id === message.chatId);
  
  if (chatToUpdate) {
    // Update lastMessage and mark as having a new message
    chatToUpdate.lastMessage = message;
    chatToUpdate.hasNewMessage = true;  // Set a flag to indicate a new message for highlighting
    
    // Move the updated chat to the top
    this.recentChats = [chatToUpdate, ...this.recentChats.filter(chat => chat._id !== message.chatId)];
  }
}
  


  fetchChats() {
    console.log('Fetching all private and group chats');

    // Fetch all chats (personal, group, or recent) and store them
    this.chatService.getAllPrivateChats().subscribe((chats) => {
      console.log('Fetched private chats:', chats);

      this.allPrivateChats = chats;
      this.filteredPrivateChats = this.allPrivateChats;  // Initially show all private chats
    },
    (error) => console.error('Error fetching private chats:', error));
    this.chatService.getGroupChat().subscribe((chats) => {
      this.groupChats = chats;
      console.log('Fetched group chat:', this.groupChats);

    });
    
  }

  filterChats() {
    if (this.searchTerm.trim() === '') {
      // If there's no search term, reset to show all private chats
      this.filteredPrivateChats = this.allPrivateChats;
    } else {
      const searchLower = this.searchTerm.toLowerCase();  // Convert search term to lowercase
      this.filteredPrivateChats = this.allPrivateChats.filter(chat => {
        const participantNames = chat.participants
          .map((participant: any) => participant.username.toLowerCase());
        return participantNames.some((name: any) => name.includes(searchLower));
      });
    }
  }

  togglePersonalChats(): void {
    this.showPersonalChats = !this.showPersonalChats;
    if (this.showPersonalChats) {
      this.fetchPersonalChats();
    } else {
      this.fetchRecentChats(); // Show recent chats when toggling back
    }
  }

  toggleGroupChats() {
    this.showGroupChats = !this.showGroupChats;
  
    if (this.showGroupChats) {
      this.chatService.getGroupChat().subscribe(
        (groupChat) => {
          this.groupChats = [groupChat]; // Only one group chat, so we wrap it in an array
        },
        (error) => {
          console.error('Error fetching group chat:', error);
        }
      );
    } else {
      this.loadRecentChats(); // Go back to recent chats if group chats are toggled off
    }
    
  }
  

  fetchRecentChats(): void {
    console.log('Fetching recent chats');

    this.chatService.getRecentChats().subscribe((chats) => {
      this.recentChats = chats;
      this.isLoading = false;

    });

  }

  fetchPersonalChats(): void {
    this.chatService.getPersonalChats().subscribe((chats) => {
      this.personalChats = chats;
    });
  }

  fetchGroupChats(): void {
    this.chatService.getGroupChat().subscribe((chats) => {
      this.groupChats = chats;
    });
  }
  loadPersonalChats(): void {
    this.chatService.getPersonalChats().subscribe(
      (chats) => {
        this.personalChats = chats;
        this.recentChats = this.recentChats.concat(chats); // Combine personal chats with recentChats

      },
      (error) => {
        console.error('Failed to load personal chats:', error);
      }
    );
  }

  

  loadGroupChat() {
    this.chatService.getGroupChat().subscribe((groupChat: any) => {
      this.groupChat = groupChat;
    });
  }
  

  openChat(chatId: string, chatType: string,chatAvatar: any, chatName: any) {
    this.selectedChatId = chatId; // Set the selected chat ID

    // Mark the chat as read once opened
    const chat = this.recentChats.find(chat => chat._id === chatId);
    if (chat) {
      chat.hasNewMessage = false;  // Reset new message flag when opened
    }

    // Emit the selected chat ID and type
    this.chatSelected.emit({ chatId, chatType,chatAvatar,chatName });
    console.log('Chat selected:', chatId, chatType);
  }
  
  
  // Load recent chats from the chat service
  // sidebar.component.ts
  loadRecentChats() {

    this.chatService.getRecentChats().subscribe(
      (chats) => {
        this.recentChats = this.removeDuplicates(chats);
        console.log('Loaded recent chats:', this.recentChats); // Log fetched chats

      },
      (error) => {
        console.error('Failed to load recent chats: ', error);

      } 
    );
    this.recentChats.forEach(chat => {
      this.socketService.joinChat(chat._id);
    });

  }

  createOrJoinPersonalChat(): void {
    if (!this.newChatEmail) return; // Ensure the input is not empty

    this.chatService.createOrJoinPersonalChatByEmail(this.newChatEmail).subscribe(
      (chat) => {
        // Add the new or existing chat to the chat list
        this.recentChats.unshift(chat);
        this.showModal = false; // Close the modal
        this.newChatEmail = ''; // Clear the input
        setTimeout(() => {
            window.location.reload();  // Refresh the page to reinitialize the app
          }, 1);
      },
      (error) => {
        console.error('Error creating or joining chat:', error);
      }
    );
  }

  // Determine chat name based on participants
  getChatName(chat: any): string {
    // If it's a group chat, show the chat name; otherwise, show the other participant's name
    if (chat.participants.length > 2) {
      return chat.name || 'Group Chat';
    } else {
      const otherParticipant = chat.participants.find((p: any) => p._id !== localStorage.getItem('userId'));
      return otherParticipant ? otherParticipant.username : 'Unknown User';
    }
  }

 
  
  // Navigate to a specific chat
  navigateToPersonalChats() {
    this.chatService.getAllPrivateChats().subscribe(
      (chats) => {
        this.allPrivateChats = chats; // Assuming chats is the response from the service
      },
      (error) => {
        console.error('Error fetching private chats:', error);
      }
    );
  }


  // Navigate to group chats
  navigateToGroupChats(): void {
    this.showAllPrivateChats = false;
    this.loadGroupChat();
  }

  // Navigate to personal chats
  
  // Logout function
  logout(): void {
    localStorage.removeItem('userId');
    this.router.navigate(['/login']);
    this.authService.logout();

  }
  togglePrivateChats() {
    this.showAllPrivateChats = !this.showAllPrivateChats;
    if (this.showAllPrivateChats) {
      this.loadAllPrivateChats();
    } else {
      this.loadRecentChats();
    }
  }

  loadPrivateChats() {
    this.chatService.getAllPrivateChats().subscribe(
      (chats) => {
        this.allPrivateChats = chats;
      },
      (error) => {
        console.error('Failed to load private chats: ', error);
      }
    );
  }
  
    navigateToRecentChats() {
      this.chatService.getRecentChats().subscribe(
        (chats) => {
          this.recentChats = chats; // Assuming chats is the response from the service
        },
        (error) => {
          console.error('Error fetching recent chats:', error);
        }
      );
    }

    removeDuplicates(chats: any[]): any[] {
      return chats.filter((chat, index, self) =>
        index === self.findIndex((c) => c._id === chat._id)
      );
    }
  
  

  // Navigate to settings
  goToSettings(): void {
    this.router.navigate(['/settings']);
  }


  selectChat(chatId: string, chatType: string) {
    this.selectedChatId = chatId;
    this.socketService.joinChat(chatId);
    this.chatService.setSelectedChat(chatId, chatType);
  }


getProfileImage(participants: any[]): string {
  let otherParticipant = participants.find(p => p._id !== this.authService.getUserId());
  if (otherParticipant){
    return otherParticipant?.profilePicture || 'assets/default-avatar.png'; // Default avatar if no profile picture

  }
  return otherParticipant= 'https://th.bing.com/th?id=OIP.JzfMMdGGxHVW3zepnVulsgHaHw&w=244&h=255&c=8&rs=1&qlt=90&o=6&pid=3.1&rm=2'
}

getParticipantName(participants: any[]): string {
  const otherParticipant = participants.find(p => p._id !== this.authService.getUserId());
  return otherParticipant?.username || 'Unknown';
}


loadAllPrivateChats(): void {
  this.chatService.getAllPrivateChats().subscribe(
    (chats) => {
      this.allPrivateChats = this.removeDuplicates(chats);
    },
    (error) => {
      console.error('Failed to load all private chats:', error);
    }
  );
}

}