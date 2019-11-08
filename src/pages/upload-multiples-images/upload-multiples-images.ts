import { Component, NgZone } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { LibraryItem } from '@ionic-native/photo-library';
import { File as DFile } from '@ionic-native/file';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { MyApp } from '../../app/app.component';
import { HelpersProvider } from '../../providers/helpers/helpers';

declare var NFile: any;
@IonicPage()
@Component({
  selector: 'page-upload-multiples-images',
  templateUrl: 'upload-multiples-images.html',
})
export class UploadMultiplesImagesPage {

  public static __name = "UploadMultiplesImagesPage"


  public images: LibraryItem[] = [];
  private id = "";

  constructor(public navCtrl: NavController, public navParams: NavParams,
    private file: DFile, public zone: NgZone, private http: HttpClient
  ) {
    // console.log(this.navParams.data)
    this.images = this.navParams.get("images");
    this.id = this.navParams.get("id");
  }

  ionViewDidLoad() {
    this.zone.run(function () { console.log(this.id, this.images) }.bind(this));
  }

  public trackById(index: number, libraryItem: LibraryItem): string { return libraryItem.id; }

  public async upload() {
    let load = HelpersProvider.me.getLoadingStandar();
    try {
      let files: File[] = [];
      // console.log(this.images);
      for (let img of this.images) {
        let fileEntry: any = await this.file.resolveLocalFilesystemUrl(this.getSystemURL(img.id));
        // console.log('fileEntry', fileEntry);
        // let arrBufer = await this.file.readAsArrayBuffer(fileEntry.nativeURL.split("/").slice(0, -1).join("/"), fileEntry.name);
        let arrBufer = await new Promise((resolve, reject) => {
          this.getArrayBuffer(fileEntry.nativeURL, resolve, reject)
        });
        // console.log("arrBufer", arrBufer);
        let IFile: any = await new Promise((resolve, reject) => {
          fileEntry.file(function (file) {
            resolve(file);
          }.bind(this), reject);
        });
        // console.log("IFile", IFile);
        let f = new NFile([arrBufer], fileEntry.name, { type: IFile.type });
        files.push(f);

      }

      // console.log(files);
      let form = new FormData();
      for (let f of files) {
        form.append("images", f);
      }
      let httpOptionsForm: any = { headers: new HttpHeaders() };
      httpOptionsForm.headers.append('Content-Type', 'multipart/form-data');
      await this.http.post("/images/event/" + this.id + "/" + MyApp.User.id, form, httpOptionsForm).toPromise()
      this.navCtrl.pop();
      this.navCtrl.pop();
      return load.dismiss();

    }
    catch (e) {
      console.error(e);
    }
    load.dismiss()
  }

  private getArrayBuffer(nativeUrl, resolve, reject) {
    var oReq = new XMLHttpRequest();
    oReq.open("GET", nativeUrl, true);
    oReq.responseType = "arraybuffer";

    oReq.onload = function (oEvent) {
      var arrayBuffer = oReq.response; // Note: not oReq.responseText
      if (arrayBuffer) {
        var byteArray = new Uint8Array(arrayBuffer);
        // for (var i = 0; i < byteArray.byteLength; i++) {
        // do something with each byte in the array
        // }
        resolve(byteArray);
      }
    };

    oReq.send(null);
  }

  public getSystemURL(url: string) {
    return "file://" + url.split(";").pop();
  }

}
