import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ModalController, ActionSheetController } from 'ionic-angular';
import { LibraryImagesPage } from '../library-images/library-images';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { interceptor } from '../../providers/auth-service/interceptor';
import { HelpersProvider } from '../../providers/helpers/helpers';
import { MyApp } from '../../app/app.component';
import { ImageViewerController } from 'ionic-img-viewer';

declare var NFile: any;
@IonicPage()
@Component({
  selector: 'page-images-event',
  templateUrl: 'images-event.html',
})
export class ImagesEventPage {

  public event: any = {};
  public images = [];
  public grid = false;

  constructor(public navCtrl: NavController, public navParams: NavParams,
    private http: HttpClient, private modalCtrl: ModalController,
    private action: ActionSheetController, private imageViewerCtrl: ImageViewerController
  ) {
    this.event = this.navParams.get("event");
  }

  async ionViewWillEnter() {
    this.event = await this.http.get("/event/" + this.event.id).toPromise();
    this.images = this.event.images || [];
    this.images = this.images.map(it => {
      it.src = interceptor.url + it.src;
      return it;
    });
    console.log(this.images);
  }

  public setView(status: boolean) {
    this.grid = status;
  }

  public async toUpload() {
    this.action.create({
      title: await HelpersProvider.me.getWords("ADDIMAGES"),
      buttons: [
        {
          text: await HelpersProvider.me.getWords("CAMERA"),
          handler: this.one.bind(this)
        },
        {
          text: await HelpersProvider.me.getWords("GALLERY"),
          handler: this.Multi.bind(this)
        }
      ]
    })
      .present();
  }

  private async one() {
    let string = await HelpersProvider.me.Camera({});
    string = string.replace('data:image/jpeg;base64,', "");
    let arrBufer = HelpersProvider.me.base64ToArrayBuffer(string);
    console.log(arrBufer);

    let file = new NFile([arrBufer], new Date().getTime().toString() + ".jpg", { type: "image/jpeg" });
    let load = HelpersProvider.me.getLoadingStandar();
    let form = new FormData();
    for (let f of [file]) {
      form.append("images", f);
    }
    let httpOptionsForm: any = { headers: new HttpHeaders() };
    httpOptionsForm.headers.append('Content-Type', 'multipart/form-data');
    await this.http.post("/images/event/" + this.event.id + "/" + MyApp.User.id, form, httpOptionsForm).toPromise()
    this.ionViewWillEnter();
    load.dismiss();
  }

  private Multi() {
    this.navCtrl.push(LibraryImagesPage, { multi: true, id: this.event.id });
  }

  public presentImage(myImage, _new) {
    _new = _new || false;
    if (_new === true) {
      let img = new Image();
      let src = myImage.target.src;
      src = src.split("?").shift() + "?large=true";
      img.setAttribute("src", src);
      const imageViewer = this.imageViewerCtrl.create(img);
      imageViewer.present();
      return;
    }
    const imageViewer = this.imageViewerCtrl.create(myImage.target);
    imageViewer.present();
  }
}
