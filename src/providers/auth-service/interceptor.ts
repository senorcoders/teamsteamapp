import { Injectable, NgModule} from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest} from '@angular/common/http';
import { HTTP_INTERCEPTORS } from '@angular/common/http';

@Injectable()
export class interceptor implements HttpInterceptor {
  public static url:string = 'http://192.168.1.6:3000'; //'http://138.68.19.227:1337'; //'http://localhost:3000';
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    req = req.clone({
      url: interceptor.url + req.url
    });

    return next.handle(req);
  }
}