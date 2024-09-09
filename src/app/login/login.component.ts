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

  constructor(
    private fb: FormBuilder,
    private userService: UserServiceService,
    private router: Router,
    private authService : AuthService
  ){}
  
  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
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
  console.log('Form submitted:', this.loginForm.value);
    if (this.loginForm.valid) {
      const { email, password } = this.loginForm.value;
      this.authService.login(email, password).subscribe(
        (response) => {
          localStorage.setItem('userId', response.userId); // Store the user ID
          this.router.navigate(['/chat']); // Ensure this path matches the route for MainChatComponent
        },
        (error) => {
          console.error('Login failed:', error);
        }
      );
    }
  }
}
