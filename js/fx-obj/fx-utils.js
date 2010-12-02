//----------------------------------------------
// // // //    		- Utility functions:

function get_width(id){
	return jQ('#'+id).width();
}
function get_height(id){
	return jQ('#'+id).height();
}
function get_offset(id, startpos_id){
	var startpos_id = startpos_id || null;
	debug('[get_offset]: id=' + id + ', startpos_id=' + startpos_id, 'open');
	var offset = jQ('#'+id).offset();
	if (startpos_id && startpos_id != 'document'){
		// IN_PROCESS
		var startpos_offset = jQ('#'+startpos_id).offset();
		debug('startpos_offset=' + dump(startpos_offset) );
		offset.top -= startpos_offset.top;
		offset.left -= startpos_offset.left;
	}
	debug('offset=' + dump(offset), 'close');
	return offset;
}
function get_div_coor(id){
	var offset = get_offset(id);
	if (offset == null){
		debug_now('SYSTEM ERROR: [get_div_coor] id=' + id + ': offset is null (' + offset + ')' );
		return false;
	}
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
	if (offset){
		jQ('#'+id).css('left', offset.left + 'px');
		jQ('#'+id).css('top', offset.top + 'px');
	} else {
		debug_now('ERROR: offset is null. [set_offset]: id=' + id + ', offset=' + offset);
	}
}

/*/ modify left/right relatively to start point:
function set_coor_val_with_startpos(coor_name, coor_val, startpos_id){
	if (startpos_id && startpos_id != 'document'){
		// IN_PROCESS
		var startpos_offset = jQ('#'+startpos_id).offset();
		debug('startpos_offset=' + dump(startpos_offset) );
		offset.top -= startpos_offset.top;
		offset.left -= startpos_offset.left;
	}
}*/


function obj_in_array(obj, arr){
	var i = arr.length;
	while(i--){
		if (obj.id == arr[i].id){return true;}
	}
	return false;
}
function prop_in_obj(prop, obj){
	if (typeof obj[prop] !== 'undefined'){
		return true;
	}
	return false;
}
//var a = {'qwe': 0, asd: 2}
//alert('prop in obj: ' + prop_in_obj('qwe',a));

