import {Component, Input} from '@angular/core';
import {CommonService} from '../../services/common.service';
import {ControlContainer, NgForm} from '@angular/forms';
import {ToastrService} from 'ngx-toastr';
import {CommonDialogService} from "../../services/common-dialog.service";
import {ObjectOperationsService} from "../../services/object-operations.service";

@Component({
  selector: 'app-team',
  templateUrl: './team.component.html',
  viewProviders: [ { provide: ControlContainer, useExisting: NgForm } ]
})
export class TeamComponent {

  @Input() team = ObjectOperationsService.getNewTeamObject();
  newTeamMate: any = ObjectOperationsService.getNewTeamMatesObject();

 constructor(public commonService: CommonService, private toastr: ToastrService, private CommonDialogService: CommonDialogService) {}

 addNewTeammates() {
    // this.newTeamMate = new TeamMate();
    this.CommonDialogService.openTeamsModal().subscribe((result: any) => {
      if (result !== undefined) {
        this.team.teamMates.push(result);
      }
    });
  }

  addNewTeammate() {
    if (this.newTeamMate.label === '') {
      this.toastr.warning('Please enter a title value in order to save teammate');
      return;
    }
    this.team.teamMates.push(this.newTeamMate);
    this.newTeamMate = null;
  }

  cancelAddTeammate() {
    this.newTeamMate = null;
  }

  deleteTeamMate(index) {
    if (confirm('Do you want to remove teammate?')){
      this.team.teamMates.splice(index, 1);
    }
  }
}
