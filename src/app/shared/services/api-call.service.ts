import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { data } from '../model/data';

import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ApiCallService {
  base_url: string = environment.base_url;

  constructor(private httpClient: HttpClient) {}

  postData(data: data, file: Blob) {
    let formData = new FormData();
    formData.append('file', file);
    //  formData.append("file",data.file);
    formData.append('data', JSON.stringify(data));
    return this.httpClient.post(this.base_url + '/uploads', formData);
    //cal the api
  }

  rulename(ruletype: any, actiontype: any) {
    let formData = new FormData();
    formData.append('ruletype', ruletype);
    formData.append('actiontype', actiontype);
    return this.httpClient.post(this.base_url + '/ruletype', formData);
  }
  getruledef(): Observable<any[]> {
    return this.httpClient.get<any>(this.base_url + '/ruledef');
  }

  actiontype(): Observable<any[]> {
    return this.httpClient.get<any>(this.base_url + '/actionlevel');
  }
}
