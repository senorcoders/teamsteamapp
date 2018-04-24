import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { PaymentSubscripcionPage } from './payment-subscripcion';

@NgModule({
  declarations: [
    PaymentSubscripcionPage,
  ],
  imports: [
    IonicPageModule.forChild(PaymentSubscripcionPage),
  ],
})
export class PaymentSubscripcionPageModule {}
