import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { DeviceDetectorService } from 'ngx-device-detector';
import { isPlatformServer } from '@angular/common';

@Injectable()
export class UniversalDeviceDetectorService extends DeviceDetectorService {
  constructor(@Inject(PLATFORM_ID) platformId: any) {
    super(platformId);
    if (isPlatformServer(platformId)) {
      super.setDeviceInfo(navigator.userAgent);
    }
  }
}
