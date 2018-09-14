import { Component } from '@angular/core';
import { NavParams } from 'ionic-angular';
import { HttpClient } from '@angular/common/http';
import { interceptor } from '../../providers/auth-service/interceptor';
import { MyApp } from '../../app/app.component';

/**
 * muestra la cantidad like y los datos de los players 
 */
@Component({
  selector: 'view-likes',
  templateUrl: 'view-likes.html'
})
export class ViewLikesComponent {

  public likes:Array<any>=[];
  public users:Array<any>=[];

  constructor(private navParams: NavParams, public http: HttpClient
  ) {
    
    this.likes = this.navParams.get("likes");

  }

  async ngOnInit(){
    try{
      let arr = [];
      for(let like of this.likes){
        let user = await this.getUser(like.user);
        user.imageSrc = interceptor.transformUrl("/userprofile/images/" + user.id + "/" + MyApp.User.team);
        arr.push(user);
      }
      this.users = arr;
    }catch(e){
      console.error(e);
    }
  }

  private getUser(id:string):Promise<any>{
    let t = this;
    return new Promise(function(resolve, reject){
      t.http.get("/user/"+ id).toPromise()
      .then(function(user){
        resolve(user);
      })
      .catch(function(e){
        reject(e);
      });

    });
  }

}
