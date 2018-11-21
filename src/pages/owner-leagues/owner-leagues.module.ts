import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { OwnerLeaguesPage } from './owner-leagues';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [
    OwnerLeaguesPage,
  ],
  imports: [
    IonicPageModule.forChild(OwnerLeaguesPage),
    TranslateModule.forChild()
  ],
})
export class OwnerLeaguesPageModule {}
