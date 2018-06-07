import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { EditFamilyPage } from './edit-family';

@NgModule({
  declarations: [
    EditFamilyPage,
  ],
  imports: [
    IonicPageModule.forChild(EditFamilyPage),
  ],
})
export class EditFamilyPageModule {}
