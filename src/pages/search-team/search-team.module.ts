import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SearchTeamPage } from './search-team';

@NgModule({
  declarations: [
    SearchTeamPage,
  ],
  imports: [
    IonicPageModule.forChild(SearchTeamPage),
  ],
})
export class SearchTeamPageModule {}
