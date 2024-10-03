import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
@Injectable({
  providedIn: 'root'
})
export class UserServiceService {
  private apiUrl = 'http://localhost:3001/api/auth'; // Base URL for your backend's auth routes

  
  constructor(private http: HttpClient, 
    private authService : AuthService) {}

  // Method to get the user profile by user ID
  getUserProfile(userId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/profile`, { userId });
}


  
  // Method to login a user
  login(email: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, { email, password });
  }

  // Method to signup a new user
  signup(username: string, email: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/signup`, { username, email, password });
  }

  // Method to logout a user (simplified)
  logout(): void {
    // Clear any stored user data (e.g., session-based data)
    localStorage.removeItem('userId');
    console.log('User logged out');
  }

  // Method to check if the user is authenticated (simple version)
  isAuthenticated(): boolean {
    // This is a placeholder; you might want to check session or cookie data
    return !!localStorage.getItem('userId');
  }
  getUserId(): string | null {
    return localStorage.getItem('userId');
  }

  updateProfilePicture(data: FormData): Observable<any> {
    const userId = this.authService.getUserId();
    return this.http.put(`${this.apiUrl}/profile/${userId}`, data);
}

updateUserProfile(data: any): Observable<any> {
  const userId = this.authService.getUserId();
  return this.http.put(`${this.apiUrl}/profile/${userId}`, data);
}


}

