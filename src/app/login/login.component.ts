import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { UserServiceService } from '../core/services/user-service.service';
import { AuthService } from '../core/services/auth.service';
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit{
  loginForm!: FormGroup;
  showPassword = false;
  errorMessage = ''; // For error handling
  

  constructor(
    private fb: FormBuilder,
    private userService: UserServiceService,
    private router: Router,
    private authService : AuthService
  ){}
  
  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['',[ Validators.required, Validators.minLength(6)]]
    });
  }

  // Toggle password visibility for password field
  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  // Check if a form control is invalid and has been touched
  isControlInvalid(controlName: string): boolean {
    const control = this.loginForm.get(controlName);
    return control!.invalid && control!.touched;
  }
  
  // Handle form submission
  onSubmit(): void {
    console.log("I am in login from")
    if (this.loginForm.invalid) {
      // Apply shake animation for invalid form
      this.addShakeAnimation();
      this.errorMessage = 'Please enter valid credentials.';
      return;
    }
  console.log('Form submitted:', this.loginForm.value);
    if (this.loginForm.valid) {
      const { email, password } = this.loginForm.value;
      this.authService.login(email, password).subscribe(
        (response) => {
          this.errorMessage = '';

          this.addSuccessAnimation();
          localStorage.setItem('userId', response.userId); // Store the user ID
          this.authService.getUserProfile(response.userId).subscribe(
            (profile) => {
              let userProfile = profile;
              this.authService.setUser(userProfile)
            },
            (error) => {
              console.error('Failed to load user profile:', error);
            }
          );
          this.router.navigate(['/chat']); // Ensure this path matches the route for MainChatComponent

          // setTimeout(() => {
          //   window.location.reload();  // Refresh the page to reinitialize the app
          // }, 1);
        },
        (error) => {
          this.errorMessage = 'Invalid email or password';

          console.error('Login failed:', error);
          this.addShakeAnimation();  // Apply shake animation for incorrect login

        }
      );
    }
  }
  addShakeAnimation(): void {
    const form = document.querySelector('.login-form-wrapper');
    form?.classList.add('shake-animation');
    setTimeout(() => {
      form?.classList.remove('shake-animation');
    }, 500); // Remove the animation class after 0.5 seconds
  }

  addSuccessAnimation(): void {
    const form = document.querySelector('.login-form-wrapper');
    form?.classList.add('success-animation');
  }
 
}
