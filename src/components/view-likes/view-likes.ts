import { Component } from '@angular/core';

/**
 * Generated class for the ViewLikesComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: 'view-likes',
  templateUrl: 'view-likes.html'
})
export class ViewLikesComponent {

  text: string;

  constructor() {
    console.log('Hello ViewLikesComponent Component');
    this.text = 'Hello World';
  }

}
