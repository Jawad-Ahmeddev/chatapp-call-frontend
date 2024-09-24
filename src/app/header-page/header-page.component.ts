import { Component, HostListener, OnInit } from '@angular/core';
import { Route, Router } from '@angular/router';
import { AuthService } from '../core/services/auth.service';
import { UserServiceService } from '../core/services/user-service.service';
@Component({
  selector: 'app-header-page',
  templateUrl: './header-page.component.html',
  styleUrls: ['./header-page.component.css']
})
export class HeaderPageComponent implements OnInit{
  public isDropDownOpen = false; 
  public userId : string= '';
  public userProfile: any;

  constructor(
    private authService: AuthService,
    private userService: UserServiceService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadUserProfile();
  }

    toggleDropdown(){
      this.isDropDownOpen= !this.isDropDownOpen; 
  }

  loadUserProfile(): void {
    this.userId = this.authService.getCurrentUserId()
    this.userService.getUserProfile(this.userId).subscribe(
      (profile) => {
        this.userProfile = profile;
      },
      (error) => {
        console.error('Failed to load user profile:', error);
      }
    );
  }
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent){
    const targetElement = event.target as HTMLElement; 
    if(!targetElement.closest('.profile_dropdown')){
      this.isDropDownOpen= false;
    }
  }

  goToProfile(){
    this.router.navigate(['/profile']);
  }
  
  goToSetting(){
    this.router.navigate(['/settings'])
  }

  logout(): void {
    this.authService.logout();
  }

  logoClicked(){
    this.router.navigate(['/chat'])
  }

}
