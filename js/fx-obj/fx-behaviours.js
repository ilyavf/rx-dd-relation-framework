
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
		debug('- effectParam = ' + border + ' (mouse.clientX=' + mouse.clientX + ', mouse.clientY=' + mouse.clientY + 
			', l=' + l + ', r=' + r + ', t=' + t + ', b=' + b + ')');

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

