import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { RequestsPlayerPage } from './requests-player';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [
    RequestsPlayerPage,
  ],
  imports: [
    IonicPageModule.forChild(RequestsPlayerPage),
    TranslateModule.forChild()
  ],
})
export class RequestsPlayerPageModule {}
