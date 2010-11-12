// Mark CURRENT_WORK - look for it to find what was the last thing...

// global correction to coor:
var GLOBAL_DC = 2;


//----------------------------------------------
// // // //    - ENVIRONMENT object:


//----------------------------------------------
// // // //    - ELEMENT object:
var ElementObj = function(id, params){
	this.params = params || {};
	var self = this;
	
	this.id = id;
	//this.elt = $(this.id);
	this.elt = document.getElementById(this.id);
	this.zindex = this.params.zindex || null;
	
	this.pipeline_params = {
		activate_out: 	this.params.pipeline_out || false,
		activate_in:	this.params.pipeline_in || false
	}


	// for mouse:
	this.dx;
	this.dy;

	// coordinates:
	this.coor = function(){return get_div_coor(this.id)};
	this.new_coor = {};
	this.left = function(new_left){
		if (new_left) {set_left(this.id, new_left)};
		return this.coor().left;
	}
	this.top = function(new_top){
		if (new_top) {set_top(this.id, new_top)};
		return this.coor().top;
	}
	this.width = function(new_width){
		if (new_width) {set_width(this.id, new_width)};
		return this.coor().width;
	}
	this.height = function(new_height){
		if (new_height) {set_height(this.id, new_height)};
		return this.coor().height;
	}
	this.right 	= function(){return this.coor().right;}
	this.bottom = function(){return this.coor().bottom;}

	// Array of object's Relations:
	this.relations = [];
	this.registerRelation = function(relObj){
		this.relations.push(relObj);
	}

	// Array of object's Behaviors:
	this.behaviors = [];

	// Create receiver for redrawing:
	this.receiverRedraw = receiverE();


	// ??? used in prev version
	this.receiverMd = receiverE();

	// Create mouse_down stream on this element:
	this.mdStream = new MMouseDownStream(this);


	// To store full mdown+move+drop stream:
	this.MStream = {};
	
	// to be executed on mouse drop (mouseup):
	this.onMDrop = function(){return true;}
	
	
	/** 
	 * Event / listener functionality. 
	 */
	 
	// array to store pairs {event_code: function}
	this.event_reaction = {};
	
	if (self.pipeline_params.activate_in){
		this.pipeline_activate_in();
	}

} // End of ElementObj.


ElementObj.prototype.setEventReaction = function(event_code, func_handler){
	var self = this;
	this.event_reaction[event_code] = func_handler;
	/*function (){
		func_handler(self);
	}*/
	
}
ElementObj.prototype.sendEvent = function(event_code){
	if (prop_in_obj(event_code, this.event_reaction) ){
		this.event_reaction[event_code](this);
	}
}


// Check all relations whether new coor are acceptable:
ElementObj.prototype.checkRelations = function(info){
	var i = this.relations.length;
	if (i == 0){
		return info;
	}
	debug("checkRelations for " + this.id + ": " + i, 'open');

	// save current element in chain request (to be skipped in other relations):
	info.chainReq = info.chainReq || {elements: [], relations: []};
	info.chainReq.elements.push(this);
	//info.passive_new_coor_allowed = true;

	while (i--){
		debug('- relation ' + this.relations[i].id, 'open');
		// IF relation was registered in chain, THEN skip it:
		if (obj_in_array(this.relations[i], info.chainReq.relations)){
			debug('-- skip relation ' + this.relations[i].id + ' - already in chainReq.', 'close');
			continue;
		}
		// check dependant:
		info = this.relations[i].checkDependant(info);
		
		/* This is wrong because dx could be not allowed and at the same time dy could be allowed, and 
			we have to check other relations.
		// IF returns not_allowed THEN exit immidiately:
		if (info.recursive_check_stop === true){
			debug('- checkRelations['+i+']: ('+this.relations[i].id+') recursive_check_stop=true => return info', 'close');
			debug('', 'close');
			return info;
		}
		*/
		debug('','close');
	}

	debug('', 'close');
	return info;
}


ElementObj.prototype.redraw = function(info){
	info.dependants = info.dependants || 'none';
	if (info.new_coor){
		var debug_str = '--- redraw [' + info.elt_obj.id + ']: ';
		if (info.new_coor.left)
			debug_str += 'new left= '+info.new_coor.left;
		if (info.new_coor.top)
			debug_str += ', new top= '+info.new_coor.top;
		if (info.new_coor.width)
			debug_str += ', new width= '+info.new_coor.width;
		if (info.new_coor.height)
			debug_str += ', new height= '+info.new_coor.height;
		debug_str += ' dependants: ' +  info.dependants;
		debug(debug_str);
		
		if (info.new_coor.left){
			this.left(info.new_coor.left);
		}
		if (info.new_coor.top){
			this.top(info.new_coor.top);
		}
		if (info.new_coor.width){
			this.width(info.new_coor.width);
		}
		if (info.new_coor.height){
			this.height(info.new_coor.height);
		}
	}
	// redraw all dependants if exist:
	if (info.dependants != 'none'){
		for (var i in info.dependants){
			info.dependants[i].elt_obj.redraw(info.dependants[i]);
		}
	}
}


ElementObj.prototype.set_drag_style = function(id, zindex){
	//var coor = get_div_coor(id);
	set_offset(id, get_offset(id));
	set_style(id, 'position', 'absolute');
	set_style(id, 'float', 'none');
	set_style(id, 'margin', '0');
	set_style(id, 'padding', '0');
	set_style(id, 'border', '1px green solid');
	if (typeof zindex !== 'undefined' && zindex !== null){
		debug('zindex=' + zindex);
		set_style(id, 'z-index', zindex);
	}
}
	
	

// Apply behavior function on each mouse stream event:
ElementObj.prototype.applyBehavior = function(Behavior){
	var self = this;
	this.behaviors.push(Behavior);
	debug('- applyBehavior(' + Behavior.type + ') on [' + this.id + ']');
}

// Activates all applied begaviors:
ElementObj.prototype.activateBehaviors = function(){

	// make div positioned absolute:
	this.set_drag_style(this.id, this.zindex);

	var self = this;
	//redraw on event:
	var redrawE = this.receiverRedraw.mapE(
		function(info){
			self.checkRelations(info);
			self.redraw(info);
			//debug_now('-cursor: ' + info.cursor);
			return info;
		}
	);
	var cursorE = redrawE.mapE(function(p){
		return (p.cursor) 
	});
		
	insertValueE(cursorE, document.body,"style","cursor");

	// Detect which behavior is active for md event:
	var mdStream_detectBehavior = this.mdStream.mapE(
		function(info){
			var b_amount = self.behaviors.length;
			debug('- behaviors amount: ' + b_amount);
			
			if (b_amount > 0){
				for (var i in self.behaviors){
					if ( self.behaviors[i].activateFunc(info) ){
						info.activeBehavior = self.behaviors[i];
						debug('- activeBehavior: ' + info.activeBehavior.type);
						break;
					}
				}
			}
			return info;
		}
	);
		
	// Create full mdown+move+drop stream:
	this.MStream = MMouseDMDStream(mdStream_detectBehavior);

	// Bugfix: for some reason mouseup on document happens 6 times:
	var mouseup_six_fix = 0;

	this.MStream.mapE(
		// has info {elt_obj, mm}:

		function(info){
			var tmp = mouseup_six_fix;
			
			if (info.elt_obj){
				mouseup_six_fix = 1;

				if (info.activeBehavior){
					//apply behavior function on current info:
					var behavior_result = info.activeBehavior.effectFunc(info);

					//save desired new_coor inside the element:
					if (behavior_result.new_coor){
						info.elt_obj.new_coor = behavior_result.new_coor;

						//check if new_coor are possible:

						//redraw with new_coor:
						info.elt_obj.receiverRedraw.sendEvent(behavior_result);
					}
				}



				//self.relationFilters[0](behavior_result, self.elements);
			}
			
			if (info.event === 'drop'){
				//debug_now('- drop is true');
				if (mouseup_six_fix === 1){
					mouseup_six_fix = 0;
					debug_now('- self.onMDrop: ...');
					
					// Send event to all ElementObj instances:
					if (self.pipeline_params.activate_out){
						self.pipeline.sendEvent({
							event: 'drop', 
							mm: info.mm, 
							id: self.id 
						});
					}
					
					// execute on_mouse_drop function:
					self.onMDrop();
				}
			}
			if (info.event === 'move'){
				if (self.pipeline_params.activate_out){
					// Send event to all ElementObj instances:
					self.pipeline.sendEvent({
						event: 'move', 
						mm: info.mm, 
						id: self.id 
					});
				}
			}
		}
	);
}

ElementObj.prototype.addMDropFunc = function(func){
	this.onMDrop = func;
}


ElementObj.prototype.pipeline = receiverE();

ElementObj.prototype.pipeline_activate_in = function(){
	var self = this;
	this.pipeline.mapE(
	
		// @param {event, mm, id}
		function(info){
		
			if (!self.pipeline_params.activate_in){
				//debug_now('pipeline is not active for id=' + self.id);
				return false;
			}
			
			switch (info.event){
			
				// DROP
				case 'drop':
					if (
						self.id != info.id
						&& self.is_inside(info.mm, info.event)
					){
						//var old = jQ('#' + self.id).html();
						jQ('#' + self.id).html(info.id);
					}
					break;
					
				// MOUSE OVER:
				case 'move':
				
					if(self.id != info.id){
					
						if ( self.is_inside(info.mm) ){
							//debug_now(info.event + ', ' + self.id + ', - INSIDE');
							//jQ('#' + self.id).css("border", "1px red dotted;");
							jQ('#' + self.id).css("background-color", "red");
							
						} else {
							//debug_now(info.event + ', ' + self.id + ', - OUT');
							//jQ('#' + self.id).css("border", "1px green green");
							jQ('#' + self.id).css("background-color", "");
						}
					}
					break;
				
				case 'cursor':
					if ( self.is_inside(info.mm) ){
						var cursor_style = 'move';
						var nearborder = self.is_nearborder(info.mm)
						if (nearborder){
							cursor_style = nearborder;
						}
						document.body.style.cursor = cursor_style;
						info.event = false;
					} else {
						document.body.style.cursor = "";
					}
					break;
					
				case 'test':
					debug_now('TEST ' + self.id);
					break;
			}
		}
	);
};

ElementObj.prototype.is_inside = function(mm, event){
	var coor = this.coor();
	if (coor === false || typeof mm == 'undefined'){
		return false;
	}
	if (event == 'drop'){
		debug_now('--drop: mm: ' + (typeof mm) );
		debug_now('--drop: mm.clientX: ' + (typeof mm.clientX) );
		//debug_now('::: mm=' + dump(mm) );
	}
	
	if (mm.clientX > coor.left 
		&& mm.clientX < coor.right
		&& mm.clientY > coor.top
		&& mm.clientY < coor.bottom 
	){
		return true;
	}
	return false;
}

ElementObj.prototype.is_nearborder = function(mm){
	var dc = 10;
	
	var coor = this.coor();
	if (coor === false || typeof mm == 'undefined'){
		return false;
	}
	//debug_now('mm.clientX=' + mm.clientX);
	
	if (coor.left < mm.clientX && mm.clientX < coor.left + dc){
		return "w-resize";
	}
	
	if (coor.right - dc < mm.clientX && mm.clientX < coor.right){
		return "e-resize";
	}
	
	if (coor.top < mm.clientY && mm.clientY < coor.top + dc){
		return "n-resize";
	}
	
	if (coor.bottom - dc < mm.clientY && mm.clientY < coor.bottom){
		return "s-resize";
	}
	
	return false;
}





//----------------------------------------------
// // // //    - STREAMS:

// Stream - result on mouse_down + mouse_move + mouse_drop
MMouseDMDStream = function(MdStream){
	var elt_obj = {};
	// register mousedown:
	var moveEE = MdStream.mapE(function(info) {

		elt_obj = info.elt_obj;
		debug('[MMouseDMDStream]: id: ' + info.elt_obj.id + ', md.x: ' + info.md.clientX, 'clear');
		// dx and dy are offset of the mouse relative to top and left position of the box

		// register mousemove:
		return extractEventE(document,"mousemove").mapE(
			function(mm){
				//debug('[MMouseStream.mousemove]: id: ' + info.elt_obj.id + ', mm.x: ' + mm.clientX);
				return {
					event: 'move',
					elt_obj: elt_obj,
					md: info.md,
					mm: mm,
					dx: info.dx,
					dy: info.dy,
					activeBehavior: info.activeBehavior
				}
			}
		);

	});


	// register mouseup:
	var dropEE = extractEventE(document,"mouseup").mapE(function(mu) {

		//enable test selection
		if (typeof document.onselectstart!="undefined") {
			document.onselectstart=null
		} else {
			document.onmousedown=null;  
			document.onmouseup=null;
		}
		//debug('ENABLE TEXTSELECT');
		
		//debug_now('--- mouseup');
		
		return oneE({
			event: 'drop',
			drop: true,
			mm: mu
		})
	});

	return mergeE(moveEE,dropEE).switchE();
}


// Stream - mouse_down on element obj:
var MMouseDownStream = function(elt_obj){
	var elt_id = elt_obj.id;
	var elt = elt_obj.elt || getObj(elt_id);
	
	if (!elt){
		debug_now('ERROR: no elt found for MMouseDownStream: elt_id=' + elt_id + ', elt=' + elt_obj.elt);
	}

	// register mousedown:
	var md = extractEventE(elt,"mousedown").mapE(function(md){
		var dx = md.clientX - elt_obj.left();
		var dy = md.clientY - elt_obj.top();
		var info = {
			elt_obj: elt_obj,
			md: md,
			dx: dx,
			dy: dy
		}
		// ???:
		//elt_obj.relationReceiver.sendEvent(info);
		
		//disable text selection
		if (typeof document.onselectstart!="undefined") {
			document.onselectstart=new Function ("return false");
		} else {
			document.onmousedown=new Function ("return false");  
			document.onmouseup=new Function ("return true");
		}
		//debug('DISABLE TEXTSELECT');
		//debug_now('--- mousedown');
		
		
		return info;
	});
	return md;
}


extractEventE(document,"mousemove").mapE(
	function(mm){
		ElementObj.prototype.pipeline.sendEvent({event:'cursor', mm: mm, id: 'test'});
	}
);

