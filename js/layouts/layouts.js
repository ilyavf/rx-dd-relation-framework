/**
 * Create a layout with one of the existing pattern.
 * @method	generate_grid	: generates floating div structure inside a container div.
 * 		- Cells' width and height are set according to given params. 
 */

var Layout = function(params){

	var params = params || {};
	
	// actual size of a cell in px:
	this.cell_size 	= params.cell_size || 4;
	this.cell_margin = params.cell_margin || 1;
	this.grid_max	= params.grid_max || 30;
	this.ratio = params.ratio || 1;
	
	this.prefix = 'grid_' + this.cell_size + '__';
	
	this.style_init();
}

// Generates html style set for this layout grid and adds it to the DOM (right after <body>).
Layout.prototype.style_init = function(){

	var cell_size 	= this.cell_size;
	var cell_margin = this.cell_margin;
	var grid_max 	= this.grid_max;
	
	var styles = '';
	
	// margin correction:
	var m_corr = 2 * cell_margin;
	
	for (var i = 1; i <= grid_max; i++){
		
		var cell_h = i * parseInt(cell_size/this.ratio);
		
		// rectangle (container for cells):
		for (var j = 1; j <= grid_max; j++){
			styles += '.' + this.prefix + i + '_' + j + '{ height: ' + cell_h + 'px; width: ' + j*cell_size + 'px; }\n';
		}
		
		// square (cells):
		styles += '.' + this.prefix + i + '{ height: ' + (cell_h - m_corr) + 'px; width: ' + (i*cell_size - m_corr) + 'px; }\n';
	}
	
	styles += '.grid_container{}';	//position: relative;
	styles += '.' + this.prefix + 'cell{ float: left; border: white solid ' + cell_margin + 'px; background: #cdc;}';
	// removed "display: inline; position: relative; "
	
	//alert(styles);
	jQ('body').prepend('<style>' + styles + '</style>');
	
};

// Generates floating div structure inside a container div.
Layout.prototype.generate_grid = function(layout){
	var layout_info = this.layout_types[layout] || layout;
	
	var grid = '';
	var width = 0;
	var height = 0;
	
	var grid_id = 'grid-' + parseInt(10000 * Math.random());
	
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
				grid += '<div ' + 
					'id="' + grid_id + i + '_' + j + '" ' +
					'class="' + this.prefix + 'cell ' + this.prefix + size*layout_info.size + offset_class + '">' +
					'</div>\n';
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
	
	grid = '<div id="' + grid_id + '_grid_container" class="grid_container ' + this.prefix + height + '_' + width + '">\n' + grid + '</div>';
	//alert(grid);
	
	return grid;
}
Layout.prototype.layout_types = [
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
			[1,1,1,1]]},
	{	size: 3,
		cells:[
			[3,1,1,1],
			[1,1,1],
			[1,1,1],
			[1,1,1,1,1,1]]}
];

Layout.prototype.get_layout_maxnum = function(){
	return (this.layout_types.length - 1);
}
