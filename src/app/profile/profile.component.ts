import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserServiceService } from '../core/services/user-service.service';
import { Router } from '@angular/router';
import { AuthService } from '../core/services/auth.service';
@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  profileForm!: FormGroup;
  userProfile: any = {}; // Initialize as an empty object
  selectedFile: File | null = null;
  userId : any = '';
  isLoading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private userService: UserServiceService,
    private router: Router,
    private authService : AuthService
  ) {
  }

  ngOnInit(): void {
    this.profileForm = this.fb.group({
        username: [this.userProfile?.username, Validators.required],
        email: [this.userProfile?.email, [Validators.required, Validators.email]]
    });

    this.loadUserProfile();
}

  // Load user profile data

  loadUserProfile(): void {
    this.isLoading = true;

    this.userId = this.authService.getUserId();
    this.userService.getUserProfile(this.userId).subscribe(
        (profile) => {
            this.userProfile = profile;
            this.profileForm.patchValue({
                username: profile.username,
                email: profile.email
            });
            this.isLoading = false;

        },
        (error) => {
            console.error('Error loading profile', error);
            this.isLoading = false;

        }
    );
}


  // Handle profile picture file selection
  onProfilePictureSelected(event: any): void {
    const file: File = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e: any) => {
            this.userProfile.profilePicture = e.target.result;
        };
        reader.readAsDataURL(file);
    }
}


  uploadProfilePicture(file: File): void {
    const formData = new FormData();
    formData.append('profilePicture', file);

    this.userService.updateProfilePicture(formData).subscribe(
      (response) => {
        this.userProfile.profilePicture = response.profilePicture; // Update the profile picture in the UI
        console.log('Profile picture updated successfully');
      },
      (error) => {
        console.error('Failed to update profile picture', error);
      }
    );
  }
  onFileSelected(event: any): void {
    const file: File = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e: any) => {
            this.userProfile.profilePicture = e.target.result;
        };
        reader.readAsDataURL(file);
    }
}


onSubmit(): void {
  if (this.profileForm.valid) {
      const updatedProfile = {
          username: this.profileForm.get('username')?.value,
          email: this.profileForm.get('email')?.value,
          profilePicture: this.userProfile.profilePicture // Include the profile picture
      };

      this.userService.updateUserProfile(updatedProfile).subscribe(
          (response) => {
              console.log('Profile updated successfully', response);
              this.userProfile = response.user; // Update the UI with the new profile data
              
          },
          (error) => {
              console.error('Failed to update profile', error);
          }
      );
  }
}


  // Trigger the file input click
  triggerProfilePictureInput(): void {
    document.getElementById('profilePictureInput')?.click();
  }

  // Check if a form control is invalid and has been touched
 
  isControlInvalid(controlName: string):boolean{
    const control = this.profileForm.get(controlName);
     return !!control?.invalid && control?.touched;
  }
  // Handle form submission

}