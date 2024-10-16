import { Component,OnInit } from '@angular/core';
import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { environment } from 'src/environments/environment';
import { SocketService } from './core/services/socket.service';
import { AuthService } from './core/services/auth.service';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'frontend';
  userId: any
  constructor(private socketService: SocketService,
    private authService : AuthService){

  }
 
  ngOnInit() {
    this.userId = this.authService.getCurrentUserId();
    const firebaseConfig = {
      apiKey: "AIzaSyAmdlCrDZDKKnC5EzXGldPKIJkZi6YREn8",
      authDomain: "chat-notification-c4f7e.firebaseapp.com",
      projectId: "chat-notification-c4f7e",
      storageBucket: "chat-notification-c4f7e.appspot.com",
      messagingSenderId: "468614911686",
      appId: "1:468614911686:web:af387ad70c4035a608e9c7",
      measurementId: "G-VEGDM5HMYR"
    };

    // Initialize Firebase app
    const app = initializeApp(firebaseConfig);

    // Initialize Firebase Messaging and get the token
    const messaging = getMessaging(app);
    
    // Request permission and get the token
    getToken(messaging, { vapidKey: `BP65Bwdo50W1cJhaPacQ3pSEiuE65IRnKAtFf8t1mIgmdZ8ESznI-WFG4vgQdvtGQCTJE7FLzNDO4CyE9BG7oJk` }).then((currentToken) => {
      if (currentToken) {
        console.log("Token retrieved:", currentToken);
        this.socketService.sendTokenToServer(this.userId,currentToken);  // Send the token to the server

        // Send this token to your backend to save and use for sending push notifications
      } else {
        console.log('No registration token available. Request permission to generate one.');
      }
    }).catch((err) => {
      console.log('An error occurred while retrieving token. ', err);
    });

    // Handle incoming messages
    onMessage(messaging, (payload) => {
      console.log('Message received. ', payload);
      // Customize how you want to display the message
      const notificationTitle = payload.notification?.title;
      const notificationOptions = {
        body: payload.notification?.body,
        icon: 'https://mail.google.com/mail/u/0?ui=2&ik=0f675db839&attid=0.1&permmsgid=msg-a:r-785725266765602002&th=1926c79c3e3c0ab0&view=att&disp=safe&realattid=1926c799d3ff61999ff1', 
        badge: 'https://mail.google.com/mail/u/0?ui=2&ik=0f675db839&attid=0.1&permmsgid=msg-a:r-785725266765602002&th=1926c79c3e3c0ab0&view=att&disp=safe&realattid=1926c799d3ff61999ff1'
      };
      new Notification(notificationTitle || "New message", notificationOptions);
    });
  }
}
