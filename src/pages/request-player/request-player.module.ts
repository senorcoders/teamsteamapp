import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { RequestPlayerPage } from './request-player';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [
    RequestPlayerPage,
  ],
  imports: [
    IonicPageModule.forChild(RequestPlayerPage),
    TranslateModule.forChild()
  ],
})
export class RequestPlayerPageModule {}
