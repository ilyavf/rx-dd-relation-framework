Object.prototype.toString = function(){
	var str = 'Object { ';
	var delim = '';
	for (x in this){
		str += delim + x + ': ' + this[x];
		delim = ', ';
	}
	return str + ' }';
}

var drag_elements = [];
var clone_elements = [];
var ConvertLayout = function(id){
	debug('[ConvertLayout]: id = ' + id, 'open');
	var container_childs = jQ('#' + id + ' .grid_container div').each(
		function(){
			debug('ConvertLayout: ' + this.id );
			
			convert_position(this.id, id);
			
			
			//if (drag_elements.length > 1) return 0;
			
			var e1 = new ElementObj(this.id);
			e1.applyBehavior( BehaviorResize() );
			e1.applyBehavior( BehaviorDrag() );
			e1.activateBehaviors();
			
			drag_elements.push(e1);
		}
	);

	for( var i = 0; i < drag_elements.length; i++){
		for (var j = (i+1); j < drag_elements.length; j++){
			var R1 = new Relation('R'+i+j, drag_elements[i], drag_elements[j], RelationFuncStop);
			debug('- R'+i+j + ': ' + drag_elements[i].id + ', ' + drag_elements[j].id);
		}
	}
	
	jQ("[id$='_clone']").remove();
	
	debug('', 'close');
}


var convert_position = function(id, parent_id){
	debug('[convert_position]: id = ' + id + ', parent = ' + parent_id, 'open' );
	
	debug('- getting offset:');
	var offset = get_offset(id);
	
	clone_div(id, parent_id);
	
	debug('- setting offset to: ' + offset);
	set_offset(id, offset);
	set_style(id, 'position', 'absolute');
	set_style(id, 'float', 'none');
	set_style(id, 'margin', '0');
	set_style(id, 'padding', '0');
	set_style(id, 'border', '1px green solid');
	
	debug('', 'close');
}

var clone_div = function(id, parent_id){
	debug('[clone_div]: className = ' + document.getElementById(id).className );
	var div_coor = get_div_coor(id);
	var clone_div = '<div id="'+id+'_clone" style="' +
			'width: ' + div_coor.width + 'px;' +
			'height: ' + div_coor.width + 'px;" ' +
		'class="' + document.getElementById(id).className + ' clone" ' +
		'z-index=0' +
	'"></div>';
	
	jQ('#' + id).before(clone_div);
	
	clone_elements.push(id+'_clone');
}



