import { Component, Injectable } from '@angular/core';
import {CanActivate, CanDeactivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router} from '@angular/router';
import { Observable} from 'rxjs';
import { RESTAPIService } from './app/services/REST-API.service';
import { CommonService } from './app/services/common.service';
import {ToastrService} from 'ngx-toastr';
import {AppConstants} from './app/AppConstants';
declare const _spPageContextInfo;

@Injectable()
export class AppRouteGuard implements CanActivate {
  constructor(private restAPIService: RESTAPIService, private commonService: CommonService, private router: Router, private toastr: ToastrService){}
  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    if (this.commonService.currentUserRole) {
      if (this.commonService.allowRouteNavigation(next, state)) {
        return true;
      } else {
        this.toastr.clear();
        // this.router.navigateByUrl('/home');
        this.toastr.error('You do not have permission to view this page. Please click the icon/logo to return to the home page.');
        return false;
      }
    }
    return new Observable(observer => {
      this.restAPIService.sendGetRequest(`${_spPageContextInfo.webAbsoluteUrl}/_api/web/GetUserById(${_spPageContextInfo.userId})/Groups?$select=Title`).subscribe(res => {
        if (this.restAPIService.isSuccessResponse(res) && res.data.length > 0) {
          this.commonService.currentUserRole = res.data.map(obj => {
            return obj.Title;
          });
          if (this.commonService.allowRouteNavigation(next, state)) {
            observer.next(true);
          } else {
            this.toastr.clear();
            // this.router.navigateByUrl('/home');
            this.toastr.error('You do not have permission to view this page. Please click the icon/logo to return to the home page.');
            observer.next(false);
          }
          observer.complete();
        }
      });
    });
  }
}

@Injectable()
export class BackButtonEventtGuard implements CanActivate {
  constructor(private commonService: CommonService){}
  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    if (this.commonService.preventNavigation) {
      this.commonService.preventNavigation = false;
      return false;
    }
    return true;
  }
}

@Injectable()
export class NavigationConfirmationGuard implements CanDeactivate<Component> {
  component: Component;
  route: ActivatedRouteSnapshot;
  constructor(private commonService: CommonService){}
  canDeactivate(component: any, next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    if (this.commonService.isSomethingUnsaved) {
      const result = confirm(next.data.deactivateConfirmationMessage || AppConstants.RouteDeactivateConfirmationMessage);
      if (result) {
        this.commonService.isSomethingUnsaved = false;
      }
      return result;
    }
    return true;
  }
}
