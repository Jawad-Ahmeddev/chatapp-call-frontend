import { Component , OnInit} from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {
  currentTheme: string = 'light';

  constructor(private router: Router) {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      this.currentTheme = savedTheme;
      this.applyTheme(this.currentTheme);
    }
  }

  ngOnInit(): void {
    const savedTheme = localStorage.getItem('theme') || 'light';
    this.setTheme(savedTheme);
  }

    // Apply the selected theme by adding a class to the body
  applyTheme(theme: string) {
    if (theme === 'dark') {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
    }
  }
  // Load the current theme from localStorage or default to 'light'
  loadTheme(): void {
    this.currentTheme = localStorage.getItem('theme') || 'light';
    this.applyTheme(this.currentTheme);
  }

  // Change the theme and save it to localStorage
  changeTheme(theme: string) {
    this.setTheme(theme);
    localStorage.setItem('theme', theme);  // Save theme preference
  }

  setTheme(theme: string) {
    this.currentTheme = theme;
    if (theme === 'dark') {
      document.documentElement.classList.add('dark-theme');
    } else {
      document.documentElement.classList.remove('dark-theme');
    }
  }

  // Handle user logout
  logout(): void {
    localStorage.removeItem('userId');
    this.router.navigate(['/login']);
  }
}