import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable,BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';
import { response } from 'express';
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUser = new BehaviorSubject<any>(null);  // Observable holding user info
  currentUser$ = this.currentUser.asObservable();
  private isAuthenticated = false
  private apiUrl = 'http://localhost:3001/api/auth';
  constructor(private http : HttpClient, 
    private router: Router) { }

    setUser(user: any) {
      this.currentUser.next(user);
    }
  
    // Clear user data on logout
    clearUser() {
      this.currentUser.next(null);
    }
  
    // Get the current user value
    getUser() {
      return this.currentUser.value;
    }
    getUserProfile(userId : any ): Observable<any> {
      return this.http.post(`${this.apiUrl}/profile`, { userId });
  }

  checkEmailExists(email: string) {
    return this.http.post(`${this.apiUrl}/checkEmail`, { email });
  }
  
  updateUserProfile(profileData: any): Observable<any> {
    const userId = this.getUserId();
    return this.http.put(`${this.apiUrl}/profile/${userId}`, profileData);
  }
  
    updateProfilePicture(formData: FormData): Observable<any> {
      const userId = this.getUserId();
      return this.http.put(`${this.apiUrl}/profile/${userId}`, formData);
    }

    login(email: string, password: string): Observable<any> {
      return new Observable(observer => {
        this.http.post(`${this.apiUrl}/login`, { email, password }).subscribe(
          (response: any) => {
            localStorage.setItem('userId', response.userId); // Store the user ID
            localStorage.setItem('userEmail', response.email); // Store the user email
            this.isAuthenticated = true;
            observer.next(response);
            observer.complete();
          },
          (error) => {
            this.isAuthenticated = false;
            observer.error(error);
          }
        );
      });
    }

    getUserEmail(): string | null {
      return localStorage.getItem('userEmail');
    }

    signup(username: string, email: string, password: string): Observable<any> {
      return this.http.post(`${this.apiUrl}/signup`, { username, email, password });
    }
  
    // Method to logout the user
    logout(): void {
      localStorage.removeItem('userId');
      localStorage.removeItem('userEmail');
      this.isAuthenticated = false;
      this.router.navigate(['/login']);
    }
  
    // Method to check if the user is authenticated
    checkAuthentication(): boolean {
      return !!localStorage.getItem('userId');
    }
  
    // Method to get the current user ID
    getUserId(): string | null {
      return localStorage.getItem('userId');
    }

    getCurrentUserId(): string {
      // Example: return the user ID stored in localStorage or retrieved from your authentication logic
      return localStorage.getItem('userId') || '';  // Adjust based on your app's logic
    }

}
