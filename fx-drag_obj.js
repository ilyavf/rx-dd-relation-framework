// Mark CURRENT_WORK - look for it to find what was the last thing...

// global correction to coor:
var GLOBAL_DC = 2;


//----------------------------------------------
// // // //    - ENVIRONMENT object:


//----------------------------------------------
// // // //    - ELEMENT object:
ElementObj = function(id){
	var self = this;
	
	this.id = id;
	this.elt = $(this.id);


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
	
	// make div positioned absolute:
	this.set_drag_style(id);

} // End of ElementObj.

// Container for recursive action check functions and properties:
/*ElementObj.prototype.RecursiveCheck = function(){	//(thisElementObj)
	///this.chainReq = {elements: [], relations: []};
	this.allowed = true;

	// checks whether obj exists in arr:
	var exists = function(obj, arr){
		var i = arr.length;
		while(i--){
			if (obj.id == arr[i].id){return true;}
		}
		return false;
	}

	// returns true if elt/rel exists:
	this.elt_exists = function(eltObj, info){
		return exists(eltObj, info.elements);	//thisElementObj.elements
	}
	this.rel_exists = function(eltObj, info){
		return exists(eltObj, info.relations);	//thisElementObj.elements
	}
	this.allow_change = function(flag){
		if (flag != null) {this.allowed = flag;}
		return this.allowed;
	}
}*/

function obj_in_array(obj, arr){
	var i = arr.length;
	while(i--){
		if (obj.id == arr[i].id){return true;}
	}
	return false;
}


// Check all relations whether new coor are acceptable:
ElementObj.prototype.checkRelations = function(info){
	var i = this.relations.length;
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
	//set_style(id, 'z-index', zindex);
}
	
	

// Apply behavior function on each mouse stream event:
ElementObj.prototype.applyBehavior = function(Behavior){
	var self = this;
	this.behaviors.push(Behavior);
	debug('- applyBehavior(' + Behavior.type + ') on [' + this.id + ']');
}

// Activates all applied begaviors:
ElementObj.prototype.activateBehaviors = function(){
	var self = this;
	//redraw on event:
	this.receiverRedraw.mapE(
		function(info){
			self.checkRelations(info);
			self.redraw(info);
		}
	);

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

	this.MStream.mapE(
		// has info {elt_obj, mm}:

		function(info){
			if (info.elt_obj){

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
		}
	);
}


//----------------------------------------------
// // // //    - RELATION object:
Relation = function(id, parentObj, childObj, func){
	var self = this;
	this.id = id;
	this.parentObj = parentObj;
	this.childObj = childObj;
	this.func = func || function(p){debug("--- default relation func exec --- ("+ this.id +")"); return p};

	this.parentObj.registerRelation(this);
	this.childObj.registerRelation(this);

	// info : {elt_obj, new_coor}
	this.checkDependant = function(info){
		var info_obj = info.elt_obj || null;
		var info_id =  info_obj.id || null;
		debug("[checkDependant(info_id = " + info_id + ")] in " + this.id, 'open');

		// IF element was registered in chain, THEN stop check and set allowed flag:
		/* commented - we have to check only relations.
		if (info.elt_exists(self)){
			info.allow_change(true);
			return info;
		}*/
			
		//var dependant = {};
		var activeObj = {};
		var passiveObj = {};


		switch (info_id){
			case this.parentObj.id:
				activeObj = this.parentObj;
				passiveObj = this.childObj;
				break;
			case this.childObj.id:
				activeObj = this.childObj;
				passiveObj = this.parentObj;
				break;
			default:
				debug('ERROR: cannot find dependant for [' + info_id + ']');
				return info;
		}
		debug("- active: " + activeObj.id + ", passive: " + passiveObj.id);

		// if passive is the element that is the very first then skip this relation:
		if (passiveObj.id == info.elt_id_first){
			debug('-- skipping the first element ['+info.elt_id_first+']');
			return info;
		}

		// ACTION CHECK BODY HERE:
		// ... ... ...
		var elements_conflict = self.func(activeObj, passiveObj, info);
		///info = dependant.checkAction(info);

		if (elements_conflict !== false){
			// register this relation in chainReq for current check:
			info.chainReq.relations.push(this);
			debug('-- added relation '+this.id+' to chainReq.');
		}

		debug('', 'close');
		return info;
	}
}

// Reation Function Generic:
RelationFunc = function(activeObj, passiveObj, info){
	var self = this;

	// IF active obj new_coor are conflicting with passive obj coor THEN reset new_coor:
	this.contact = {
		top: function(){
			if (info.new_coor.top == false){
				return false;
			}
			return (
				info.new_coor.top  < passiveObj.bottom()
				&& info.elt_obj.top() > passiveObj.top()
				&& info.elt_obj.left() < passiveObj.right()
				&& info.elt_obj.right() > passiveObj.left()
			);
		},
		bottom : function(){
			if (info.new_coor.top == false && info.new_coor.height == false){
				return false;
			}
			var t = info.new_coor.top || info.elt_obj.top();
			var h = info.new_coor.height || info.elt_obj.height()
			return (
				(t + h ) > passiveObj.top()
				&& info.elt_obj.top() < passiveObj.top()
				&& info.elt_obj.right() > passiveObj.left()
				&& info.elt_obj.left() < passiveObj.right()
			);
		},
		left: function(){
			if (info.new_coor.left == false){
				return false;
			}
			return (
				info.new_coor.left < passiveObj.right()
				&& info.elt_obj.left() > passiveObj.left()
				&& info.elt_obj.bottom() > passiveObj.top()
				&& info.elt_obj.top() < passiveObj.bottom()
			);
		},
		right: function(){
			if (info.new_coor.left == false && info.new_coor.width == false){
				return false;
			}
			var l = info.new_coor.left || info.elt_obj.left();
			var w = info.new_coor.width || info.elt_obj.width()
			return (
				(l + w ) > passiveObj.left()
				&& info.elt_obj.left() < passiveObj.left()
				&& info.elt_obj.bottom() > passiveObj.top()
				&& info.elt_obj.top() < passiveObj.bottom()
			);
		},
		any: function(){
			return (
				self.contact.bottom() || self.contact.top() ||
				self.contact.right() || self.contact.left()
			)
		},
		get: function(){
			if(self.contact.bottom()) return 'bottom';
			if(self.contact.top()) return 'top';
			if(self.contact.right()) return 'right';
			if(self.contact.left()) return 'left';
			return false;
		}
	};

}

// Function: one element stops another:
// -
RelationFuncStop = function(activeObj, passiveObj, info){
	debug('start: info.new_coor = ' + info.new_coor);
	/*debug("RelationFuncStop(" + activeObj.id + ", " + passiveObj.id + "): bottom=" +
		(info.new_coor.top + activeObj.height()) + ", top=" + passiveObj.top() +
		"<br />=> " + (info.new_coor.top + activeObj.height() > passiveObj.top())
	);*/
	var RF = new RelationFunc(activeObj, passiveObj, info);
	if (RF.contact.any() === false){
		debug("- "+activeObj.id+": no contact with "+passiveObj.id+". Exit.");
		return false;
	} else {
		debug("RelationFuncStop(" + activeObj.id + ", " + passiveObj.id + "): left=" + info.new_coor.left +
			", passive right=" + (passiveObj.left() + passiveObj.width()) +
			" => " + RF.contact.get()
		);
	}
	
	if ( RF.contact.bottom() ){
		var top_wanted = info.new_coor.top;
		info.new_coor.top = passiveObj.top() - info.elt_obj.height() - GLOBAL_DC;
		info.recursive_check_stop = true;
	}
	if ( RF.contact.top() ){
		info.new_coor.top = passiveObj.bottom() + GLOBAL_DC;
		info.recursive_check_stop = true;
	}
	if ( RF.contact.right() ){
		info.new_coor.width = passiveObj.left() - activeObj.left() - GLOBAL_DC;
		info.recursive_check_stop = true;
	}
	if ( RF.contact.left() ){
		var left_wanted = info.new_coor.left;
		info.new_coor.left = passiveObj.right() + GLOBAL_DC;
		
		var dl = info.new_coor.left - left_wanted;
		info.new_coor.width = info.new_coor.width - dl;
		
		info.recursive_check_stop = true;
	}

	debug('finish: info.new_coor = ' + info.new_coor + ' (dl=' + dl + ')');
	// may be return just bool to indicate recursive check stop? (info was already changed)
	return info;
}

// Function: one element moves another:
// -
RelationFuncMove = function(activeObj, passiveObj, info){
	var RF = new RelationFunc(activeObj, passiveObj, info);
	if (RF.contact.any() === false){
		debug("- "+activeObj.id+": no contact with "+passiveObj.id+". Exit.");
		return false;
	} else { //debug:
		debug("RelationFuncMove(" + activeObj.id + ", " + passiveObj.id + "): left=" + info.new_coor.left +
			", passive right=" + (passiveObj.left() + passiveObj.width()) +
			" => " + RF.contact.get()
		);
	}

	//29.07.2010: if chain > 1 => call stop func.

	var info_passive ={
		elt_id_first: info.elt_id_first || info.id,
		chainReq: info.chainReq,
		elt_obj: passiveObj,
		new_coor: {}
	};
	var passive_desired_coor = {};

	// IF active obj new_coor are conflicting with passive obj coor
	// THEN ask passiveObj if its possible to move it
	// (MOST IMPORTANT WORK):

	// In general: we have to take into account where active obj is located relative to
	// passive obj, and then check which borders they are contacting based on desired
	// new coordinates.

	var check_contact = function(){
		var param = param || 'left';

		// contact_border - the border of the active element which is contacting the passive:
		var contact_border = RF.contact.get();
		debug('- check_contact: ' + contact_border);



		if ( contact_border !== false ){
			// Now we want to check if we can move passive object.
			// We use new_coor of activeObj to calculate new_coor for passive obj:

			var l = info.new_coor.left || activeObj.left();
			var t = info.new_coor.top || activeObj.top();
			var w = info.new_coor.width || activeObj.width();
			var h = info.new_coor.height || activeObj.height();


			switch (contact_border){
				case 'left':
					passive_desired_coor.left = (l - passiveObj.width() - GLOBAL_DC);
					info_passive.new_coor.left = passive_desired_coor.left;
					break;
				case 'right':
					passive_desired_coor.left = (l + w + GLOBAL_DC);
					info_passive.new_coor.left = passive_desired_coor.left;
					break;
				case 'top':
					passive_desired_coor.top = (t - passiveObj.height() - GLOBAL_DC);
					info_passive.new_coor.top = passive_desired_coor.top;
					break;
				case 'bottom':
					passive_desired_coor.top = (t + h + GLOBAL_DC);
					info_passive.new_coor.top = passive_desired_coor.top;
					break;
			}
		}

		// check desired new coor whether acceptable:
		//passiveObj.checkAction(info_passive);
		passiveObj.checkRelations(info_passive);

		if (contact_border == 'left' || contact_border == 'right') var change_param = 'left';
		if (contact_border == 'top' || contact_border == 'bottom') var change_param = 'top';
		debug('-- passiveObj '+passiveObj.id+': passive_desired.'+change_param+'=' + passive_desired_coor[change_param] +
			', actual '+change_param+'=' + info_passive.new_coor[change_param] +
			' => ' + (info_passive.new_coor[change_param] != passive_desired_coor[change_param]) );

		// compare original desired new coor to adjusted by check:
		if (
			change_param == 'left' && info_passive.new_coor.left != passive_desired_coor.left ||
			change_param == 'top' && info_passive.new_coor.top != passive_desired_coor.top

		){
			// what is happening here??? (add comment!)
			debug('-- passive_desired coor are BAD => adjust activeObj new_coor');

			//desired coor were adjusted => cannot move => adjust new_coor for active obj:
			switch (contact_border){
				case 'left':
					info.new_coor.left = passiveObj.left() + passiveObj.width() + GLOBAL_DC;
					break;
				case 'right':
					info.new_coor.left = passiveObj.left() - activeObj.width() - GLOBAL_DC;
					break;
				case 'top':
					info.new_coor.top = passiveObj.top() + passiveObj.height() + GLOBAL_DC;
					break;
				case 'bottom':
					info.new_coor.top = passiveObj.top() - activeObj.height() - GLOBAL_DC;
					break;
			}


		} else {
			// what is happening here??? (add comment!)
			debug('-- passive_desired coor are OK');
		}

		// desired coor are ok => allow change (do not adjust new_coor):
		debug('-- adding dependant ['+info_passive.elt_obj.id+'] into ['+info.elt_obj.id+']');
		info.dependants = info.dependants || [];
		/*
		 * We add dependants into each element, so they dont know about each other :(
		 * => useless to check the way below.
		 *for (var i in info.dependants){
			// if we already want to redraw this element -> check which one should be used:
			debug('-- check dependants: ' + info.dependants[i].elt_obj.id + ' with ' + info_passive.elt_obj.id);
			if (info.dependants[i].elt_obj.id == info_passive.elt_obj.id){
				// if diff 2 > diff 1 => use diff 2:
				if (
					info_passive.new_coor.left
					&&	(info_passive.new_coor.left - info_passive.elt_obj.left()) >
						(info.dependants[i].new_coor.left - info_passive.elt_obj.left())
				){
					info.dependants[i] = info_passive;
					debug('-- use new passive new_coor for ' + info_passive.elt_obj.id);
				} else {
					debug('-- use existing passive new_coor for ' + info_passive.elt_obj.id);
				}

				return info;
			}
		}*/
		info.dependants.push(info_passive);

	}
	check_contact();

	

	// may be return just bool to indicate recursive check stop? (info was already changed)
	return info;
}


//----------------------------------------------
// // // //    - BEHAVIOR object:
// @method	: effectFunc	: defines start condition.
// @method	: activateFunc	: defines start condition.
Behavior = function(type, effectFunc, activateFunc){
	this.type = type || 'undefined';
	this.effectFunc		= effectFunc || function(p){ return p;};
	this.activateFunc	= activateFunc || function(p){ return true; };

	this.effectParam = '';
}

BehaviorDrag = function(){
	var b = new Behavior(
		'drag',
		function(info){
			if (info.drop){
				debug('- drop is true');
				return false;
			}
			//debug('id: ' + info.elt_obj.id + ', mm.x: ' + info.mm.clientX + ', dx: ' + info.dx);
			return {
				elt_obj: info.elt_obj,
				new_coor:{
					left:	info.mm.clientX - info.dx,
					top:	info.mm.clientY - info.dy
				}
			}
		}
	);
	return b;
};

BehaviorResize = function(){
	var self = this;

	// activateFunc:
	var startResize = function(info){
		var border = false;
		var mouse = info.mm || info.md;
		var l = info.elt_obj.left();
		var r = info.elt_obj.right();
		var t = info.elt_obj.top();
		var b = info.elt_obj.bottom();

		if (mouse.clientX > (l - 5) && mouse.clientX < (l + 10) ){
			border = 'left';
		}
		if (mouse.clientX < (r + 5) && mouse.clientX > (r - 10) ){
			border = 'right';
		}
		if (mouse.clientY > (t - 5) && mouse.clientY < (t + 10) ){
			border = 'top';
		}
		if (mouse.clientY < (b + 5) && mouse.clientY > (b - 10) ){
			border = 'bottom';
		}

		self.effectParam = border;
		debug('- effectParam = ' + border);

		return border;
	}


	var b = new Behavior(
		'resize',
		function(info){
			if (info.drop){
				debug('- drop is true');
				return false;
			}
			// Border to move:
			var border = self.effectParam;

			var l_old = info.elt_obj.left();
			var w_old = info.elt_obj.width();
			var t_old = info.elt_obj.top();
			var h_old = info.elt_obj.height();
			debug2('l_old=' +l_old+ ', l=' +l+ ', w_old=' +w_old+ ', w=' +w);

			// new coor:
			var l = false;
			var w = false;
			var t = false;
			var h = false;
			
			switch (border){
				case 'left':
					l = info.mm.clientX - info.dx;
					w = w_old + (l_old - l);
					break;
				case 'right':
					//var l = info.mm.clientX - info.dx;
					w = info.mm.clientX - l_old + 5;
					break;
				case 'top':
					t = info.mm.clientY - info.dy;
					h = h_old + (t_old - t);
					break;
				case 'bottom':
					h = info.mm.clientY - t_old + 5;
					break;
			}

			var new_coor = {};
			if (l != false) {
				new_coor.left = l;
			}
			if (t != false) {
				new_coor.top = t;
			}
			if (w != false) {
				new_coor.width = w;
			}
			if (h != false) {
				new_coor.height = h;
			}
			
			return {
				elt_obj: info.elt_obj,
				new_coor: new_coor
			}
		},
		function (info){
			return startResize(info);
		}
	);
	return b;
};


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
		return $E(document,"mousemove").mapE(
			function(mm){
				//debug('[MMouseStream.mousemove]: id: ' + info.elt_obj.id + ', mm.x: ' + mm.clientX);
				return {
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
		return oneE({
			drop: true
		})
	});

	return mergeE(moveEE,dropEE).switchE();
}


// Stream - mouse_down on element obj:
MMouseDownStream = function(elt_obj){
	var elt_id = elt_obj.id;
	var elt = elt_obj.elt;

	// register mousedown:
	var md = $E(elt,"mousedown").mapE(function(md){
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
		
		return info;
	});
	return md;
}




// Utility functions:
function get_width(id){
	return jQ('#'+id).width();
}
function get_height(id){
	return jQ('#'+id).height();
}
function get_offset(id){
	var offset = jQ('#'+id).offset();
	//debug('[get_offset]: id=' + id + ', offset=' + offset);
	return offset;
}
function get_div_coor(id){
	var offset = get_offset(id);
	var div_coor = {
		left:	offset.left,
		right:	offset.left + get_width(id),
		top:	offset.top,
		bottom:	offset.top + get_height(id),
		width:	get_width(id),
		height:	get_height(id)
	}
	return div_coor;
}

function get_style(id, styleProp) {
	var el = $(id);
	if (el.currentStyle)
		var st = el.currentStyle[styleProp];
	else if (window.getComputedStyle)
		var st = document.defaultView.getComputedStyle(el, null).getPropertyValue(styleProp);
	return st;
}
function set_style(id, styleProp, value) {
	jQ('#'+id).css(styleProp, value);
} 

function set_left(id, val){
	jQ('#'+id).css('left', val + 'px');
}
function set_top(id, val){
	jQ('#'+id).css('top', val + 'px');
}
function set_width(id, val){
	jQ('#'+id).css('width', val + 'px');
}
function set_height(id, val){
	jQ('#'+id).css('height', val + 'px');
}
function set_offset(id, offset){
	jQ('#'+id).css('left', offset.left + 'px');
	jQ('#'+id).css('top', offset.top + 'px');
}


//????????: ????????????? "????????" ? ????? ?????????? - ???? ??? ???????? ????? ???????
// ? ?????????, ?? ???????? ? ???, ??? ??? ?????????? ????? ????????? ? ??????? ???????????,
// ?? ?? ????????? ??? ????????, ????? ??????? ?? ???? "? ?????? ???????", ????? ??? ???
// ????? ???????.
//????????? ???????: ?? ???????? ????????? ? ??????? ???????????, ???? ????????? ?? ????.
// (- ???????)


//????????: ?.?. ???????? 2? ?????? ?????????, ?? ???? ? ??? ?? ??????? ????? ???? ???????
// ????? ??????? ??????????.
//????????? ???????: ???? ??????? ??? ??????? ???? ???, ?? 2? ??? ??? ???????? ?? ????.
// (- ??? ?? ???????)