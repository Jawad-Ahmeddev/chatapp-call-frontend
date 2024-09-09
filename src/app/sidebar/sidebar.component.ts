import { Component , OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ChatServiceService } from '../core/services/chat-service.service';
import {  Output} from '@angular/core';
import { EventEmitter } from '@angular/core';
import { AuthService } from '../core/services/auth.service';
@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {
  personalChats: any[] = [];
  groupChat: any = null;
  recentChats: any[] = []; // Define recentChats here
  newChatEmail: string = ''; // Holds the email for the new chat
  showModal: boolean = false; // Controls modal visibility
  userId: any;
  public showAllPrivateChats = false; // Toggle flag
  public allPrivateChats: any[] = [];

  @Output() chatSelected = new EventEmitter<{ chatId: string, chatType: string }>();

  constructor(
    private chatService: ChatServiceService,
    private router: Router,
    private authService : AuthService

  ) {}

  ngOnInit(): void {
    this.userId = this.authService.getUserId() || '';
    this.loadRecentChats();
    this.loadAllPrivateChats();
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

  loadGroupChat(): void {
    
    this.chatService.getGroupChat().subscribe(
      (chat) => {
        this.groupChat = chat;
        this.recentChats.push(chat); // Add group chat to recentChats

      },
      (error) => {
        console.error('Failed to load group chat:', error);
      }
    );
  }

  openChat(room: string, type: string) {
    if (room) {
      console.log('Chat clicked:', room, type);
      this.chatSelected.emit({ chatId: room, chatType: type });
    } else {
      console.error('Room ID is undefined for this chat. Please check if the data is being fetched correctly.');
    }
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
  }

  createOrJoinPersonalChat(): void {
    if (this.newChatEmail.trim()) {
      this.chatService.createOrJoinPersonalChatByEmail(this.newChatEmail).subscribe(
        (response) => {
          this.personalChats.push(response.room);

          this.loadRecentChats(); // Reload recent chats after creating a new chat
          this.newChatEmail = '';
          this.showModal = false;
          this.loadAllPrivateChats();

        },
        (error) => {
          console.error('Failed to create or join chat:', error);
        }
      );
    }
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
      this.loadPrivateChats();
    } else {
      this.loadRecentChats();
    }
  }

  loadPrivateChats() {
    this.chatService.getAllPrivateChats().subscribe(
      (chats) => {
        this.allPrivateChats = this.removeDuplicates(chats);
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
      // Use a Set to filter out duplicate chat room IDs or unique identifiers
      const uniqueChats = new Map();
      chats.forEach(chat => {
        if (!uniqueChats.has(chat.room)) {
          uniqueChats.set(chat.room, chat);
        }
      });
      return Array.from(uniqueChats.values());
    }
  
  

  // Navigate to settings
  goToSettings(): void {
    this.router.navigate(['/settings']);
  }


  selectChat(chatId: string, chatType: 'personal' | 'group'): void {
    this.chatSelected.emit({ chatId: chatId, chatType: chatType });
  }


getProfileImage(participants: any[]): string {
  const otherParticipant = participants.find(p => p._id !== this.authService.getUserId());
  return otherParticipant?.profilePicture || 'assets/default-avatar.png'; // Default avatar if no profile picture
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