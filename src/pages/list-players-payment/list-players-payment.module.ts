import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ListPlayersPaymentPage } from './list-players-payment';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [
    ListPlayersPaymentPage,
  ],
  imports: [
    IonicPageModule.forChild(ListPlayersPaymentPage),
    TranslateModule.forChild()
  ],
})
export class ListPlayersPaymentPageModule {}
