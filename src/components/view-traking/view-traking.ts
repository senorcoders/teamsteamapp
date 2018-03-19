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

  constructor(public viewCtrl: ViewController, public navParams: NavParams) {
    console.log(this.navParams.data);
  }

}
