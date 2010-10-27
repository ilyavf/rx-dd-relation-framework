Object.prototype.toString = function(){
	var str = 'Object { ';
	var delim = '';
	for (x in this){
		str += delim + x + ': ' + this[x];
		delim = ', ';
	}
	return str + ' }';
}

var clone_elements = [];
var ConvertLayout = function(id){
	var drag_elements = [];
	var relations = [];

	debug('[ConvertLayout]: id = ' + id, 'open');
	var container_childs = jQ('#' + id + ' .grid_container div').each(
		function(){
			debug('ConvertLayout: ' + this.id );
			
			create_dynamic(this.id);
			
			
			//if (drag_elements.length > 1) return 0;
			
			var e1 = new ElementObj(this.id);
			e1.applyBehavior( BehaviorResize() );
			e1.applyBehavior( BehaviorDrag() );
			e1.activateBehaviors();
			
			drag_elements.push(e1);
		}
	);
	
	// add stopping wrapper:
	var grid_clone_id = clone_div_jq( jQ('#' + id + ' .grid_container'), id + '_grid_container' );
	convert_position(grid_clone_id); //, id + '_grid_container'
	
	var e_wr = new ElementObj(grid_clone_id);
	//e_wr.applyBehavior( BehaviorResize() );
	//e_wr.activateBehaviors();

	for( var i = 0; i < drag_elements.length; i++){
	
		// create relations between current i and all other elements:
		for (var j = (i+1); j < drag_elements.length; j++){
			var R1 = new Relation('R'+i+j, drag_elements[i], drag_elements[j], RelationFuncStop); // RelationFuncMove
			debug('- R'+i+j + ': ' + drag_elements[i].id + ', ' + drag_elements[j].id);
			relations.push(R1);
		}
			
		// create StopInside relation for the current i element:
		var R_w = new Relation('R_w'+i, e_wr, drag_elements[i], RelationFuncStopInside);
		relations.push(R_w);
		debug('- R_w'+i + ': ' + e_wr.id + ', ' + drag_elements[i].id);
	}
	
	jQ("[id$='_clone_tmp']").remove();
	
	debug('', 'close');
	
	return {elements: drag_elements, relations: relations}
}

var create_dynamic = function(id){
	
	// the present div is not absolutely positioned,
	// thus not to break current layout we create a clone of it:
	clone_div(id, '_clone_tmp');
	
	convert_position(id);

}

var convert_position = function(id, source_id){
	var source_id = source_id || id;

	debug('[convert_position]: id = ' + id, 'open' );
	
	debug('- getting offset:');
	var offset = get_offset(source_id);
	
	debug('- setting offset to: ' + offset);
	set_offset(id, offset);
	set_style(id, 'position', 'absolute');
	set_style(id, 'float', 'none');
	set_style(id, 'margin', '0');
	set_style(id, 'padding', '0');
	set_style(id, 'border', '1px green solid');
	
	debug('', 'close');
}

var clone_div = function(id, suffix){
	var suffix = suffix || '_clone';

	debug('[clone_div]: className = ' + document.getElementById(id).className );
	var div_coor = get_div_coor(id);
	var clone_html = '<div id="'+id+suffix+'" style="' +
			'width: ' + div_coor.width + 'px;' +
			'height: ' + div_coor.height + 'px;" ' +
		'class="' + document.getElementById(id).className + ' clone" ' +
		'z-index=0' +
	'"></div>';
	
	jQ('#' + id).after(clone_html);
}

var clone_div_jq = function(div_jq, id, suffix){
	var suffix = suffix || '_clone';

	var clone_div = '<div id="'+id+suffix+'" style="' +
			'width: ' + div_jq.width() + 'px;' +
			'height: ' + div_jq.height() + 'px;" ' +
	'"></div>';
	
	div_jq.before(clone_div);
	
	return id+suffix;
}



