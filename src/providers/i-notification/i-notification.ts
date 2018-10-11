import { HttpClient } from '@angular/common/http';
import { Injectable, NgZone } from '@angular/core';
import { HelpersProvider } from '../helpers/helpers';
import { ListChatsPage } from '../../pages/list-chats/list-chats';
import { ChatOnePersonPage } from '../../pages/chat-one-person/chat-one-person';
import { EventPage } from '../../pages/event/event';
import { EventsSchedulePage } from '../../pages/events-schedule/events-schedule';
import { MyTaskPage } from '../../pages/my-task/my-task';
import { TaskPage } from '../../pages/task/task';
import { ChatPage } from '../../pages/chat/chat';
import { MyApp } from '../../app/app.component';
import { PlayerCloseEventPage } from '../../pages/player-close-event/player-close-event';
import { ChatFamilyPage } from '../../pages/chat-family/chat-family';
import { LiveScorePage } from '../../pages/live-score/live-score';


@Injectable()
export class INotificationProvider {

  public static me: INotificationProvider;

  constructor(public http: HttpClient, public zone: NgZone) {
    this.initComponentStatic();
  }

  private initComponentStatic() {
    INotificationProvider.me = this;
  }

  public async processNotificacionBackground(intent) {

    console.log(intent);

    if (!intent.hasOwnProperty("extras") || !intent.extras.hasOwnProperty("is")) {
      return;
    }

    let data;
    if (Object.prototype.toString.call(intent.extras.dataStringify) === "[object String]") {
      data = JSON.parse(intent.extras.dataStringify);
      console.log("DATA: ", data);
    } else {
      data = intent.extras.dataStringify
      console.log("DATA 2: ", data);
    }
    if (intent.extras.is === "chat") {
      await HelpersProvider.me.toPages(ListChatsPage, [{ page: ChatOnePersonPage, data: { user: data.from } }]);
    } else if (intent.extras.is === "event" && intent.extras.verb === 'followig') {
      let events = data.events;
      if (events.length === 1) {
        console.log(events[0]);
        let event = await this.http.get("/event/" + events[0]._id).toPromise();
        await HelpersProvider.me.toPages(EventsSchedulePage, [{ page: EventPage, data: { event } }], { notification: true });
      }
    } else if (intent.extras.is === "event") {
      await HelpersProvider.me.toPages(EventsSchedulePage, [{ page: EventPage, data: { event: data.eventData } }], { notification: true });
    } else if (intent.extras.is === "task") {
      await HelpersProvider.me.toPages(MyTaskPage, [{ page: TaskPage, data: { task: data } }]);
    } else if (intent.extras.is === "message") {
      await HelpersProvider.me.toPages(ListChatsPage, [{ page: ChatPage, data: {} }]);
    } else if (intent.extras.is === "chatFamily") {
      await HelpersProvider.me.toPages(ListChatsPage, [{ page: ChatFamilyPage, data: {} }]);
    } else if (intent.extras.is.includes("player-near.")) {
      let eventID = intent.extras.is.split(".")[1];
      await HelpersProvider.me.toPages(EventsSchedulePage, [{ page: PlayerCloseEventPage, data: { eventID, player: data } }], { notification: true });
    } else if (intent.extras.is === "scorepart") {
      await HelpersProvider.me.toPages(EventsSchedulePage, [{ page: EventPage, data: { event: data } }, { page: LiveScorePage, data: { event: data } }], { notification: true });
    }else if(intent.extras.is === "commentscorepart"){
      await HelpersProvider.me.toPages(EventsSchedulePage, [{ page: EventPage, data: { event: data } }, { page: LiveScorePage, data: { event: data } }], { notification: true });
    }

  }

  public processNotificationForeGround(is: string, verb: string, notification: any) {

    console.log('Received a notification', is, verb, notification);
    if (is === 'chat' || is === "message" || is === "chatFamily" && verb === "created") {

      if (notification.additionalData.dataStringify.hasOwnProperty("from")) {

        this.zone.run(function () {
          let ide = notification.additionalData.dataStringify.from.id;
          let index = ListChatsPage.newMessages.findIndex(function (it) { return it === ide; });
          if (index === -1) {
            ListChatsPage.newMessages.push(ide);
          }
        });
      } else if (is === "chatFamily") {

        this.zone.run(function () {
          let ide = "family";
          let index = ListChatsPage.newMessages.findIndex(function (it) { return it === ide; });
          if (index === -1) {
            ListChatsPage.newMessages.push(ide);
          }
        });
      } else if (notification.additionalData.dataStringify.hasOwnProperty("team")) {

        this.zone.run(function () {
          let ide = "team";
          let index = ListChatsPage.newMessages.findIndex(function (it) { return it === ide; });
          if (index === -1) {
            ListChatsPage.newMessages.push(ide);
          }
        });
      }

      MyApp.newDatas["chat"] = true;
      MyApp.counts["chat"] = ListChatsPage.newMessages.length;

    }
  }

}
