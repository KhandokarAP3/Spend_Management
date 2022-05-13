
export class DocumentApproval {
  public ID:any = '';
  public RequestedDate:string = '';
  public DueDate:string = '';
  public Title:string = '';
  public Status:string = '';
  public DocumentName:string = '';
  public DocumentLink:string = '';
  public RequestedBy:string = '';
  public Type:string = '';
  public Identifier:string = ''; 
  public CanCancel = false;

  constructor(jsonObj?: any) {
    if (jsonObj) {
      this.ID = jsonObj.ID || '',
      this.RequestedDate = jsonObj.RequestedDate || '';
      this.DueDate = jsonObj.DueDate || '';
      this.Title = jsonObj.Title || '';
      this.Status = jsonObj.Status || '';
      this.DocumentName = jsonObj.DocumentName || '';
      this.DocumentLink = jsonObj.DocumentLink || '';
      this.RequestedBy = jsonObj.RequestedBy || '';
      this.Type = jsonObj.Type || '';
      this.Identifier = jsonObj.Identifier || '';
      this.CanCancel = jsonObj.CanCancel;
    }
  }
}