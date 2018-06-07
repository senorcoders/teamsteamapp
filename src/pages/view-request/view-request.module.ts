import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ViewRequestPage } from './view-request';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [
    ViewRequestPage,
  ],
  imports: [
    IonicPageModule.forChild(ViewRequestPage),
    TranslateModule.forChild()
  ],
})
export class ViewRequestPageModule {}
