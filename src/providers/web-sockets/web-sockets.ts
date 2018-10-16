import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Events } from 'ionic-angular';
import { interceptor } from '../auth-service/interceptor';
import { MyApp } from '../../app/app.component';
import { HelpersProvider } from '../helpers/helpers';

declare var io: any;

@Injectable()
export class WebSocketsProvider {

  public static conexion: any;

  constructor(public http: HttpClient, private event: Events) {

  }

  private async initConnetionSockets() {
    try {
      let script = await this.http.get("/script/socket", { responseType: "text" }).toPromise() as string;
      new Function(script)();
    }
    catch (e) {
      console.error(e);
    }
  }

  public async initConexion() {
    try {
      console.log("iniciando conexion");
      if ((window as any).io === undefined) {
        await this.initConnetionSockets();
        console.log("script type");
        await this.loopCheckConnect();
        console.log("script loaded");
      }

      //Asignamos los query para iniciar la sesion
      if (MyApp.hasOwnProperty('User') && MyApp.User.hasOwnProperty('token'))
        io.sails.query = `user=${MyApp.User.id}&token=${MyApp.User.token}`;
      else
        return;

      if (WebSocketsProvider.conexion === null || WebSocketsProvider.conexion === undefined) {
        WebSocketsProvider.conexion = io.sails.connect(interceptor.url, { reconnection: true });
      } else {
        if (WebSocketsProvider.conexion.isConnected() === false) {
          WebSocketsProvider.conexion.reconnect();
        }
      }

    }
    catch (e) {
      console.error(e);
    }
  }

  public async loopCheckConnect(): Promise<Object> {

    return new Promise(async function (resolve, reject) {

      try {

        if ((window as any).io === undefined) {

          let pause: Function = function (ms) {
            return new Promise(function (resolve) {
              setTimeout(resolve, ms);
            })
          };

          await pause(500);
          await this.loopCheckConnect();
          resolve(true);
        } else {
          resolve(true);
        }

      }
      catch (e) {
        reject(e);
      }

    }.bind(this));

  }

  public async reconnect() {
    try {
      console.log("iniciando conexion");
      if ((window as any).io === undefined) {
        await this.initConnetionSockets();
        console.log("script type");
        await this.loopCheckConnect();
        console.log("script loaded");
      }

      //Asignamos los query para iniciar la sesion
      if (MyApp.hasOwnProperty('User') && MyApp.User.hasOwnProperty('token'))
        io.sails.query = `user=${MyApp.User.id}&token=${MyApp.User.token}`;
      else
        return;

      if (WebSocketsProvider.conexion === null || WebSocketsProvider.conexion === undefined) {
        WebSocketsProvider.conexion = io.sails.connect(interceptor.url, { reconnection: true });
      } else {
        if (WebSocketsProvider.conexion.isConnected() === false) {
          WebSocketsProvider.conexion = io.sails.connect(interceptor.url, { reconnection: true });
        } else {
          WebSocketsProvider.conexion.disconnect();
          //Esperamos un 1500 milisegundos para reconectar
          await new Promise((resolve) => setTimeout(resolve, 15000));
          this.reconnect();
        }
      }

    }
    catch (e) {
      console.error(e);
    }
  }

  public async subscribe(model: string, callback: Function) {

    await this.initConexion();

    WebSocketsProvider.conexion.on(model, function (event) {
      HelpersProvider.me.zone.run(function(){ callback(event); });
    });
  }

  public disconnect() {
    try {
      if (WebSocketsProvider.conexion !== null || WebSocketsProvider.conexion !== undefined) {
        if (WebSocketsProvider.conexion.isConnected() === true) {
          WebSocketsProvider.conexion.disconnect();
        }
      }
    }
    catch (e) {
      console.error(e);
    }
  }

  public subscribeWithPush(model: string, add?: Function, update?: Function, remove?: Function) {
    try {

      add = add || new Function();
      update = update || new Function();
      remove = remove || new Function();

      this.event.subscribe(model + ":created", add);
      this.event.subscribe(model + ":updated", update);
      this.event.subscribe(model + ":removed", remove);

    }
    catch (e) {
      console.error(e);
    }

  }

  public unsubscribeWithPush(model: string) {

    try {

      this.event.unsubscribe(model + ":created");
      this.event.unsubscribe(model + ":updated");
      this.event.unsubscribe(model + ":removed");

    } catch (e) {
      console.error(e);
    }

  }

}
