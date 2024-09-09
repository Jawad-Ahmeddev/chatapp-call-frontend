import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule, Routes } from '@angular/router';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HeaderPageComponent } from './header-page/header-page.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { LoginComponent } from './login/login.component';
import { SignupComponent } from './signup/signup.component';
import { ProfileComponent } from './profile/profile.component';
import { SettingsComponent } from './settings/settings.component';
import { ChatServiceService } from './core/services/chat-service.service';
import { SidebarComponent } from './sidebar/sidebar.component';
import { ChatWindowComponent } from './main-chat/chat-window/chat-window.component';
import { ChatInputComponent } from './main-chat/chat-input/chat-input.component';
import { ChatMessageComponent } from './shared/components/chat-message/chat-message.component';
import { MainChatComponent } from './main-chat/main-chat.component';
import { SharedComponent } from './shared/shared.component';
import { CoreComponent } from './core/core.component';
import { ComponentsComponent } from './shared/components/components.component';
import { DirectivesComponent } from './shared/directives/directives.component';
import { PickerComponent } from '@ctrl/ngx-emoji-mart';

@NgModule({
  declarations: [
    AppComponent,
    HeaderPageComponent,
    LoginComponent,
    SignupComponent,
    ProfileComponent,
    SettingsComponent,
    SidebarComponent,
    ChatWindowComponent,
    ChatInputComponent,
    ChatMessageComponent,
    MainChatComponent,
    SharedComponent,
    CoreComponent,
    ComponentsComponent,
    DirectivesComponent,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    // RouterModule.forRoot(appRoutes),
    BrowserAnimationsModule, // Only if using Angular Material
    MatButtonModule, // Only if using Angular Material
    MatInputModule, // Only if using Angular Material
    MatIconModule, // Only if using Angular Material
    FontAwesomeModule ,// For 
    AppRoutingModule, 
    PickerComponent
    
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
