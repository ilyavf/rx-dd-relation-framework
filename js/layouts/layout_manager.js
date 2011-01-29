/**
 * ToDo: 
 *	- 2010.11.08: switch onclick activating layouts to flapjax and get rid of global_layouts_tmp.
 */

// to store links for current layouts to be destroyed later:
var global_layouts_tmp = { elements: [] };

/**
 *
 * @param params {line_thumbs: {ids, ratio, cell_size}, layouts: [{container_id, ratio, cell_size}, ...]}
 */
var Layout_manager = function(params){
	this.line_thumbs 			= params.line_thumbs || {ids:[]};
	this.line_thumbs.ratio 		= this.line_thumbs.ratio || false;
	this.line_thumbs.cell_size  = this.line_thumbs.cell_size || 5;
	
	this.layouts = params.layouts || [];
	
	this.container_id_prefix = params.container_id_prefix || 'undefined';
	
	this.selector_name = params.selector || 'none';

	debug_now('[layout_manager]: line_thumbs: ' + this.line_thumbs + ', ratio=' + this.line_thumbs.ratio);
	
	// store layout info:
	this.layouts_info = [];
	
	this.init();
	

}
Layout_manager.prototype.init = function(){
	
	this.layout_init_small	= new Layout({
		cell_size: this.line_thumbs.cell_size,  
		ratio: this.line_thumbs.ratio
	});
	
	// Create small clickable thumbnail layouts:
	this.create_mini_layouts(this.line_thumbs.ids);
	
	// Initialize big layouts:
	for (var i in this.layouts){
		var l = this.layouts[i];
		l.obj = new Layout({cell_size: l.cell_size, ratio: l.ratio});
		if (typeof l.init_type != 'undefined'){
			this.activate_layout(l.init_type, this, i);
		}
	}

}
Layout_manager.prototype.clickable = function(layout, click_handler){
	var self = this;
	
	jQ("#"+layout.id).click( 
		function(){ click_handler(layout.type_num, self); }
	);

}
// pass LM object - to be used with clickable function.
Layout_manager.prototype.activate_layout = function(layout_type_num, LM, selector_val){
	
	var selector_val = selector_val || jQ("input[name="+LM.selector_name+"]:checked").val();
	var container_id = LM.container_id_prefix + selector_val;
	
	debug_now('You clicked on: ' + layout_type_num + ', container_id=' + container_id);
	debug_now('- current layouts_tmp: ' + global_layouts_tmp.elements.length);
	
	debug_now('- selector_val=' + selector_val);
	if (!LM.layouts[selector_val]){
		return 0;
	}
	var layout_init_big = LM.layouts[selector_val].obj;
	var ratio = LM.layouts[selector_val].ratio;
	
	// draw div cells acc to layout type:
	jQ("#"+container_id).html( layout_init_big.generate_grid( layout_type_num ) );
	
	// returns elements and relations to be destroyed with next try:
	debug_now('r=' + ratio);
	var tmp = ConvertLayout(container_id, ratio);
	
	//destroy old layout:
	if (global_layouts_tmp.elements && global_layouts_tmp.elements.length){
		debug_now('- old layouts: ' + global_layouts_tmp.elements.length);
	}
	if (global_layouts_tmp.elements){
		for (var i in global_layouts_tmp.elements){
			global_layouts_tmp.elements[i].pipeline_params = {};
			//debug_now('- destroy old id=' + global_layouts_tmp.elements[i].id);
		}
	}
	
	// save for future deconstruction:
	global_layouts_tmp = tmp;
	debug_now('Save layout links: ' + global_layouts_tmp.elements.length);
	
}

// Creates a line of small clickable thumbnail layouts:
Layout_manager.prototype.create_mini_layouts = function(layouts){
	
	var a = this.layout_init_small;
	
	var maxnum = a.get_layout_maxnum();
	var layout_type_num = 0;
	var layout_num = 0;
	
	for (var i in layouts){
		var id = layouts[i];
		
		jQ("#"+id).html( a.generate_grid(layout_type_num) );
		
		this.layouts_info.push({
			'id': id,
			'type_num': layout_type_num
		});
		
		// Make layouts clickable:
		this.clickable(this.layouts_info[layout_num], this.activate_layout);
		
		layout_type_num++;
		if (layout_type_num > maxnum){
			layout_type_num = 0;
		}
		layout_num++;
	}

}
