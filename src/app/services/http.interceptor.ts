import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import {EMPTY, Observable} from 'rxjs';
import {CommonService} from './common.service';
// import {AppConstants} from '../AppConstants';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {
  constructor(private commonService: CommonService) {}
  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // if (request.url === AppConstants.licenseURL) {
    //   return next.handle(request);
    // }
    // if (this.commonService.licenseInvalid === true || (this.commonService.isLicenseExpired === true && request.method !== 'GET')) {
    //   return EMPTY;
    // }
    return next.handle(request);
  }
}
