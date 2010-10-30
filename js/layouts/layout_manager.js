var Layout_manager = function(params){
	var layouts = params.layouts || [];
	var container_active_id = params.container_id || null;

	debug('[layout_manager]: ' + layouts.length);
	
	this.container_active_id = container_active_id;
	
	// store layout info:
	this.layouts_info = [];
	
	//this.init();
	
	this.layout_init_big	= new Layouts({cell_size: 30});
	this.layout_init_small	= new Layouts({cell_size: 5});
	
	// Create layouts:
	this.create_layouts(layouts);

}
Layout_manager.prototype.init = function(){

}
Layout_manager.prototype.clickable = function(layout, click_handler){

	var globals = {
		layout_init_big:		this.layout_init_big,
		container_active_id: 	this.container_active_id
	}
	
	jQ("#"+layout.id).click( 
		function(){ click_handler(layout, globals); }
	);

}
Layout_manager.prototype.activate_layout = function(layout, globals){
	debug('You clicked on: ' + layout.id + ', ' + layout.type_num);
	
	jQ("#"+globals.container_active_id).html( globals.layout_init_big.generate_grid( layout.type_num ) );
	
	// returns elements and relations to be destroyed with next try:
	var tmp = ConvertLayout(globals.container_active_id);
	
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
