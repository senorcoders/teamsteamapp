import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { HttpClient } from '@angular/common/http';
import { HelpersProvider } from '../../providers/helpers/helpers';
import { MyApp } from '../../app/app.component';
import { ImagesEventPage } from '../images-event/images-event';
import { interceptor } from '../../providers/auth-service/interceptor';
import { ImageViewerController } from 'ionic-img-viewer';

@IonicPage()
@Component({
  selector: 'page-photos',
  templateUrl: 'photos.html',
})
export class PhotosPage {

  public static __name = "PhotosPage"


  public events = [];
  public allImages = [];
  public filter = "imagesEvent";
  photoEvent: any;
  public url = interceptor.url;

  constructor(public navCtrl: NavController, public navParams: NavParams,
    public http: HttpClient, private imageViewerCtrl: ImageViewerController
  ) {

  }

  async ionViewDidLoad() {
    let load = HelpersProvider.me.getLoadingStandar();
    try {

      this.events = await this.http.get(`/event?where={"team":"${MyApp.User.team}"}`).toPromise() as any[];

      //Obtenemos todas las imagenes
      let imgs = [];
      for (let e of this.events) {
        let is = e.images || [];
        imgs = imgs.concat(is);
      }
      this.allImages = imgs;
      let eLeng: any = this.events.length;
      for (let index in this.events) {
        let n: any = index;
        console.log(index, this.events.length);
        if (n == (eLeng - 1)) {
          console.log(this.events[n].id);
          this.photoEvent = this.events[n].id;
        }
      }
    }
    catch (e) {
      console.error(e);
    }

    load.dismiss();
  }

  public presentImage(myImage) {
    let img = new Image();
    let src = myImage.target.src;
    src = src.split("?").shift() + "?large=true";
    img.setAttribute("src", src);
    const imageViewer = this.imageViewerCtrl.create(img);
    imageViewer.present();
  }

  public toImages(event) {
    this.navCtrl.push(ImagesEventPage, { event: event });
  }

  public changeEvent(e) {
    const index = this.events.findIndex(it => it.id === e);
    if (index !== -1) {
      // console.log(e, this.events[index]);
      this.http.get('/event/' + this.events[index].id).subscribe(data => {
        this.events[index] = data;
      });
    }

  }

}
