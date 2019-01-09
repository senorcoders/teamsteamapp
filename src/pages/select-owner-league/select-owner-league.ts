import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController } from 'ionic-angular';
import { HttpClient } from '@angular/common/http';
import { interceptor } from '../../providers/auth-service/interceptor';

@IonicPage()
@Component({
  selector: 'page-select-owner-league',
  templateUrl: 'select-owner-league.html',
})
export class SelectOwnerLeaguePage {

  public static __name = "SelectOwnerLeaguePage"

  public users = [];
  public search = "";
  public loadImage = false;

  constructor(public navCtrl: NavController, public navParams: NavParams,
    public http: HttpClient, public viewCtrl: ViewController
  ) {
  }

  ionViewDidLoad() {

  }

  public async searchUser() {
    try {
      let query = { email: this.search };
      this.users = await this.http.get(`/user?where=${JSON.stringify(query)}`).toPromise() as any[];
      this.users = this.users.map(it=>{
        it.imgSrc = interceptor.transformUrl("/userprofile/images/"+ it.id);
        it.loadImage = false;
        return it;
      });
    }
    catch (e) {
      console.error(e);
    }
  }

  public loadImg(user) {
    user.loadImage = true;
  }

  public add(user) {
    this.viewCtrl.dismiss(user);
  }

}
