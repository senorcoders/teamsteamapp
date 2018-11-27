import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { AdminCreateOwnerLeaguePage } from './admin-create-owner-league';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [
    AdminCreateOwnerLeaguePage,
  ],
  imports: [
    IonicPageModule.forChild(AdminCreateOwnerLeaguePage),
    TranslateModule.forChild()
  ],
})
export class AdminCreateOwnerLeaguePageModule {}
