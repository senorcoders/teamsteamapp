import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CheckPaidPage } from './check-paid';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [
    CheckPaidPage,
  ],
  imports: [
    IonicPageModule.forChild(CheckPaidPage),
    TranslateModule.forChild()
  ],
})
export class CheckPaidPageModule {}
