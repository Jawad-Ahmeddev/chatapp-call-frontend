import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-sidebar-loader',
  templateUrl: './sidebar-loader.component.html',
  styleUrls: ['./sidebar-loader.component.css']
})
export class SidebarLoaderComponent {

  @Input() loading: boolean = false;}
