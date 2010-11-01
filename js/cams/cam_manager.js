/**
 *
 *
 */
var CamManager = function(params){
	this.cam_container = params.cam_container || null;
	this.cams = [];
	
	this.init();

}
CamManager.prototype.init = function(){
	var self = this;
	
	var container_childs = jQ('#' + this.cam_container + ' .cam').each(
		function(){
			debug('ConvertCams: ' + this.id );
			var cam = new CamDynamic(this.id);
			
			self.cams.push(cam);
		}
	);
	
}