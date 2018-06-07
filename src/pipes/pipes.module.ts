import { NgModule } from '@angular/core';
import { RelativeTimePipe } from './relative-time/relative-time';
import { PlacePipe } from './place/place';
import { CDVPhotoLibraryPipe } from './cdvphotolibrary/cdvphotolibrary.pipe';
@NgModule({
	declarations: [PlacePipe, RelativeTimePipe, CDVPhotoLibraryPipe],
	imports: [],
	exports: [PlacePipe, RelativeTimePipe, CDVPhotoLibraryPipe]
})
export class PipesModule {}
