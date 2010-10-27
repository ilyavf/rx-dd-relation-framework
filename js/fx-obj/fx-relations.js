

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
RelationFunc = function(activeObj, passiveObj, info, direction){
	var direction = direction || 'outside';

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
				&& direction == 'outside'
				||
				info.new_coor.top  <= passiveObj.top()
				&& direction != 'outside'
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
				&& direction == 'outside'
				||
				(t + h ) > passiveObj.bottom()
				&& direction != 'outside'
				
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
				&& direction == 'outside'
				||
				info.new_coor.left < passiveObj.left()
				&& direction != 'outside'
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
				&& direction == 'outside'
				||
				(l + w ) > passiveObj.right()
				&& direction != 'outside'
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
	var inside = true;
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
		if (info.new_coor.height){
			// for resize:
			info.new_coor.height = passiveObj.top() - activeObj.top() - GLOBAL_DC;
		} else {
			// for drag:
			info.new_coor.top = passiveObj.top() - info.elt_obj.height() - GLOBAL_DC;
		}
		info.recursive_check_stop = true;
	}
	if ( RF.contact.top() ){
		var top_wanted = info.new_coor.top;
		info.new_coor.top = passiveObj.bottom() + GLOBAL_DC;
		
		var dl = info.new_coor.top - top_wanted;
		info.new_coor.height = info.new_coor.height - dl;
		
		info.recursive_check_stop = true;
	}
	if ( RF.contact.right() ){
		if (info.new_coor.width){
			// for resize:
			info.new_coor.width = passiveObj.left() - activeObj.left() - GLOBAL_DC;
		} else {
			// for drag:
			info.new_coor.left = passiveObj.left() - info.elt_obj.width() - GLOBAL_DC;
		}
		
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

// Function: one element stops another:
// -
RelationFuncStopInside = function(activeObj, passiveObj, info){
	debug('start: info.new_coor = ' + info.new_coor);
	var RF = new RelationFunc(activeObj, passiveObj, info, 'inside');
	if (RF.contact.any() === false){
		debug("- "+activeObj.id+": no contact with "+passiveObj.id+". Exit.");
		return false;
	} else {
		debug("RelationFuncStopInside(" + activeObj.id + ", " + passiveObj.id + "): left=" + info.new_coor.left +
			", passive right=" + (passiveObj.left() + passiveObj.width()) +
			" => " + RF.contact.get()
		);
	}
	
	if ( RF.contact.bottom() ){
		if (info.new_coor.height){
			// for resize:
			info.new_coor.height = passiveObj.bottom() - activeObj.top() - 1;
		} else {
			// for drag:
			info.new_coor.top = passiveObj.bottom() - info.elt_obj.height() - 1;
		}
		info.recursive_check_stop = true;
	}
	if ( RF.contact.top() ){
		var top_wanted = info.new_coor.top;
		info.new_coor.top = passiveObj.top() + 1;
		
		var dl = info.new_coor.top - top_wanted;
		info.new_coor.height = info.new_coor.height - dl;
		
		info.recursive_check_stop = true;
	}
	if ( RF.contact.right() ){
		if (info.new_coor.width){
			// for resize:
			info.new_coor.width = passiveObj.right() - activeObj.left() - 1;
		} else {
			// for drag:
			info.new_coor.left = passiveObj.right() - info.elt_obj.width() - 1;
		}
		
		info.recursive_check_stop = true;
	}
	if ( RF.contact.left() ){
		var left_wanted = info.new_coor.left;
		info.new_coor.left = passiveObj.left() + 1;
		
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

