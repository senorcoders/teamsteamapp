import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ViewPlayerPage } from './view-player';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [
    ViewPlayerPage,
  ],
  imports: [
    IonicPageModule.forChild(ViewPlayerPage),
    TranslateModule.forChild()
  ],
})
export class ViewPlayerPageModule {}
