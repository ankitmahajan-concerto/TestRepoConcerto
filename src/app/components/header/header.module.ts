import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './header.component';
import { MatModule } from '../../shared/modules/mat.module';
import { FormsModule } from '@angular/forms';



@NgModule({
  declarations: [HeaderComponent],
  imports: [
    CommonModule,
    MatModule,
    FormsModule
  ],
  exports: [HeaderComponent]
})
export class HeaderModule { }
