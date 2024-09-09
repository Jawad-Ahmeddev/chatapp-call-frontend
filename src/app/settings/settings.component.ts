import { Component , OnInit} from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {
  currentTheme!: string;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.loadTheme();
  }

  // Load the current theme from localStorage or default to 'light'
  loadTheme(): void {
    this.currentTheme = localStorage.getItem('theme') || 'light';
    this.applyTheme(this.currentTheme);
  }

  // Change the theme and save it to localStorage
  changeTheme(theme: string): void {
    this.currentTheme = theme;
    localStorage.setItem('theme', theme);
    this.applyTheme(theme);
  }

  // Apply the selected theme by adding a class to the body
  applyTheme(theme: string): void {
    document.body.classList.remove('light-theme', 'dark-theme');
    document.body.classList.add(`${theme}-theme`);
  }

  // Handle user logout
  logout(): void {
    localStorage.removeItem('userId');
    this.router.navigate(['/login']);
  }
}