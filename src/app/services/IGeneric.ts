export interface IGeneric {
  findOne (id: any): any;
  findAll (): any;
  persist (object: any): any;
  update (object: any): any;
  delete (object: any): void;
  deleteById (id: any): void;
}