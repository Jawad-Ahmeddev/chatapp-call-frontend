import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-chatwindow-loader',
  templateUrl: './chatwindow-loader.component.html',
  styleUrls: ['./chatwindow-loader.component.css']
})
export class ChatwindowLoaderComponent {
@Input() loading : boolean = false; 
}
