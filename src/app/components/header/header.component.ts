import { Component } from '@angular/core';
import { DialogComponent } from '../dialog/dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { FileUploadService } from 'src/app/shared/services/file-upload.service';
import {
  HttpErrorResponse,
  HttpEvent,
  HttpEventType,
} from '@angular/common/http';
import Swal from 'sweetalert2';
import * as saveAs from 'file-saver';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent {
  fileExt = ['xlsx', 'xls', 'txt', 'ods'];

  file_ext: any;
  fileStatus: any;
  filenames: any;

  constructor(
    private dialog: MatDialog,
    private uploadService: FileUploadService
  ) {}

  openDialog() {
    this.dialog.open(DialogComponent, {
      width: '40%',
      data: { title: 'Form' },
      disableClose: true,
    });
  }

  onExtSelection() {
    let file_name: any;
    // console.log(this.file_ext);
    if (this.file_ext == 'ods') {
      file_name = 'new_template.ods';
    } else if (this.file_ext == 'xls') {
      file_name = 'new_template.xls';
    } else {
      Swal.fire({
        icon: 'info',
        title: 'File extension is not supported yet.',
      });
    }
    if (this.file_ext == 'xls' || this.file_ext == 'ods') {
      this.uploadService.downloadTemplete(file_name).subscribe(
        (event) => {
          console.log(event + 'TESTING');
          this.resportProgress(event, file_name);
        },
        (error: HttpErrorResponse) => {
          console.log(error);
        }
      );
    }
  }

  private resportProgress(
    httpEvent: HttpEvent<string[] | Blob>,
    fname: any
  ): void {
    switch (httpEvent.type) {
      case HttpEventType.UploadProgress:
        this.updateStatus(httpEvent.loaded, httpEvent.total!, 'Uploading... ');
        break;
      case HttpEventType.DownloadProgress:
        this.updateStatus(
          httpEvent.loaded,
          httpEvent.total!,
          'Downloading... '
        );

        break;
      case HttpEventType.ResponseHeader:
        console.log('Header returned', httpEvent);
        break;
      case HttpEventType.Response:
        if (httpEvent.body instanceof Array) {
          this.fileStatus.status = 'done';
          for (const filename of httpEvent.body) {
            this.filenames.unshift(filename);
          }
        } else {
          saveAs(
            new Blob([httpEvent.body!], {
              type: `${httpEvent.headers.get('Content-Type')};charset=utf-8`,
            }),
            fname
          );
        }
        this.fileStatus.status = 'done';
        break;
      default:
        console.log(httpEvent);
        break;
    }
  }

  private updateStatus(
    loaded: number,
    total: number,
    requestType: string
  ): void {
    this.fileStatus.status = 'progress';
    this.fileStatus.requestType = requestType;
    this.fileStatus.percent = Math.round((100 * loaded) / total);
  }
  //   let data:any = {}

  //   data.fileExt = this.file_ext;
  //   data.title = 'File';
  //   this.dialog.open(DialogComponent, {
  //     width: '40%',
  //     data: data,
  //     disableClose:true
  //   })
  // }
}
