var Ed = new Array();
var Rd = new Array();

(function( $ ){

	$.fn.toDynamic = function() {
	
		return this.each(function() {
		
			var id = $(this).attr('id');
			debug_now( 'new ElementObj: id = ' +  id);
			
			Ed[id] = new ElementObj(id);
			
			
		});
	};

	$.fn.toDragable = function() {
	
		return this.each(function() {
		
			var id = $(this).attr('id');
			Ed[id].applyBehavior( BehaviorDrag() );
			
		});
	};
	
	$.fn.addRelationMove = function() {
	
		var ids = new Array();
		
		this.each(function() {
			
			var id = $(this).attr('id');
			if (!Ed[id])
				Ed[id] = new ElementObj(id);
			
			ids.push( id );
			
			if ( ids.length > 1){
				for (var i = 0; i < (ids.length - 1); i++){
					var rel_name = 'RMove_' + id + '_' + ids[i];
					Rd.push( new Relation( rel_name, Ed[id], Ed[ids[i]], RelationFuncMove) );
					debug_now('new Relation: ' + rel_name);
				}
			}
	
		});
		
		return this;
	};
	
	$.fn.addRelationStop = function(selector) {
		
		var stop_ids = new Array();
		$(selector).each(function(){
			var id = $(this).attr('id');
			stop_ids.push(id);
			if (!Ed[id])
				Ed[id] = new ElementObj(stop_id);
		});
		
		this.each(function() {
			
			var id = $(this).attr('id');
			
			for (var i = 0; i < (stop_ids.length - 1); i++){
				var rel_name = 'RStop_' + stop_ids[i] + '_' + id;
				Rd.push( new Relation( rel_name, Ed[id], Ed[stop_ids[i]], RelationFuncStop) );
				debug_now('new Relation: ' + rel_name);
			}
				
		
		});
		
		return this;
	
	};
	
	$.fn.activateBehaviours = function() {
	
		return this.each(function() {
		
			var id = $(this).attr('id');
			Ed[id].activateBehaviors();
			
		});
	};
	
})( jQuery );
