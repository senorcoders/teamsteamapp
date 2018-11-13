import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { AddFamilyPage } from './add-family';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [
    AddFamilyPage,
  ],
  imports: [
    IonicPageModule.forChild(AddFamilyPage),
    TranslateModule.forChild()
  ],
})
export class AddFamilyPageModule {}
