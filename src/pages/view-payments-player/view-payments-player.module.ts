import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ViewPaymentsPlayerPage } from './view-payments-player';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [
    ViewPaymentsPlayerPage,
  ],
  imports: [
    IonicPageModule.forChild(ViewPaymentsPlayerPage),
    TranslateModule.forChild()
  ],
})
export class ViewPaymentsPlayerPageModule {}
