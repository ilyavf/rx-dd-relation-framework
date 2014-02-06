Drag'n'Drop Reactive Relation Framework
=======================================

A reactive framework for creating block-based UI via defining behaviour and relation between blocks.

The goal was to have a small effective framework to use for a Video Survelance System layouts. 
A layout is a droppable area for cameras, it contains of several square blocks that are resizable.

<pre>
____________________         ____________________ 
|             |     |        |  a |      b       | 
|     a       | b   |        |____|______________|
|_____________|_____|   =>   |    |     |        |
|       |     |     |        |  c |   d |   e    |   
|   c   | d   | e   |        |    |     |        |  
--------------------         --------------------   

</pre>

User can move borders between the areas to create a convient view of the video streams.
User can drag and drop camera objects for video stream being shown in the area.

A project was called 3D-EYE and initiated by eFactorLabs company.
Current version of the commercial version does not use this framework but is built based on ExtJS.

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

