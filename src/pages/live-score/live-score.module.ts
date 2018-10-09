import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { LiveScorePage } from './live-score';
import { TranslateModule } from '@ngx-translate/core';
import { PipesModule } from '../../pipes/pipes.module';

@NgModule({
  declarations: [
    LiveScorePage,
  ],
  imports: [
    IonicPageModule.forChild(LiveScorePage),
    TranslateModule.forChild(),
    PipesModule
  ],
})
export class LiveScorePageModule {}
