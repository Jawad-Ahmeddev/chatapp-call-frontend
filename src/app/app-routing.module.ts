import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { SignupComponent } from './signup/signup.component';
import { ProfileComponent } from './profile/profile.component';
import { SettingsComponent } from './settings/settings.component';
import { AuthGuardService } from './core/services/auth-guard.service';
import { MainChatComponent } from './main-chat/main-chat.component';
import { CallScreenComponentComponent } from './call-screen-component/call-screen-component.component';
const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  { path: 'profile', component: ProfileComponent , canActivate: [AuthGuardService] },
  { path: 'settings', component: SettingsComponent , canActivate: [AuthGuardService] },
  { path: 'chat', component: MainChatComponent, canActivate: [AuthGuardService], children: [
    { path: 'personal/:id', component: MainChatComponent }, // Personal chat route
    { path: 'group/:id', component: MainChatComponent } // Group chat route
  ]},
  { path: 'call', component: CallScreenComponentComponent },  // New route for the call screen,

  { path: '**', redirectTo: '/login' } 
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
