import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { AddFamilyPage } from './add-family';

@NgModule({
  declarations: [
    AddFamilyPage,
  ],
  imports: [
    IonicPageModule.forChild(AddFamilyPage),
  ],
})
export class AddFamilyPageModule {}
