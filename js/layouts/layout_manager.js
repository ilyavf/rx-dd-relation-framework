/**
 * ToDo: 
 *	- 2010.11.08: switch onclick activating layouts to flapjax and get rid of global_layouts_tmp.
 */

// to store links for current layouts to be destroyed later:
var global_layouts_tmp = { elements: [] };

var Layout_manager = function(params){
	var layouts = params.layouts || [];
	var container_active_id = params.container_id || null;
	this.ratio = params.ratio || false;
	this.ratio_thumb = params.ratio_thumb || false;
	this.cell_size  = params.cell_size || 30;
	this.cell_size_thumb  = params.cell_size_thumb || 5;

	debug_now('[layout_manager]: ' + layouts.length + ', ratio=' + params.ratio);
	
	this.container_active_id = container_active_id;
	
	// store layout info:
	this.layouts_info = [];
	
	//this.init();
	
	this.layout_init_big	= new Layouts({cell_size: this.cell_size, ratio: this.ratio});
	this.layout_init_small	= new Layouts({cell_size: this.cell_size_thumb,  ratio: this.ratio_thumb});
	
	// Create layouts:
	this.create_layouts(layouts);

}
Layout_manager.prototype.init = function(){

}
Layout_manager.prototype.clickable = function(layout, click_handler){

	var globals = {
		layout_init_big:		this.layout_init_big,
		container_active_id: 	this.container_active_id,
		ratio: 					this.ratio
	}
	
	jQ("#"+layout.id).click( 
		function(){ click_handler(layout, globals); }
	);

}
Layout_manager.prototype.activate_layout = function(layout, globals){
	debug_now('You clicked on: ' + layout.id + ', ' + layout.type_num);
	debug_now('- current layouts_tmp: ' + global_layouts_tmp.elements.length);
	
	jQ("#"+globals.container_active_id).html( globals.layout_init_big.generate_grid( layout.type_num ) );
	
	// returns elements and relations to be destroyed with next try:
	debug_now('r=' + globals.ratio);
	var tmp = ConvertLayout(globals.container_active_id, globals.ratio);
	
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
Layout_manager.prototype.create_layouts = function(layouts){
	
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
