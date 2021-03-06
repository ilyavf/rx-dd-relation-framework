var clone_elements = [];
var ConvertLayout = function(id, ratio){
	var layout_container_id = id;
	var ratio = ratio || 1;
	
	var drag_elements = [];
	var relations = [];

	debug('[ConvertLayout]: id = ' + id + ', ratio=' + ratio, 'open');
	var container_childs = jQ('#' + id + ' .grid_container div').each(
		function(){
			debug('ConvertLayout: ' + this.id + ', layout_container_id=' + layout_container_id);
			
			create_dynamic(this.id, layout_container_id);
			
			
			//if (drag_elements.length > 1) return 0;
			
			var e1 = new ElementObj(this.id, {pipeline_in: 1, startpos_id: layout_container_id});
			e1.applyBehavior( BehaviorResize() );
			e1.applyBehavior( BehaviorDrag() );
			e1.activateBehaviors();
			e1.set_ratio(ratio); //, 'init_redraw'
			
			drag_elements.push(e1);
		}
	);
	
	// add stopping wrapper:
	//var grid_clone_id = clone_div_jq( jQ('#' + id + ' .grid_container'), id + '_grid_container' );
	var grid_clone_id = clone_div_jq( id, 'grid_container' );
	debug('grid_container', 'open');
	convert_position(grid_clone_id, null, layout_container_id); //, id + '_grid_container'
	debug('','close');
	
	var e_wr = new ElementObj(grid_clone_id);
	//e_wr.applyBehavior( BehaviorResize() );
	//e_wr.activateBehaviors();

	for( var i = 0; i < drag_elements.length; i++){
	
		// create relations between current i and all other elements:
		for (var j = (i+1); j < drag_elements.length; j++){
			var R1 = new Relation('R'+i+j, drag_elements[i], drag_elements[j], RelationFuncStop); // RelationFuncMove RelationFuncStop
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

var create_dynamic = function(id, startpos_id){
	debug_now('create_dynamic: id=' + id + ', startpos_id=' + startpos_id);
	
	// the present div is not absolutely positioned,
	// thus not to break current layout we create a clone of it:
	clone_div(id, '_clone_tmp');
	
	convert_position(id, null, startpos_id);

}

var convert_position = function(id, source_id, startpos_id){
	var source_id = source_id || id;
	var startpos_id = startpos_id || 'document';

	debug('[convert_position]: id = ' + id + ', startpos_id=' + startpos_id, 'open' );
	
	debug('- getting offset:');
	var offset = get_offset(source_id, startpos_id);
	
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

var clone_div_jq = function(parent_id, class_name, suffix){
	var div_jq = jQ('#' + parent_id + ' .' + class_name);
	var div_parent = jQ('#'+parent_id);
	
	//debug_now( div_jq );
	debug_now( 'div_jq.width=' + div_jq.width() );
	
	var suffix = suffix || '_clone2';
	var id = parent_id + '_' + class_name + suffix;

	var clone_div = '<div id="' + id + '" style="' +
			'width: ' + div_jq.width() + 'px;' +
			'height: ' + div_jq.height() + 'px;' +
	'"></div>';
	
	//div_jq.before(clone_div);
	jQ('#'+parent_id).prepend(clone_div);
	
	return id;
}



