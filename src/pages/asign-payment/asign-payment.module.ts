import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { AsignPaymentPage } from './asign-payment';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [
    AsignPaymentPage,
  ],
  imports: [
    IonicPageModule.forChild(AsignPaymentPage),
    TranslateModule.forChild()
  ],
})
export class AsignPaymentPageModule {}
