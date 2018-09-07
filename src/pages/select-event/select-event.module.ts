import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SelectEventPage } from './select-event';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [
    SelectEventPage,
  ],
  imports: [
    IonicPageModule.forChild(SelectEventPage),
    TranslateModule.forChild()
  ],
})
export class SelectEventPageModule {}
