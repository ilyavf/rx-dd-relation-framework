var Layout_manager = function(layouts, container_active_id){
	debug('[layout_manager]: ' + layouts.length);
	
	this.container_active_id = container_active_id;
	
	// store layout info:
	this.layouts_info = [];
	
	// Create layouts:
	this.create_layouts(layouts);
	

}
Layout_manager.prototype.clickable = function(layout, click_handler){

	jQ("#"+layout.id).click( 
		function(){ click_handler(layout); }
	);

}
Layout_manager.prototype.activate_layout = function(layout){
	alert('You clicked on: ' + layout.id + ', ' + layout.type_num);
	//alert('You clicked on: ' + layout);
	
	return 0;
	
	var b = new Layouts({cell_size: 30});
	jQ(this.container_active_id).html( b.generate_grid(3) );
	
	ConvertLayout('video_container');
	
}
Layout_manager.prototype.create_layouts = function(layouts){

	var a = new Layouts({cell_size: 5});
	
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
