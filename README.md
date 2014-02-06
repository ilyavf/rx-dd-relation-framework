Drag'n'Drop Reactive Relation Framework
=======================================

In 2010 I worked with one of my friends in eFactorLabs who created a Video Survelance Platform and wanted to get a web ui for it. The project itself was called 3D-EYE. The main concepts for the UI were: 

- there is a list of cameras (in a retail store, manufacturing or even residential);
- user wants to watch some of cams simultaneously (security, safety, whatever);
- UI has some predefined layouts where cameras could be dropped in to stream video to;
- user can reorganize and modify layouts by moving borders between items;
- user can create his own layouts;
- user can switch between different views (layouts).

As a starting point, we decided that we need a light reactive framework for creating block-based UI via defining behaviour and relation between blocks.

A layout is a droppable area for cameras, it contains of several square blocks that are resizable and movable with a mouse:

<pre>
____________________         ____________________ 
|             |     |        |  a |      b       | 
|     a       | b   |        |____|______________|
|_____________|_____|   =>   |    |              |
|       |     |     |        |  c |      d       |   
|   c   | d   | e   |        |    |              |  
--------------------         --------------------   

</pre>

User can move borders between the areas to create a convient view of the video streams.
User can drag and drop camera objects for video stream being shown in the area.

Current version of the commercial platform does not use this framework but is built based on ExtJS.

See http://efactorlabs.com/ for more details.
The actual product screenshots here: http://efactorlabs.com/portfolio_item.html

##Demo

For demo just open in your browser index_maze.html and index_drag.html

##Usage

###Drag-Resize-Stop

-1. Assume you have some html looking like this:
```html
	<div id="e1" class="e1">e1</div>
	<div id="e2" class="container">e2</div>
	<div id="e3" class="container">e3</div>
```
-2. Instantiate dynamic objects related to the DOM elements:
```js
	var e1 = new ElementObj('e1');
	var e2 = new ElementObj('e2');
	var e3 = new ElementObj('e3');
```
-3. Apply behavior (drag, resize)
```js
	e1.applyBehavior( BehaviorResize() );   // now element e1 is resizeable
	e2.applyBehavior( BehaviorDrag() );     // now e2 is draggable
	e3.applyBehavior( BehaviorDrag() );     // e3 is both draggable and resizeable
	e3.applyBehavior( BehaviorResize() );
```
-4. Define relations (move, stop)
```js
  // When you drag e1 it can move e2 and vice versa:
	var R12 = new Relation('R12', e1, e2, RelationFuncMove);

  // When you drag e3 it will be stopped by e2 and vice versa:
	var R34 = new Relation('R34', e3, e2, RelationFuncStop);
```

###Maze / Sokoban (implemented as a jQuery plugin)

- Here is your maze ('.block'), actor ('.main'), and some boxes ('block_00' and 'block_01') that our actor can move:
```html
<div class="main move" id="block_0"></div>
<div class="move" id="block_00"></div>
<div class="move" id="block_01"></div>

<div class="block" id="block_1"></div>
<div class="block" id="block_2"></div>
<div class="block" id="block_3"></div>
...
```
- Define game logic:
```js
	jQ('.main').toDynamic().toDragable().activateBehaviours();
	jQ('.move').addRelationMove();
	jQ('.block').toDynamic().addRelationStop('.move');
```
And that's it! you can now play the Sokoban game! =)

