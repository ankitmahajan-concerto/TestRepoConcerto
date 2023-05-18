import {
  Component,
  ElementRef,
  Inject,
  OnInit,
  ViewChild,
} from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { data } from '../../shared/model/data';
import { ReplaySubject, Subject, takeUntil } from 'rxjs';
import {
  MatSnackBar,
  MatSnackBarHorizontalPosition,
  MatSnackBarVerticalPosition,
} from '@angular/material/snack-bar';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FileUploadService } from '../../shared/services/file-upload.service';
import { ApiCallService } from '../../shared/services/api-call.service';
import { Router } from '@angular/router';
import { MatSelectChange } from '@angular/material/select';
import Swal from 'sweetalert2';
import { fileExtensionValidator } from '../../shared/directive/file-extension.directive';

@Component({
  selector: 'app-dialog',
  templateUrl: './dialog.component.html',
  styleUrls: ['./dialog.component.scss'],
})
export class DialogComponent implements OnInit {
  uploadForm: FormGroup;
  @ViewChild('fileInput') fileInput: ElementRef;
  fileAttr = 'Choose File';
  countryList: any;
  display: FormControl = new FormControl('', Validators.required);
  file_store!: FileList;

  range = new FormGroup({
    start: new FormControl<Date | null>(null),
    end: new FormControl<Date | null>(null),
  });

  file_list: Array<string> = [];
  checked = false;
  disabled = false;
  data = new data('', '', '', '', ''); // model class
  file!: any; // durgesh
  r_name!: any;
  rulelist: any = [];

  selectedValue: any;
  selectedData: { value: any; text: string };
  rulelist1: any = [];
  actiontype: any = [];
  actionrule: any;
  rollback: any = 0;
  ruleFilterCtrl: FormControl = new FormControl();
  public filteredRules: ReplaySubject<any> = new ReplaySubject<any>(1);
  protected _onDestroy = new Subject<void>();

  horizontalPosition: MatSnackBarHorizontalPosition = 'center';
  verticalPosition: MatSnackBarVerticalPosition = 'top';
  action_typ: any;

  title: any;
  acceptedExtensions = 'xls, xlsx, ods';

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private uploadService: FileUploadService,
    private api: ApiCallService,
    private ups: FileUploadService,
    private dailogref: MatDialogRef<DialogComponent>,
    private _snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public card_data: any
  ) {}

  ngOnInit(): void {
    this.title = this.card_data.title;
    console.log(this.card_data);
    this.uploadForm = this.formBuilder.group({
      category: ['', Validators.required],
      rule: ['', Validators.required],
      ruleName: ['', Validators.required],
      file: [
        '',
        [Validators.required, fileExtensionValidator(this.acceptedExtensions)],
      ],
      rollback: [''],
    });

    this.getData();
  }

  changerulename(e: any) {
    console.log(e);
    this.selectedValue = e;
    this.rulelist1.forEach((rule: any) => {
      if (rule.LRULEID == this.selectedValue) {
        console.log(rule.L10N_VALUE);
      }
    });
  }

  getData() {
    this.api.getruledef().subscribe((data: any) =>
      data.forEach((element: any) => {
        this.rulelist.push(element);
      })
    );

    this.api.actiontype().subscribe((data: any) => {
      data.forEach((element: any) => {
        this.actiontype.push(element);
      });
    });
  }

  protected filterRules() {
    if (!this.rulelist1) {
      return;
    }
    console.log(this.rulelist1);
    // get the search keyword
    let search = this.ruleFilterCtrl.value;
    if (!search) {
      this.filteredRules.next(this.rulelist1.slice());
      return;
    } else {
      search = search.toLowerCase();
    }
    // filter the banks
    this.filteredRules.next(
      this.rulelist1.filter(
        (rule: any) => rule.L10N_VALUE.toLowerCase().indexOf(search) > -1
      )
    );
  }

  setValue(e: any) {
    console.log(this.rollback);
    if (e.checked == true) {
      this.rollback = 1;
    } else {
      this.rollback = 0;
    }
    this.data.rollbackflag = this.rollback;
  }

  addFile() {
    if (!this.uploadForm.invalid) {
      this.data.rollbackflag = this.rollback;
      this.api.postData(this.data, this.file).subscribe({
        next: (Response: any) => {
          this.uploadForm.reset(); // reset form
          this.dailogref.close('Sucessfully added'); // closing form
          this.uploadService.update.next();
          let timerInterval: any;
          Swal.fire({
            title: 'File is processing!',
            html: 'Please wait file is processing this will take some time...!',
            timer: 2000,
            timerProgressBar: true,
            didOpen: () => {
              Swal.showLoading();
              let b: any =
                Swal.getHtmlContainer()?.querySelector('b')?.textContent;
              timerInterval = setInterval(() => {
                b = Swal.getTimerLeft();
              }, 200);
            },
            willClose: () => {
              clearInterval(timerInterval);
            },
          }).then((result) => {
            /* Read more about handling dismissals below */

            if (result.dismiss === Swal.DismissReason.timer) {
              if (Response.code == '000') {
                Swal.fire({
                  icon: 'success',
                  title: `Your file is processed and file status is ${
                    Response.message == 'SUCCESS'
                      ? 'COMPLETED'
                      : Response.message
                  }`,
                  showConfirmButton: true,
                });
              } else if (Response.code == '999') {
                Swal.fire({
                  icon: 'error',
                  title: `Your file is processed and file status is ${
                    Response.message == 'Fail' ? 'Failed' : Response.message
                  }`,
                  showConfirmButton: true,
                });
              }
            }
          });
        },
        error: (error) => {
          console.log(error);
          this._snackBar.open(error.error.message, 'OK', {
            horizontalPosition: this.horizontalPosition,
            verticalPosition: this.verticalPosition,
          });
        },
        complete: () => {
          console.log('request is completed');

          this.uploadService.update.next();
        },
      });
    } else {
      Swal.fire({
        icon: 'error',
        title: `Please fill all the mandetory form fields`,
        showConfirmButton: true,
      });
    }
  }

  onChangeFileField(event: any) {
    this.file = event.target.files[0];
    this.data.filename = this.file.name;
    this.fileAttr = this.file.name;
  }

  dailogclose() {
    this.dailogref.close();
  }

  selectedValueRule(event: MatSelectChange) {
    this.selectedData = event.value;

    this.api.rulename(this.selectedData, this.action_typ).subscribe({
      next: (Response) => {
        console.log(Response);
        let type = 'ruletype';
        this.getdrplist(Response, type);
      },
      error: (error) => {
        console.log(error);
      },
      complete: () => {
        console.log('request is completed');
      },
    });

    // )
  }

  selectedActionType(event: MatSelectChange) {
    this.action_typ = event.value;

    let type = 'actiontype';
    
    this.uploadForm.controls['rule'].setValue("");

    this.getdrplist(Response, type);


  }
  getdrplist(data: any, type: any) {
    if (type == 'actiontype') {
      this.actionrule = data;
    } else if (type == 'ruletype') {
      this.rulelist1 = data;
    } else {
      console.log('no data');
    }

    this.filteredRules.next(this.rulelist1.slice());

    // listen for search field value changes
    this.ruleFilterCtrl.valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe(() => {
        this.filterRules();
      });
  }
}
