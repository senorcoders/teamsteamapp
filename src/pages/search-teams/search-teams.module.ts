import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SearchTeamsPage } from './search-teams';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [
    SearchTeamsPage,
  ],
  imports: [
    IonicPageModule.forChild(SearchTeamsPage),
    TranslateModule.forChild()
  ],
})
export class SearchTeamsPageModule {}
