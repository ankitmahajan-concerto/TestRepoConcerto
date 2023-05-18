import { HttpClient, HttpEvent, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class FileUploadService {
  base_url: string = environment.base_url;

  public update = new Subject<void>();
  public update$ = this.update.asObservable();

  constructor(private http: HttpClient) {}

  // postFile(data : any)
  // {
  //   return this.http.post<any>("")
  // }


  upload(file: File): Observable<HttpEvent<any>> {
    const formData: FormData = new FormData();

    formData.append('file', file);

    const req = new HttpRequest('POST', `${this.base_url}/uploads`, formData, {
      reportProgress: true,
      responseType: 'json',
    });

    return this.http.request(req);
  }

  getFiles(): Observable<any> {
    return this.http.get<any>(`${this.base_url}/getFiles`);
  }

  uploadfile(): Observable<any> {
    return this.http.get<any>(`${this.base_url}/getUploadFiles`);
  }

  download(fileName: string): Observable<HttpEvent<Blob>> {
    // let params = new HttpParams().set('fileName', filename);
    //console.log(params);
    //this.serverData='${filename}';
    //console.log(+"USHH*(UFH")

    return this.http.get(
      `${this.base_url}/download/${fileName}`,

      {
        reportProgress: true,
        observe: 'events',
        responseType: 'blob',
      }
    );
  }


  downloadTemplete(ext: string): Observable<HttpEvent<Blob>> {
    // let params = new HttpParams().set('fileName', filename);
    //console.log(params);
    //this.serverData='${filename}';
    //console.log(+"USHH*(UFH")

    return this.http.get(
      `${this.base_url}/downloadtemplate/${ext}`,

      {
        reportProgress: true,
        observe: 'events',
        responseType: 'blob',
      }
    );
  }

  getStatus(): Observable<any> {
    return this.http.get<any>(`${this.base_url}/tabledata`);
  }

  // public getPDF(): Observable<Blob> {
  //   //const options = { responseType: 'blob' }; there is no use of this
  //       let uri = '/my/uri';
  //       // this.http refers to HttpClient. Note here that you cannot use the generic get<Blob> as it does not compile: instead you "choose" the appropriate API in this way.
  //       return this.http.get(uri, { responseType: 'blob' });
  //   }
}
