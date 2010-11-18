
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
	
	// ratio = width / height
	this.ratio = 3/2;

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
			if (border == 'left') { border = 'nw'; }
			else if (border == 'right') { border = 'ne'; }
			else { border = 'top';}
		}
		if (mouse.clientY < (b + 5) && mouse.clientY > (b - 10) ){
			if (border == 'left') { border = 'sw'; }
			else if (border == 'right') { border = 'se'; }
			else { border = 'bottom';}
		}

		self.effectParam = border;
		debug('- effectParam = ' + border + ' (mouse.clientX=' + mouse.clientX + ', mouse.clientY=' + mouse.clientY + 
			', l=' + l + ', r=' + r + ', t=' + t + ', b=' + b + ')');

		return border;
	}
	
	// Returns new_coor based on current_coor and mouse_coor:
	var borderResize = function(info){
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
		
		var get_new = function(border, ratio, once){
			var once = once || false;
			var ratio = ratio || false;
			switch (border){
				case 'left':
					l = info.mm.clientX - info.dx;
					w = w_old + (l_old - l);
					if (!once){
						get_new('bottom', 1, 1);
					}
					break;
				case 'right':
					if (ratio && once){
						w = parseInt(h * ratio);
					} else {
						w = info.mm.clientX - l_old + 5;
						if (!once){
							get_new('bottom', ratio, 1);
						}
					}
					break;
				case 'top':
					t = info.mm.clientY - info.dy;
					h = h_old + (t_old - t);
					if (!once){
						get_new('right', ratio, 1);
					}
					break;
				case 'bottom':
					if (ratio && once){
						h = parseInt(w / ratio);
					} else {
						h = info.mm.clientY - t_old + 5;
						if (!once){
							get_new('right', ratio, 1);
						}
					}
					break;
				case 'nw':
					get_new('top', ratio, 1);
					get_new('left', ratio, 1);
					break;
				case 'ne':
					get_new('top', ratio, 1);
					get_new('right', ratio, 1);
					break;
				case 'sw':
					get_new('bottom');
					get_new('left');
					break;
				case 'se':
					get_new('bottom');
					get_new('right');
					break;
			}
		}
		get_new(border, self.ratio);

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
	};


	var b = new Behavior(
		'resize', 
		borderResize,
		startResize
	);
	return b;
};

