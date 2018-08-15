import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SelectLeaguesPage } from './select-leagues';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [
    SelectLeaguesPage,
  ],
  imports: [
    IonicPageModule.forChild(SelectLeaguesPage),
    TranslateModule.forChild()
  ],
})
export class SelectLeaguesPageModule {}
