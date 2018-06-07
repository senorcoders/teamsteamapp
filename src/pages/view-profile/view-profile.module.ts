import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ViewProfilePage } from './view-profile';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [
    ViewProfilePage,
  ],
  imports: [
    IonicPageModule.forChild(ViewProfilePage),
    TranslateModule.forChild()
  ],
})
export class ViewProfilePageModule {}
