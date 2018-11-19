import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { EventsSchedulePage } from '../events-schedule/events-schedule';
import { RosterPage } from '../roster/roster';
import { ListChatsPage } from '../list-chats/list-chats';
import { PhotosPage } from '../photos/photos';
import { ViewProfilePage } from '../view-profile/view-profile';

@IonicPage()
@Component({
  selector: 'page-tabs',
  templateUrl: 'tabs.html',
})
export class TabsPage {

  public eventsTitle = "";
  public rosterTitle = "";
  public chatTitle = "";
  events = EventsSchedulePage;
  roster = RosterPage;
  chat = ListChatsPage;
  photos = PhotosPage;
  more = ViewProfilePage;

  constructor(public navCtrl: NavController, public navParams: NavParams) {
  }

  async ionViewDidLoad() {

  }

}
