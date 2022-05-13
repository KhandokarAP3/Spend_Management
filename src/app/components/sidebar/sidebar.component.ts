import {Component, HostBinding} from '@angular/core';
import {CommonService} from "../../services/common.service";

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html'
})
export class  SidebarComponent {
  @HostBinding() class = 'sidebar';
  menuItems: any[] =   [
    { name: 'Dashboard', iconURL: 'images/reports_white.png' },
    { name: 'Projects', iconURL: 'images/projects_white.png' },
    { name: 'Activities', iconURL: 'images/activities_white.png' },
    { name: 'Repository', iconURL: 'images/repository_white.png' },
    { name: 'Support', iconURL: 'images/support_white.png' }
  ];
  constructor(private commonService: CommonService) {
    for (const menuItem of this.menuItems) {
      menuItem.link = `/${menuItem.name.toLowerCase()}`;
    }

    this.commonService.hideDashboardLink.subscribe({
      next: (data) => {
        if (data) {
          this.menuItems[0].isDisabled = true;
        }
        else {
          delete this.menuItems[0].isDisabled;
        }
      }
    })
  }
}
