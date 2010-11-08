/**
 * Accepts id of a regular div and optional params,
 * - creates similar dynamic div (dragable, clickable)
 * - associates div with cam
 */
var CamDynamic = function(div_id, div_params, cam_params){
	debug('[CamDynamic]: div_id=' + div_id + ', div_params=' + div_params + ', cam_params=' + cam_params);
	this.div_id = div_id;
	this.id = div_id + '_dcam'
	this.dyn_el;
	
	// initial position:
	this.init_coor;
	
	/* For the current position call: this.dyn_el.coor(). */
	
	var div_params = div_params || {}
	this.width = div_params.width || 50;
	this.height = div_params.height || 40;
	this.border = {
		px: div_params.border || 1,
		color: div_params.border_color || 'green' ,
		style: div_params.style || 'solid'
	}
	
	this.init();
	
}
CamDynamic.prototype.init = function(){
	
	create_dynamic(this.div_id);
		
	var e1 = new ElementObj(this.div_id, {pipeline_out: 1, zindex: 50} );
	e1.applyBehavior( BehaviorDrag() );
	e1.activateBehaviors();

	this.dyn_el = e1;
	this.init_coor = this.dyn_el.coor();
	
	e1.addMDropFunc( this.goto_init_coor_func() );
}

CamDynamic.prototype.goto_init_coor_func = function(){
	var init_coor = this.init_coor;
	
	//debug_now('[goto_init_coor]: 1: ' + this.id + ', init_coor=' + init_coor);
	
	return function(){
		debug_now('[goto_init_coor]: ' + this.id);
		this.left(init_coor.left);
		this.top(init_coor.top);
	}
}



