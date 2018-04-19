import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ViewRequestsPage } from './view-requests';

@NgModule({
  declarations: [
    ViewRequestsPage,
  ],
  imports: [
    IonicPageModule.forChild(ViewRequestsPage),
  ],
})
export class ViewRequestsPageModule {}
