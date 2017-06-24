// Imports
import {
  Component,
  Input,
  Output,
  ElementRef,
  ViewChild,
  EventEmitter,
  forwardRef,
  OnChanges
} from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import * as $script from 'scriptjs';
import {CodeMirrorEditorProvider} from './codemirror.service';
declare var CodeMirror: any;

class JSObject {
  constructor(private jsObject: any) {}
  isEqual(comparisonObject: any) {
    for(const key in this.jsObject) {
      if(this.jsObject[key] != comparisonObject[key])
        return false;
    }
    return true;
  }
}

/**
 * CodeMirror component
 * Usage :
 * <codemirror [(ngModel)]="data" [config]="{...}"></ckeditor>
 */
 @Component({
   selector: 'codemirror',
   providers: [
   {
     provide: NG_VALUE_ACCESSOR,
     useExisting: forwardRef(() => CodemirrorComponent),
     multi: true
   }
   ],
   template: `<textarea #host id="{{editorId}}" name="{{editorId}}" [hidden]="!fileLoaded"></textarea><div *ngIf="showLoadingMsg && !fileLoaded" style="text-align: center; padding-top: 20px;">Loading code editor...</div>`
 })
 export class CodemirrorComponent {

   @Input() editorId: string;
   @Output() change = new EventEmitter();
   @Output() onEditorLoaded = new EventEmitter();
   editor;
   @ViewChild('host') host;

   fileLoaded: boolean;
   _mode: string;
   _defaultConfig: any =  {
     lineNumber: true,
     mode: {name: 'javascript', globalVars: true },
     theme: 'tomorrow-night-bright'
   };
   _value = '';
   _config:any = this._defaultConfig;
   _height: any = null;
   _width: any = null;
   @Output() instance = null;

  /**
   * Constructor
   */
   constructor(private codeMirrorEditorProvider: CodeMirrorEditorProvider){}

   @Input() showLoadingMsg: boolean;
   //set height of editor
   @Input()
   set height(newHeight) {
     this._height = newHeight;
     if(this.instance) {
       this.instance.setSize(null, this._height);
     }
   }

   //set height of editor dynamically
   @Input()
   set width(newWidth) {
     this._width = newWidth;
     if(this.instance) {
       this.instance.setSize(null, this._width);
     }
   }

   @Input() 
   set config(configOptions: any){
     configOptions = configOptions || this._defaultConfig;
     configOptions.mode = configOptions.mode || this._defaultConfig.mode;
     this._mode = (typeof configOptions.mode == 'string')? configOptions.mode: configOptions.mode.name;
     this.setEditorConfigurationOptions(configOptions);

   }


   get config(){
     return this._config;
   }

   get value(): any { return this._value; };
   @Input() set value(v) {
     if (v !== this._value) {
       this._value = v;
       this.onChange(v);
     }
   }

  /**
   * On component destroy
   */
   ngOnDestroy(){

   }

  /**
   * On component view init
   */
   ngOnInit(){
     this._config = this._config || this._defaultConfig;
     this._config.codemirrorAPIUrl = this._config.codemirrorAPIUrl || '/node_modules/codemirror';
     this._mode = (typeof this._config.mode == 'string')? this._config.mode: this._config.mode.name;
     this.loadJsBeforeInitEditor();
   }

   loadJsBeforeInitEditor() {
     if(this._config.onDemandLoadJs && this._config.codemirrorAPIUrl) {
       let baseUrl = this._config.codemirrorAPIUrl;
       let fileUrls: Array<string> = [];
         //setting url of file required for a mode
         this.listRequiredFileUrlForMode(this._mode, fileUrls);
         if(this._mode == 'htmlmixed' || this._mode == 'htmlembedded' ) {
           this.listRequiredFileUrlForMode('css', fileUrls);
           this.listRequiredFileUrlForMode('javascript', fileUrls);

         }
         $script(fileUrls, () => {
           this.fileLoaded = true;
           this.codemirrorInit(this._config);
           this.onEditorLoaded.emit();
         });

       //path of matchbrackets file
     } else {
         this.fileLoaded = true;
         this.codemirrorInit(this._config);
         this.onEditorLoaded.emit();
     }
   }

   listRequiredFileUrlForMode(mode, fileUrlsArray) {
     let modeBaseUrl = `${this._config.codemirrorAPIUrl}/mode`;
     fileUrlsArray.push(`${modeBaseUrl}/${mode}/${mode}.js`);
     this.setFileUrlForAddon(fileUrlsArray);    
     this.setFileUrlForKeyMap(fileUrlsArray);
   }

   setFileUrlForAddon(fileUrlsArray) {
     this.setFileUrlForSearchAddon(fileUrlsArray);
     this.setFileUrlForlintAddon(fileUrlsArray);
     this.setFileUrlForSelectionAddon(fileUrlsArray);
     this.setFileUrlForHintAddon(fileUrlsArray);
     this.setFileUrlForEditAddon(fileUrlsArray);
   }

   setFileUrlForEditAddon(fileUrlsArray) {
     let editAddonBaseUrl = `${this._config.codemirrorAPIUrl}/addon/edit`;
     if(this._config.autoCloseBrackets) {
       fileUrlsArray.push(`${editAddonBaseUrl}/closebrackets.js`);
     } 
     if(this._config.autoCloseTags) {
       fileUrlsArray.push(`${editAddonBaseUrl}/closetag.js`);
     } 
     if(this._config.matchTags) {
       fileUrlsArray.push(`${editAddonBaseUrl}/matchtags.js`);
     } 
     if(this._config.matchBrackets) {
       fileUrlsArray.push(`${editAddonBaseUrl}/matchbrackets.js`);
     } 
     if(this._config.showTrailingSpace) {
       fileUrlsArray.push(`${editAddonBaseUrl}/trailingspace.js`);
     } 
     if(this._mode == 'markdown') {
       fileUrlsArray.push(`${editAddonBaseUrl}/continuelist.js`);
     }

   }

   setFileUrlForSelectionAddon(fileUrlsArray) {
     let selectionBaseUrl = `${this._config.codemirrorAPIUrl}/addon/selection`;
     if(this._config.styleSelectedText) {
       this.setFileUrlForSearchAddon(fileUrlsArray);
       fileUrlsArray.push(`${selectionBaseUrl}/mark-selection.js`);
     } else if(this._config.styleActiveLine) {
       fileUrlsArray.push(`${selectionBaseUrl}/active-line.js`);
     }

   }

   setFileUrlForSearchAddon(fileUrlsArray) {
     let searchBaseUrl = `${this._config.codemirrorAPIUrl}/addon/search`;
     if(this._config.styleSelectedText) {      
       fileUrlsArray.push(`${searchBaseUrl}/searchcursor.js`);
     }

   }

   setFileUrlForlintAddon(fileUrlsArray) {
     if(this._config.lint) {
       let lintBaseUrl = `${this._config.codemirrorAPIUrl}/addon/lint`;
       fileUrlsArray.push(`${lintBaseUrl}/lint.js`);
       if(this._mode == 'htmlembedded' || 
         this._mode == 'htmlmixed') {
         fileUrlsArray.push(`${lintBaseUrl}/html-lint.js`);
     } else if(this._mode == 'yaml' ||
       this._mode == 'javascript' ||
       this._mode== 'css' ||
       this._mode == 'json' ||
       this._mode == 'coffeescript') {
       fileUrlsArray.push(`${lintBaseUrl}/${this._mode}-lint.js`);
     }
   }
 }

 setFileUrlForHintAddon(fileUrlsArray) {
   if(this._config.hint) {
     let lintBaseUrl = `${this._config.codemirrorAPIUrl}/addon/hint`;
     fileUrlsArray.push(`${lintBaseUrl}/show-hint.js`);
     fileUrlsArray.push(`${lintBaseUrl}/anyword-hint.js`);
     if(this._mode == 'htmlembedded' || 
       this._mode == 'htmlmixed') {
       fileUrlsArray.push(`${lintBaseUrl}/html-hint.js`);
   } else if(this._mode == 'yaml' ||
     this._mode == 'javascript' ||
     this._mode == 'css' ||
     this._mode == 'json'){
     fileUrlsArray.push(`${lintBaseUrl}/${this._mode}-hint.js`);
   } else if(this._mode == 'coffeescript') {
     fileUrlsArray.push(`${lintBaseUrl}/javascript-hint.js`);
   }
 }
}

setFileUrlForKeyMap(fileUrlsArray) {
  let keyMapBaseUrl = `${this._config.codemirrorAPIUrl}/keymap`;
  fileUrlsArray.push(`${this._config.codemirrorAPIUrl}/addon/comment/comment.js`);
  fileUrlsArray.push(`${this._config.codemirrorAPIUrl}/addon/comment/continuecomment.js`);
  if(this._config.keyMap.length) {
    fileUrlsArray.push(`${keyMapBaseUrl}/${this._config.keyMap}.js`);
  }
}
  /**
   * Initialize codemirror
   */
   codemirrorInit(config){
     //CodeMirror.modeURL = this._config.modeUrl;
     this.setModeAsMimeForLanguage(config);
     this.instance = CodeMirror.fromTextArea(this.host.nativeElement, config);
     this.instance.setSize(this._width, this._height);
     this.writeValue(this.value);
     this.instance.refresh();
     this.instance.on('change', () => {
       this.updateValue(this.instance.getValue());
     });
     this.instance.on('copy', (instance, event)=>{
       if(config.disableCopy) {
         event.preventDefault();
       }       
     });
     this.instance.on('cut', (instance, event)=>{
       if(config.disableCut) {
         event.preventDefault();
       }     
     });
     this.instance.on('paste', (instance, event)=>{
       if(config.disablePaste) {
         event.preventDefault();
       }       
     });
   }

   /**
   * this method set mode as mime for some language like c, c++, java etc which has issue with their default mode like clike.
   */
   setModeAsMimeForLanguage(config) {
       if(config.mimes && config.mimes.length) {
         config.mode = CodeMirror.mimeModes[config.mimes[0]] || config.mode;
       } else{
         config.mode = config.mode || 'javascript';
       }
       
   }

  /**
   * Value update process
   */
   updateValue(value){
     this.value = value;
     this.onChange(value);
     this.onTouched();
     this.change.emit(value);
   }

  /**
   * Implements ControlValueAccessor
   */
   writeValue(value){
     this._value = value || '';
     if (this.instance) {
       this.instance.setValue(this._value);
     }
   }

  /**
  * Set editor configuration
  **/
  setEditorConfigurationOptions(newConfiguration) {
    let comparisonObject = new JSObject(newConfiguration);
    if(!comparisonObject.isEqual(this._config)) {
      this._config = Object.assign({}, this._config, newConfiguration);
      this.codeMirrorUpdateOptions();
    } else{
      if(this.instance){
        this.onEditorLoaded.emit();
      }
      
    }
  }

  codeMirrorUpdateOptions() {
    if(this.instance) {
      let fileUrlArray: Array<string> = [];
      //lazy loading required files for a mode
      this.listRequiredFileUrlForMode(this._mode, fileUrlArray);
      $script(fileUrlArray, () => {
        this.instance.setSize(this._width, this._height);
        this.setModeAsMimeForLanguage(this._config);
        for(const optionKey in this._config) {
          this.setEditorOption(optionKey, this._config[optionKey]);
        }
        this.instance.refresh();
        this.onEditorLoaded.emit();
      });
      

    }
  }

  //method to add words to show hint words in autocomplete
  addWordsIntoEditorHintList() {
      let hintWords = CodeMirror.hintWords || [];
      
      let hintWordList = [];
      for(let mime of this._config.mimes) {
        hintWordList = hintWordList.concat(hintWords[mime] || []);
      }
      if(hintWordList.length) {
        CodeMirror.hintWords[this._mode] = hintWordList;
      }
  }

  setEditorOption(optionName, optionValue) {
    if(optionName) {
      this.instance.setOption(optionName, optionValue);
    }
  }
  
  onChange(_){}
  onTouched(){}
  registerOnChange(fn){this.onChange = fn;}
  registerOnTouched(fn){this.onTouched = fn;}
}

