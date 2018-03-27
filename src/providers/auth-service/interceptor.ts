import { Injectable, NgModule} from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest} from '@angular/common/http';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthServiceProvider } from './auth-service';
import { MyApp } from '../../app/app.component';

@Injectable()
export class interceptor implements HttpInterceptor {

  public static url:string = 'http://192.168.1.2:8087'; //'http://138.68.19.227:8087'; 'http://localhost:8087';
  
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    if( MyApp.hasOwnProperty('User') && MyApp.User.hasOwnProperty('token') ){

      let token = MyApp.User.token;
      if( token !== undefined && token !== undefined){

        req = req.clone({
          url : interceptor.url+ req.url,
          setHeaders: {
            'token': token
          }
        });

      }

    }else{
      req = req.clone({
        url: interceptor.url + req.url
      });
    }
  
    return next.handle(req);
  }

  public static transformUrl(url):string{
    url += '?token='+ MyApp.User.token;
    return interceptor.url+ url;
  }
  
}