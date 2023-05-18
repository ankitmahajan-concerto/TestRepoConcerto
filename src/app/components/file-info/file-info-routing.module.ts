import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FileInfoComponent } from './file-info.component';

const routes: Routes = [
  {
    path: '',
    component: FileInfoComponent,
    data: {
      title: 'File Info'
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FileInfoRoutingModule { }
