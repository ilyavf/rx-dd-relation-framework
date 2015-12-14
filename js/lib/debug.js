
// ilya:
var debug_count = 0;
var buffered_debug = '';
debug = function(txt, open){
	_debug('debug_history', txt, open);
}
debug2 = function(txt){
	_debug('debug_history2', txt);
}
debug3 = function(txt){
	_debug('debug_history3', txt);
}
var block_step = '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;';
var block_num = 0;
function block(){
	var block_str = '';
	var i = block_num;
	while(i--){
		block_str += block_step;
	}
	return block_str;
}
_debug = function(id,txt,open){
	if (jQ('#history_flag:checked').val() != '1'){
		return 0;
	}
	var tag = open || 'none';
	var start_tag = block();
	var end_tag = '';
	var num_style = '';
	
	if (tag == 'open'){
		num_style = ' style="color:red"';
		end_tag = ' <span style="color:red;">{</span>';
		block_num++;
	}
	if (tag == 'close'){
		txt += ' (close)';
		block_num--;
		end_tag = '<br />'+block()+'<span style="color:red;">}</span>';
	}
	if (tag == 'clear'){
		jQ('#'+id).html('');
	}
	
	debug_count++;
	
	//var debug_txt = jQ('#'+id).html();
	//jQ('#'+id).html( ... );
	
	buffered_debug += "\n<br />\n" + 
		start_tag + '<span '+num_style+'>' + debug_count + '</span>' + ': ' + txt + end_tag;
}

var show_buffered_debug = function(){
	jQ('#debug_history').html('');
	jQ('#debug_history').html(buffered_debug);
	buffered_debug = '';
}

// html:
var debug_init = function(){
	var debug_html = 
	'<div style="position:absolute; right:0; top:0; padding-top: 5px;">' +
		'<input type="checkbox" id="history_flag" value="1" /> Turn on debug.' +
		'<button onClick="javascript: show_buffered_debug();">Show debug</button>' +
		'<button onClick="javascript: buffered_debug=\'\';">Clear buffer</button>' +
		'<div id="debug_history" style="width:450px; height:330px; border: 1px solid gray; padding: 5px;">debug_history</div>' +
		'<div id="debug_history2" style="width:450px; height:200px; border: 1px solid gray; padding: 5px; overflow-y:scroll;"></div>' +
	'</div>';
		
	jQ('body').append(debug_html);
	//jQ('body').append('<button onClick="javascript: show_buffered_debug();">Show debug</button>');
	//jQ('body').append('<div id="debug_history">debug_history</div>');
}

var debug_now_num = 0;
var debug_now = function(debug_str){
	debug_now_num++;
	var old = jQ("#debug_history2").html();
	jQ("#debug_history2").html( debug_now_num + ': ' + debug_str + '<br />\n' + old);
}

function dump() {}


