import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FileInfoRoutingModule } from './file-info-routing.module';
import { FileInfoComponent } from './file-info.component';
import { MatModule } from 'src/app/shared/modules/mat.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FilterItemDirective } from 'src/app/shared/directive/filter-item.directive';


@NgModule({
  declarations: [FileInfoComponent,FilterItemDirective],
  imports: [
    CommonModule,
    FileInfoRoutingModule,
    MatModule,
    FormsModule,
    ReactiveFormsModule
  ],
  exports: [FileInfoComponent]
})
export class FileInfoModule { }
