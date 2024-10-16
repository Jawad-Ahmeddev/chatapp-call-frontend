import { Component, OnInit } from '@angular/core';
import { Form, FormBuilder, FormGroup, Validators,AbstractControl  } from '@angular/forms';
import { Router } from '@angular/router';
import { UserServiceService } from '../core/services/user-service.service';
import { debounceTime, map, catchError } from 'rxjs/operators';
import { of } from 'rxjs'; // For error handling
import { AuthService } from '../core/services/auth.service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit {
  signupForm! : FormGroup;
  showPassword = false; 
  showConfirmPassword = false; 
  passwordStrengthClass = '';

  constructor(
    private fb: FormBuilder, 
    private userService : UserServiceService, 
    private router : Router, 
    private authService : AuthService
  ){}
  
  ngOnInit(): void {
    this.signupForm = this.fb.group({
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email],[this.emailValidator.bind(this)]],
      password: ['', Validators.required],
      confirmPassword: ['', Validators.required]
    }, {
      validators: this.passwordMatchValidator
    });
    // this.signupForm.valueChanges.pipe(debounceTime(300)).subscribe(() => {
    //   if (this.signupForm.invalid) {
    //     this.signupForm.markAllAsTouched();
    //   }
    // });
  }

  emailValidator(control: AbstractControl) {
    return new Promise((resolve, reject) => {
      this.authService.checkEmailExists(control.value).subscribe(
        (response) => {
          resolve(null); // Email is available
        },
        (error) => {
          if (error.status === 400) {
            resolve({ emailTaken: true }); // Email is taken
          } else {
            resolve(null); // Other errors
          }
        }
      );
    });
  }
  passwordMatchValidator(form : FormGroup):any{
    const password = form.get('password')?.value; 
    const confirmPassword = form.get('confirmPassword')?.value;
    return password === confirmPassword? null: {passwordMismatch : true};
  }

  togglePasswordVisibility(){
    this.showPassword= !this.showPassword;
  }
  toggleConfirmPasswordVisibility(){
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  onPasswordInput(){
    const password = this.signupForm.get('password')?.value; 
    this.passwordStrengthClass= this.calculatePasswordStrength(password);
  }

  calculatePasswordStrength(password: string): string {
    let strength = 0;
    if (password.length >= 6) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[\W]/.test(password)) strength++;

    if (strength <= 2) {
      return 'weak';
    } else if (strength === 3 || strength === 4) {
      return 'medium';
    } else {
      return 'strong';
    }
  }

  isControlInvalid(controlName: string): boolean {
    const control = this.signupForm.get(controlName);
    return control!.invalid && control!.touched;
  }

  // Handle form submission
  onSubmit() {
    this.router.navigate(['/login'])

    if (this.signupForm.valid) {
      const { username, email, password } = this.signupForm.value;
      this.userService.signup(username, email, password).subscribe(
        (response) => {
          // Navigate to the login page after successful signup
          console.log('signup successfull')
        },
        (error) => {
          // Handle signup error (e.g., show a message to the user)
          console.error('Signup error:', error);
        }
      );
    }
  }


}