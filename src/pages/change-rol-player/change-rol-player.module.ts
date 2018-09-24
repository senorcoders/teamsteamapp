import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ChangeRolPlayerPage } from './change-rol-player';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [
    ChangeRolPlayerPage,
  ],
  imports: [
    IonicPageModule.forChild(ChangeRolPlayerPage),
    TranslateModule.forChild()
  ],
})
export class ChangeRolPlayerPageModule {}
