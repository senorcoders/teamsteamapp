import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ViewRequestsPage } from './view-requests';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [
    ViewRequestsPage,
  ],
  imports: [
    IonicPageModule.forChild(ViewRequestsPage),
    TranslateModule.forChild()
  ],
})
export class ViewRequestsPageModule {}
