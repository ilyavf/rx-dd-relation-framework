var cell_size = 10;
var style_init = function(){
	var grid_max = 8;
	var styles = '';
	
	var corr_i = 0;
	
	for (var i = 1; i <= grid_max; i++){
	
		// margin correction:
		if (i > 1){
			corr_i += 2;
		}
		styles += '.grid_' + i + '{ height: ' + (i*cell_size+corr_i) + 'px; width: ' + (i*cell_size+corr_i) + 'px; }\n';
		for (var j = 1; j <= grid_max; j++){
			styles += '.grid_' + i + '_' + j + '{ height: ' + i*(cell_size+4) + 'px; width: ' + j*(cell_size+4) + 'px; }\n';
		}
	}
	
	styles += '.grid_container{position: relative;}';
	styles += '.grid_cell{ display: inline; float: left; position: relative; background: #cdc; margin: 1px;}';
	
	//alert(styles);
	$('body').prepend('<style>' + styles + '</style>');
}();

var Layouts = function(type){

	// actual size of a cell in px:
	var cell_size = 10;
	
	var layouts = [
		{	size: 3,
			cells:[
				[1,1],
				[1,1]]},
		{	size: 2,
			cells:[
				[1,1,1],
				[1,1,1],
				[1,1,1]]},
		{	size: 2,
			cells:[
				[2,0,1],
				[0,0,1],
				[1,1,1]]}
	];
	
	this.generate_grid = function(layout){
		var layout_info = layouts[layout] || layout;
		
		var grid = '';
		var width = 0;
		var height = 0;
		for (var i in layout_info.cells){
			var row = layout_info.cells[i];
			var width_current = 0;
			var offset = 0;
			
			for (var j in row){
				var size = row[j];
				if (size === 0){
					offset++;
				} else {
					var offset_class = '';
					if (offset > 0){
						offset_class = ' pre_' + offset;
					}
					// add a cell:
					grid += '<div class="grid_cell grid_' + size*layout_info.size + offset_class + '"></div>\n';
				}
				width_current += size*layout_info.size; 
			}
			
			// save max width:
			if (width < width_current){
				width = width_current;
			}
			height += layout_info.size;
			
			// close row:
			//grid += '<div class="clear"></div>\n';
		}
		
		grid = '<div class="grid_container grid_' + height + '_' + width + '">\n' + grid + '</div>';
		//alert(grid);
		
		return grid;
	}
}


