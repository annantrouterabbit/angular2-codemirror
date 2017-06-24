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

	Addition Options
	----------------
	1. mimes- Its value must be array of string(s). Each string denotes the mime supported for particular language.
	2. onDemandLoadJs- Its value must be boolean. If you want to load required js file except codemirror.js on demand then set this flag to true.
	3. codemirrorAPIUrl- Its value must be a string denoting the path of folder of codemirror like '/node_modules/codemirror'. It is used to load js file on demand. 