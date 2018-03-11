import { Component, NgZone } from '@angular/core';
import { ChangeDetectorRef } from '@angular/core';
import { Platform, InfiniteScroll } from 'ionic-angular';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { ToastController, ModalController } from 'ionic-angular';

import { PermissionsPage } from '../permissions/permissions';
import { ItemDetailsPage } from '../item-details/item-details';

import { PhotoLibrary, LibraryItem } from '@ionic-native/photo-library';

const THUMBNAIL_WIDTH = 250;
const THUMBNAIL_HEIGHT = 150;

/**
 * Generated class for the LibraryImagesPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-library-images',
  templateUrl: 'library-images.html',
})
export class LibraryImagesPage {

  thumbnailWidth = THUMBNAIL_WIDTH + 'px';
  thumbnailHeight = THUMBNAIL_HEIGHT + 'px';
  library;

  public resolve:Function;
  public reject:Function;
  public listMaster=[];

  private start:number=0;
  private end:number=10;

  private width:number;
  private height:number;

  constructor(public navCtrl: NavController,
    private photoLibrary: PhotoLibrary, private platform: Platform, private cd: ChangeDetectorRef,
    private toastCtrl: ToastController, private modalCtrl: ModalController, public navParams: NavParams,
  public zone: NgZone) {
      this.resolve = this.navParams.get('resolve');
      this.reject = this.navParams.get('reject');
      this.width = this.navParams.get("width");
      this.height = this.navParams.get("height");

      this.library = [];
      this.fetchPhotos();
  }

  fetchPhotos() {

    this.platform.ready().then(() => {

      this.library = [];
      this.listMaster = [];

      this.photoLibrary.getLibrary({ thumbnailWidth: THUMBNAIL_WIDTH, thumbnailHeight: THUMBNAIL_HEIGHT, quality: 0.3/*, chunkTimeSec: 0.3*/ }).subscribe({
        next: (chunk) => {
          this.listMaster = this.listMaster.concat(chunk);
        },
        error: (err: string) => {
          if (err.startsWith('Permission')) {

            let permissionsModal = this.modalCtrl.create(PermissionsPage);
            permissionsModal.onDidDismiss(() => {
              // retry
              this.fetchPhotos();
            });
            permissionsModal.present();

          } else { // Real error
            let toast = this.toastCtrl.create({
              message: `getLibrary error: ${err}`,
              duration: 6000,
            });
            toast.present();
          }
        },
        complete: () => {
          // Library completely loaded
          this.library = this.listMaster.slice(this.start, this.end); // To take top 10 images
          this.cd.detectChanges();
          this.start = this.end;
          this.end += this.end;
        }
      });

    });

  }

  itemTapped(event, libraryItem) {
    this.navCtrl.push(ItemDetailsPage, {
      libraryItem: libraryItem,
      resolve: this.resolve,
      reject: this.reject,
      width: this.width,
      height: this.height
    });
  }

  trackById(index: number, libraryItem: LibraryItem): string { return libraryItem.id; }

  public doInfinite(infiniteScroll){
    //console.log(infiniteScroll, this.start, this.listMaster.length);
    if( this.start > this.listMaster.length ){ infiniteScroll.complete(); return; }

    let news = this.listMaster.slice(this.start, this.end); // To take top 10 images
    //console.log(news);
    this.zone.run(()=>{
      for(let t of news){
        this.library.push(t);
      }
      //console.log(this.library);
      setTimeout(function(){
        infiniteScroll.complete();
      }, 1500);
    });
    /*for(let t of news){
      this.library.push(t);
    }
    this.cd.detectChanges();*/
    
    this.start = this.end;
    this.end += this.end;
  }
}
