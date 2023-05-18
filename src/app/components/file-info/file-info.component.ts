import {
  HttpEventType,
  HttpResponse,
  HttpErrorResponse,
  HttpEvent,
} from '@angular/common/http';
import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Observable, Subject } from 'rxjs';
import { FileUploadService } from '../../shared/services/file-upload.service';
import { DialogComponent } from '../dialog/dialog.component';
import { saveAs } from 'file-saver';
import { MatButtonToggleGroup } from '@angular/material/button-toggle';

export const CONDITIONS_LIST = [
  { value: 'nono', label: 'Nono' },
  { value: 'is-empty', label: 'Is empty' },
  { value: 'is-not-empty', label: 'Is not empty' },
  { value: 'is-equal', label: 'Is equal' },
  { value: 'is-not-equal', label: 'Is not equal' },
];

export const CONDITIONS_FUNCTIONS = {
  // search method base on conditions list value
  'is-empty': function (value: string, filterdValue: any) {
    return value === '';
  },
  'is-not-empty': function (value: string, filterdValue: any) {
    return value !== '';
  },
  'is-equal': function (value: any, filterdValue: any) {
    return value == filterdValue;
  },
  'is-not-equal': function (value: any, filterdValue: any) {
    return value != filterdValue;
  },
};

@Component({
  selector: 'app-file-info',
  templateUrl: './file-info.component.html',
  styleUrls: ['./file-info.component.scss'],
})
export class FileInfoComponent implements OnInit {
  selectedFiles?: FileList;
  currentFile?: File;
  parameter: any[];
  progress = 0;
  message = '';
  parameter1: any[];
  fileStatus = { status: '', requestType: '', percent: 0 };
  fileInfos!: Observable<any>;
  filename: any;
  filenames: string[] = [];

  public conditionsList = CONDITIONS_LIST;
  public searchValue: any = {};
  public searchCondition: any = {};
  private _filterMethods = CONDITIONS_FUNCTIONS;

  displayedColumns: string[] = [
    'Sr.No',
    'File Name',
    'Status',
    'DTREQUESTED',
    'Download Files',
  ];

  fileExt = ['xlsx', 'xls', 'txt', 'ods'];

  file_ext: any;

  dataSource: MatTableDataSource<any>;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  getAll: any;
  data: any = {};
  pageEvent: PageEvent;
  pageSize: any;

  constructor(
    private uploadService: FileUploadService,
    private dialog: MatDialog,
    private dtr: ChangeDetectorRef
  ) {
    this.pageSize =
      localStorage.getItem('pageSize') == ''
        ? 5
        : localStorage.getItem('pageSize');

    /** Whether the button toggle group contains the id as an active value. */
  }

  isSticky(buttonToggleGroup: MatButtonToggleGroup, id: string) {
    return (buttonToggleGroup.value || []).indexOf(id) !== -1;
  }

  setPage(e: any) {
    // console.log(this.pageEvent.pageSize);
    console.log(e.pageSize);
    localStorage.setItem('pageSize', e.pageSize);
    this.pageSize = localStorage.getItem('pageSize');
  }
  selectFile(event: any): void {
    this.selectedFiles = event.target.files;
  }

  upload(): void {
    this.progress = 0;

    if (this.selectedFiles) {
      const file: File | null = this.selectedFiles.item(0);

      if (file) {
        this.currentFile = file;

        this.uploadService.upload(this.currentFile).subscribe({
          next: (event: any) => {
            if (event.type === HttpEventType.UploadProgress) {
              this.progress = Math.round((100 * event.loaded) / event.total);
            } else if (event instanceof HttpResponse) {
              this.message = event.body.message;
              this.fileInfos = this.uploadService.getFiles();
            }
          },
          error: (err: any) => {
            console.log(err);
            this.progress = 0;

            if (err.error && err.error.message) {
              this.message = err.error.message;
            } else {
              this.message = 'Could not upload the file!';
            }

            this.currentFile = undefined;
          },
        });
      }

      this.selectedFiles = undefined;
    }
  }
  ngOnInit(): void {
    this.getData();

    console.log(window.navigator.onLine);
  }



  getData() {
    this.uploadService.update$.subscribe(() => {
      this.fileInfos = this.uploadService.uploadfile();
      this.fileInfos.forEach((file) => {
        this.dataSource = new MatTableDataSource(file);
        console.log(this.dataSource);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        this.paginator._changePageSize(this.paginator.pageSize);
      });
    });

    this.uploadService.update.next();
  }

  openInfo(filename: any) {
    this.fileInfos.forEach((file) => {
      for (let i = 0; i < file.length; i++) {
        if (filename == file[i].FILENAME) {
          this.data.action_level = file[i].ACTION_LEVEL;
          this.data.rule_name = file[i].RULENAME;
          this.data.rule_type = file[i].RULETYPE;
          this.data.message = file[i].MESSAGE;
        }
      }
    });
    this.dialog.open(DialogComponent, {
      width: '40%',
      data: { title: 'Info', data: this.data },
    });
  }

  // getAllDetails() {
  //   this.uploadService.getStatus().subscribe({
  //     next: (res) => {
  //       this.fileInfos.forEach((file) => {
  //         file.forEach((f:any) => {
  //           this.parameter = res;
  //           if (f == res.FILENAME) {
  //             console.log(res.FILENAM);
  //             console.log(res.STATUS);
  //           }
  //         });

  //       });
  //     },
  //     error: (err) => {
  //       alert('while fetching the record');
  //     },
  //   });
  // }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  onDownloadFile(filename: string): void {
    console.log(filename + 'FILENAM');
    this.uploadService.download(filename).subscribe(
      (event) => {
        console.log(event + 'TESTING');
        this.resportProgress(event, filename);
      },
      (error: HttpErrorResponse) => {
        console.log(error);
      }
    );
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
}
