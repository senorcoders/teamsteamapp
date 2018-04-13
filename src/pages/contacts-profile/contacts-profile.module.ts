import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ContactsProfilePage } from './contacts-profile';

@NgModule({
  declarations: [
    ContactsProfilePage,
  ],
  imports: [
    IonicPageModule.forChild(ContactsProfilePage),
  ],
})
export class ContactsProfilePageModule {}
