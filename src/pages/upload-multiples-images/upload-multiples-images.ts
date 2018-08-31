import { Component, NgZone } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { LibraryItem } from '@ionic-native/photo-library';
import { File as DFile } from '@ionic-native/file';
import { DomSanitizer } from '@angular/platform-browser';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { MyApp } from '../../app/app.component';
import { HelpersProvider } from '../../providers/helpers/helpers';

declare var NFile:any;
@IonicPage()
@Component({
  selector: 'page-upload-multiples-images',
  templateUrl: 'upload-multiples-images.html',
})
export class UploadMultiplesImagesPage {

  public images: LibraryItem[] = [];
  private id = "";

  constructor(public navCtrl: NavController, public navParams: NavParams,
    private file: DFile, public zone: NgZone, private http: HttpClient
  ) {
    this.images = this.navParams.get("images");
    this.id = this.navParams.get("id");
  }

  ionViewDidLoad() {
    this.zone.run(function () { console.log("hola") });
  }

  public trackById(index: number, libraryItem: LibraryItem): string { return libraryItem.id; }

  public async upload() {
    try {

      let load = HelpersProvider.me.getLoadingStandar();
      let files: File[] = [];
      for (let img of this.images) {
        let fileEntry: any = await this.file.resolveLocalFilesystemUrl(this.getSystemURL(img.id));
        let arrBufer = await this.file.readAsArrayBuffer(fileEntry.nativeURL.split("/").slice(0, -1).join("/"), fileEntry.name);
        let IFile:any = await new Promise((resolve, reject)=>{
          fileEntry.file(function (file) {
            resolve(file);
          }.bind(this), reject);
        });
        
        let f = new NFile([arrBufer], fileEntry.name, {type:IFile.type});
        files.push(f);
      
      }

      console.log(files);
      let form = new FormData();
      for (let f of files) {
        form.append("images", f);
      }
      let httpOptionsForm: any = { headers: new HttpHeaders() };
      httpOptionsForm.headers.append('Content-Type', 'multipart/form-data');
      await this.http.post("/images/event/" + this.id + "/" + MyApp.User.id, form, httpOptionsForm).toPromise()
      this.navCtrl.pop();
      this.navCtrl.pop();
      load.dismiss();

    }
    catch (e) {
      console.error(e);
    }
  }

  public getSystemURL(url: string) {
    return "file://" + url.split(";").pop();
  }

}
