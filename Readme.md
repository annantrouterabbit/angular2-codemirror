angular2-codemirror
---------------------

This is a wrapper over codemirror native code, written to use in angular2 application. 

Featuers
--------
1. reload editor each time on changing its configuration.
2. provides a way to load required js file on-demand(lazyload). So, you have to only include codemirror.js file in index.html. You can use the feature of lazyload to set addition options.


Setup
------
1. npm install codemirror --save
1. write a copy task to copy the codemirror API folder in build.
2. include CodeEditorModule into your module.
3. Inside your template include a tag <codemirror [(ngModel)] = 'Code' id='code' name='code'></codemirror>
4. In your controller set codemirror editor configuration options with addition options - mimes(Array of string), onDemandLoadJs(boolean), codemirrorAPIUrl(string).

	Codemirror configuration Options
	--------------------------------
	For code mirror options visit to https://codemirror.net/doc/manual.html#config

	Addition Options
	----------------
	1. mimes- Its value must be array of string(s). Each string denotes the mime supported for particular language.
	2. onDemandLoadJs- Its value must be boolean. If you want to load required js file except codemirror.js on demand then set this flag to true.
	3. codemirrorAPIUrl- Its value must be a string denoting the path of folder of codemirror like '/node_modules/codemirror'. It is used to load js file on demand.
	4. disableCopy - Its value must be boolean. If you want to disable copy from editor then set this flag with true value. 
	5. disableCut - Its value must be boolean. If you want to disable cut from editor then set this flag with true value. 
	5. disablePaste - Its value must be boolean. If you want to disable paste into editor then set this flag with true value.

	Events
	------
	1. [ngModel] - Its value must be string and used to add code texts into editor. It is used to implement one-way binding.
					<codemirror [ngModel] = 'Code' id='code' name='code'></codemirror>

	2. [(ngModel)] - Its value must be string and used to add code texts into editor and get changed text of editor. It is used to implement two-way binding which means if you change text in editor, it will reflect in binded variable.
					<codemirror [(ngModel)] = 'Code' id='code' name='code'></codemirror>

	3. (ngModelChange) - used to get contents of editor in string format. It is used to implement two-way binding which means if you change text in editor, it will reflect in binded variable.
					<codemirror [ngModel] = 'Code' (ngModelChange) = 'getEditorCode($event)' id='code' name='code'></codemirror>

	4. (onEditorLoaded) - It notify when editor successfully loaded in both feature(default or lazyloaded) and provide an instance of currently loaded editor in paramete. It is useful when you want to get instance of editor and do some task after editor loaded.
					<codemirror [(ngModel)] = 'Code' (onEditorLoaded) = 'doSomeTask($event)' id='code' name='code'></codemirror>

