import {Component} from '@angular/core';
import {DeviceDetectorService} from 'ngx-device-detector';
import {RESTAPIService} from '../../services/REST-API.service';
import {LocationStrategy} from '@angular/common';
import {CommonService} from '../../services/common.service';
import {Router, NavigationEnd} from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent {
  isSupportedBrowser = false;
  supportedBrowsers: any = {
    'ms-edge-chromium': 79,
    edge: 79,
    chrome: 75,
    firefox: 80,
    safari: 14,
    opera: 73
  };
  style = {};

  constructor(private location: LocationStrategy,
              private commonService: CommonService,
              private router: Router,
              private deviceDetectorService: DeviceDetectorService,
              private restAPIService: RESTAPIService) {
    const browser = this.deviceDetectorService.browser.toLowerCase();
    const version = parseInt(this.deviceDetectorService.browser_version, 10);
    // console.log(version, this.supportedBrowsers[browser]);
    this.isSupportedBrowser = this.supportedBrowsers[browser] && version >= this.supportedBrowsers[browser];
    setInterval(() => {
      restAPIService.updateRequestDigest().subscribe(() => {
      });
    }, 1 * 60000);
    location.onPopState(() => {
      this.commonService.preventNavigation = true;
    });

    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        // event is an instance of NavigationEnd, get url!
        const url = event.urlAfterRedirects;
        if (url === '/home') {
          this.commonService.hideDashboardLink.emit(true);
        }
        else {
          this.commonService.hideDashboardLink.emit(false);
        }
      }
    });
  }

}
