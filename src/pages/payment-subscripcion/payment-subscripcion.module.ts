import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { PaymentSubscripcionPage } from './payment-subscripcion';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [
    PaymentSubscripcionPage,
  ],
  imports: [
    IonicPageModule.forChild(PaymentSubscripcionPage),
    TranslateModule.forChild()
  ],
})
export class PaymentSubscripcionPageModule {}
