import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ViewsEventPage } from './views-event';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [
    ViewsEventPage,
  ],
  imports: [
    IonicPageModule.forChild(ViewsEventPage),
    TranslateModule.forChild()
  ],
})
export class ViewsEventPageModule {}
