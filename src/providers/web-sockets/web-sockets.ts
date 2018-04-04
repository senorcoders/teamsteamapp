import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MyApp } from '../../app/app.component';

declare var io:any;

@Injectable()
export class WebSocketsProvider {

  public static conexion:any;

  constructor(public http: HttpClient) {
    
  }

  public async initConexion():Promise<any>{
    return new Promise( async function(resolve, reject){

      try{
        
        if( (window as any).io === undefined ){
          await MyApp.initConnetionSockets();
          await this.loopCheckConnect();
        }else if( WebSocketsProvider.conexion === undefined || WebSocketsProvider.conexion === null ){
          WebSocketsProvider.conexion = await io.sails.connect('http://localhost:8187');
        }
        
        resolve(WebSocketsProvider.conexion);
  
      }
      catch(e){
        console.error(e);
        reject(e)
      }

    }.bind(this) );
  }

  private loopCheckConnect():Promise<boolean>{
    let t = this;
    return new Promise(function(resolve, reject){

      if( (window as any).io === undefined ){
        setTimeout(function(){
          t.loopCheckConnect.bind(t)
        } , 300);
      }else{
        resolve(true);
      }

    });

  }

  public async subscribe(urlTransformed:string, callback):Promise<any>{

    try{
      let conexion = await this.initConexion();
      console.log(conexion);
      await conexion.get(urlTransformed, callback);

    }
    catch(e){
      console.error(e);
    }
  }
}
