import { Component, OnInit} from '@angular/core';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import {CommonService} from '../../services/common.service';
import {RESTAPIService} from '../../services/REST-API.service';
import {AppConstants} from '../../AppConstants';
import * as moment from 'moment';


@Component({
  selector: 'app-note-component',
  templateUrl: './notes.component.html'
})

export class NotesComponent implements OnInit {
  data: any;
  notes: any[] = [];
  editingNote = null;
  readonly newNoteId = 'newNote';
  currentUser = AppConstants.spPageContextInfo.userDisplayName;
  columns = [
    { av: 'Date', dv: 'Date', thStyle: {width: '13%'}, isReaOnly: true, inputStyle: {minHeight: '80px', resize: 'none', border: '1px solid black'}},
    { av: 'Title', dv: 'Level', thStyle: {width: '10%'}, isReaOnly: true, inputStyle: {minHeight: '80px', resize: 'none', border: '1px solid black'}},
    { av: 'Name', dv: 'Name', thStyle: {width: '14%'}, isReaOnly: true, inputStyle: {minHeight: '80px', resize: 'none', border: '1px solid black'}},
    { av: 'Description', dv: 'Notes', thStyle: {width: '43%'}, isReaOnly: false, inputStyle: {minHeight: '80px', resize: 'vertical', border: '1px solid black'}},
    { av: 'Submitter', dv: 'Submitter', thStyle: {width: '15%'}, isReaOnly: true, inputStyle: {minHeight: '80px', resize: 'none', border: '1px solid black'}}
  ];
  sortBy = 'Date';
  reverse = true;

  constructor(
    public activeModal: NgbActiveModal,
    private toastr: ToastrService,
    public commonService: CommonService,
    private restAPIService: RESTAPIService) {
  }

  ngOnInit() {
    this.restAPIService.getNotes(`(ParentId eq '${this.data.ParentId}' and Title eq '${this.data.Level}')`).subscribe(res => {
      if (this.restAPIService.isSuccessResponse(res)) {
        this.notes = res.data;
      }
      if (this.data.ProjectIdentifier) {
        this.restAPIService.getActivities(`Identifier eq '${this.data.ProjectIdentifier}'`).subscribe((projectActivityResp: any) => {
          if (this.restAPIService.isSuccessResponse(projectActivityResp) && projectActivityResp.data.length > 0) {
            let query = `(Title eq 'Activity' and (`;
            let parentIdQuery = '';
            for (const [index, activityObj] of projectActivityResp.data.entries()) {
              parentIdQuery += `ParentId eq '${activityObj.ID}'`;
              if (index < projectActivityResp.data.length - 1) {
                parentIdQuery += ' or ';
              }
            }
            query += `${parentIdQuery}))`;

            this.restAPIService.getActionItems(parentIdQuery).subscribe(actionItesmRes => {
              if (this.restAPIService.isSuccessResponse(actionItesmRes) && actionItesmRes.data.length > 0) {
                query += ` or (Title eq 'Action Item' and (`;
                for (const [index, actionItemObj] of actionItesmRes.data.entries()) {
                  query += `ParentId eq '${actionItemObj.ID}'`;
                  if (index < actionItesmRes.data.length - 1) {
                    query += ' or ';
                  }
                }
                query += `))`;
                this.restAPIService.getNotes(query).subscribe(notesRes => {
                  if (this.restAPIService.isSuccessResponse(notesRes)) {
                    this.notes = [...this.notes, ...notesRes.data];
                  }
                });
              } else {
                this.restAPIService.getNotes(query).subscribe(notesRes => {
                  if (this.restAPIService.isSuccessResponse(notesRes)) {
                    this.notes = [...this.notes, ...notesRes.data];
                  }
                });
              }
            });
          }
        });
      }

    });
  }

  cancel() {
    this.activeModal.dismiss();
  }

  sortTableBy(key) {
    if (this.sortBy === key) {
      this.reverse = !this.reverse;
    }
    this.sortBy = key;
  }

  addNewNote() {
    if (this.editingNote) {
      if (confirm('Do you want to discard current editing note?')) {
        this.cancelEditNote();
      } else {
        return;
      }
    }
    const note = {
      Date: moment().format(AppConstants.AP3DateFormat),
      Title: this.data.Level,
      Name: this.data.Name,
      Submitter: this.currentUser,
      Description: '',
      ID: this.newNoteId
    };
    this.notes.push(note);
    this.editNote(note);
  }

  private fnDeleteNote(noteId) {
    this.notes = this.notes.filter((note) => {
      return note.ID !== noteId;
    });
  }
  deleteNote(note) {
    if (note.ID !== this.newNoteId) {
      this.restAPIService.deleteNotes(note.ID).subscribe(res => {
        if (this.restAPIService.isSuccessResponse(res)) {
          this.fnDeleteNote(note.ID);
        }
      });
    } else {
      this.fnDeleteNote(note.ID);
    }
  }

  editNote(note) {
    if (this.editingNote) {
      if (confirm('Do you want to discard current editing note?')) {
        this.cancelEditNote();
      } else {
        return;
      }
    }
    this.editingNote = {};
    for (const column of this.columns) {
      this.editingNote[column.av] = note[column.av];
    }
    this.editingNote.ID = note.ID;
  }

  saveNote() {
    if (!this.editingNote.Description) {
      this.toastr.error('Please fill description to save note.');
      return;
    }
    console.log('save note to server then update the array');
    let observable;
    const editingNote: any =  {__metadata: { type: 'SP.Data.NotesListItem' }};
    for (const column of this.columns) {
      editingNote[column.av] = this.editingNote[column.av];
    }
    if (this.editingNote.ID === this.newNoteId) {
      editingNote.ParentId = this.data.ParentId;
      observable = this.restAPIService.saveNotes(editingNote);
    } else {
      observable = this.restAPIService.updateNotes(editingNote, this.editingNote.ID);
    }
    observable.subscribe(res => {
      if (this.restAPIService.isSuccessResponse(res)) {
        this.editingNote = { ...this.editingNote, ...editingNote };
        let noteIndex = -1;
        for (const note of this.notes) {
          noteIndex++;
          if (this.editingNote.ID === note.ID) {
            break;
          }
        }
        if (noteIndex >= 0) {
          this.notes[noteIndex] = { ...this.notes[noteIndex], ...this.editingNote };
        }
        if (this.notes[noteIndex].ID === this.newNoteId) {
          this.notes[noteIndex].ID = res.data.ID;
          this.editingNote.ID = this.notes[noteIndex].ID;
        }
        this.cancelEditNote();
      }
    });
  }

  cancelEditNote() {
    if (this.editingNote.ID === this.newNoteId) {
      this.fnDeleteNote(this.newNoteId);
    }
    this.editingNote = null;
  }
}
