import { Component } from '@angular/core';
import { CommentsComponent } from '../comments/comments';
import { ViewLikesComponent } from '../view-likes/view-likes';
import { NavParams, ViewController } from 'ionic-angular';

/**
 * Generated class for the ViewTrakingComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: 'view-traking',
  templateUrl: 'view-traking.html'
})
export class ViewTrakingComponent {

  public Comments=CommentsComponent;
  public LikesUp=ViewLikesComponent;
  public LikesDown=ViewLikesComponent;
  

  //params
  public comments:any = { like : true}
  public likeUpParams:any = { like : true}
  public likeDownParams:any = { like : false}

  public event:any;

  constructor(public viewCtrl: ViewController, public navParams: NavParams) {
    console.log(this.navParams.data);
    this.event = this.navParams.get("e");
    this.comments = { e : this.event };
    this.likeUpParams.likes = this.event.likes.filter(function(item){
      return item.like === true;
    });

    this.likeDownParams.likes = this.event.likes.filter(function(item){
      return item.like === false;
    });

  }

}
