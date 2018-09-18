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

  public events = [];
  public allImages = [];
  public filter = "imagesEvent";
  photoEvent:any;
  public url = interceptor.url;

  constructor(public navCtrl: NavController, public navParams: NavParams,
    public http: HttpClient, private imageViewerCtrl:ImageViewerController
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
    }
    catch (e) {
      console.error(e);
    }

    load.dismiss();
  }

  public presentImage(myImage) {
    let img = new Image();
    let src = myImage.target.src;
    src = src.split("?").shift()+ "?middle=true";
    img.setAttribute("src", src);
    const imageViewer = this.imageViewerCtrl.create(img);
    imageViewer.present();
  }

  public toImages(event) {
    this.navCtrl.push(ImagesEventPage, { event: event });
  }

}
