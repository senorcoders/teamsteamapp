import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { PaymentMonthlyPage } from './payment-monthly';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [
    PaymentMonthlyPage,
  ],
  imports: [
    IonicPageModule.forChild(PaymentMonthlyPage),
    TranslateModule.forChild()
  ],
})
export class PaymentMonthlyPageModule {}
