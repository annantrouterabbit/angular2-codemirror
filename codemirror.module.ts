import {NgModule} from '@angular/core';
import { CommonModule } from '@angular/common';
import {CodemirrorComponent} from './codemirror.editor.component';
import {CodeMirrorEditorProvider} from './codemirror.service';
/**
 * CodemirrorModule
 */
@NgModule({
  imports: [
  	CommonModule
  ],
  declarations: [
    CodemirrorComponent,
  ],
  providers: [CodeMirrorEditorProvider],
  exports: [
    CodemirrorComponent,
  ]
})
export class CodemirrorModule{}

