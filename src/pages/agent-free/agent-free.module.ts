import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { AgentFreePage } from './agent-free';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [
    AgentFreePage,
  ],
  imports: [
    IonicPageModule.forChild(AgentFreePage),
    TranslateModule.forChild()
  ],
})
export class AgentFreePageModule {}
