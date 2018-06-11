import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Events } from 'ionic-angular';

//declare var io:any;

@Injectable()
export class WebSocketsProvider {

  public static conexion:any;

  constructor(public http: HttpClient, private event:Events ) {
    
  }

  public async initConexion():Promise<any>{
    /*return new Promise( async function(resolve, reject){

      try{
        console.log("iniciando conexion");
        if( (window as any).io === undefined ){
          await MyApp.initConnetionSockets();
          console.log("script type");
          await this.loopCheckConnect();
          console.log("scirpt loaded");
          console.log(interceptor.url);
          WebSocketsProvider.conexion = await io.sails.connect(interceptor.url);
        }else if( WebSocketsProvider.conexion === undefined && WebSocketsProvider.conexion === null ){
          console.log(interceptor.url);
          WebSocketsProvider.conexion = await io.sails.connect(interceptor.url, { reconnection : true });
        }
        resolve(WebSocketsProvider.conexion);
  
      }
      catch(e){
        console.error(e);
        reject(e)
      }

    }.bind(this) );*/
  }

  public async loopCheckConnect():Promise<Object>{

    return new Promise(async function(resolve, reject){
      
      try{

        if( (window as any).io === undefined ){

          let pause:Function = function(ms){ return new Promise(function(resolve){
            setTimeout(resolve, ms);
          }) };

          await pause(300);
          await this.loopCheckConnect();
          resolve(true);
        }else{
          resolve(true);
        }

      }
      catch(e){
        reject(e);
      }

    }.bind(this) );

  }

  public async subscribe(urlTransformed:string, callback:Function, model:string):Promise<any>{
    
    async function promise(resolve, reject){
      try{
        
        let conexion = await this.initConexion();
        console.log(conexion);
        await conexion.get(urlTransformed, function(data, jwr){
          if (jwr.error) {
            console.error('Could not subscribe to Louie-related notifications: '+jwr.error);
            return;
          }
  
          console.log("subscrito to"+ urlTransformed, data);
          resolve(data);
        } );
  
        conexion.on(model, function(event) {
          console.log('Got a message about a Louie: ', event);
          callback(event);
        });

        
  
      }
      catch(e){
        console.error(e);
      }
    };

    return new Promise( promise.bind(this) );
  }

  public subscribeWithPush(model:string, add?:Function, update?:Function, remove?:Function){
    try{

      add = add || new Function();
      update = update || new Function();
      remove = remove || new Function();

      this.event.subscribe(model+ ":created", add);
      this.event.subscribe(model+ ":updated", update);
      this.event.subscribe(model+ ":removed", remove);

    }
    catch(e){
      console.error(e);
    }

  }

  public unsubscribeWithPush(model:string){

    try{

    this.event.unsubscribe(model+ ":created");
    this.event.unsubscribe(model+ ":updated");
    this.event.unsubscribe(model+ ":removed");
    
    }catch(e){
      console.error(e);
    }

  }

}
