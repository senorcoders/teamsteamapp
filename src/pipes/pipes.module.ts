import { NgModule } from '@angular/core';
import { RelativeTimePipe } from './relative-time/relative-time';
import { PlacePipe } from './place/place';
@NgModule({
	declarations: [PlacePipe/*RelativeTimePipe*/],
	imports: [],
	exports: [PlacePipe/*RelativeTimePipe*/]
})
export class PipesModule {}
