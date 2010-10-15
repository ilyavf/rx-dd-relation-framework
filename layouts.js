
var Layouts = function(params){

	var params = params || {};
	
	// actual size of a cell in px:
	this.cell_size 	= params.cell_size || 4;
	this.cell_margin = params.cell_margin || 1;
	this.grid_max	= params.grid_max || 16;
	
	this.prefix = 'grid_' + this.cell_size + '__';
	
	this.style_init();
}
Layouts.prototype.style_init = function(){

	var cell_size 	= this.cell_size;
	var cell_margin = this.cell_margin;
	var grid_max 	= this.grid_max;
	
	var styles = '';
	
	// margin correction:
	var m_corr = 2 * cell_margin;
	
	for (var i = 1; i <= grid_max; i++){
		
		// square:
		styles += '.' + this.prefix + i + '{ height: ' + (i*cell_size - m_corr) + 'px; width: ' + (i*cell_size - m_corr) + 'px; }\n';
		
		// rectangle:
		for (var j = 1; j <= grid_max; j++){
			styles += '.' + this.prefix + i + '_' + j + '{ height: ' + i*cell_size + 'px; width: ' + j*cell_size + 'px; }\n';
		}
	}
	
	styles += '.grid_container{position: relative;}';
	styles += '.' + this.prefix + 'cell{ display: inline; float: left; position: relative; margin: ' + cell_margin + 'px; background: #cdc;}';
	
	//alert(styles);
	jQ('body').prepend('<style>' + styles + '</style>');
	
};
Layouts.prototype.generate_grid = function(layout){
	var layout_info = this.layouts[layout] || layout;
	
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
				grid += '<div class="' + this.prefix + 'cell ' + this.prefix + size*layout_info.size + offset_class + '"></div>\n';
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
	
	grid = '<div class="grid_container ' + this.prefix + height + '_' + width + '">\n' + grid + '</div>';
	//alert(grid);
	
	return grid;
}
Layouts.prototype.layouts = [
	{	size: 6,
		cells:[
			[1,1],
			[1,1]]},
	{	size: 4,
		cells:[
			[2,0,1],
			[0,0,1],
			[1,1,1]]},
	{	size: 4,
		cells:[
			[1,1,1],
			[1,1,1],
			[1,1,1]]},
	{	size: 4,
		cells:[
			[1,1,1,1],
			[2,0,2,0],
			[0,0,0,0]]},
	{	size: 3,
		cells:[
			[2,0,2,0],
			[0,0,0,0],
			[2,0,1,1],
			[0,0,1,1]]},
	{	size: 3,
		cells:[
			[1,1,1,1],
			[2,0,2,0],
			[0,0,0,0],
			[1,1,1,1]]}
];
