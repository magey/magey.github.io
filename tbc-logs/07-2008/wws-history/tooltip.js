var ttip = null;

function tipHide () {
	if (ttip==null)
		return;
	ttip.style.visibility='hidden';	
}

function tipMove(event) {
	if (ttip==null)
		return;
	var x;
	var y;
	if ( document.captureEvents ) {
		x = event.pageX;
		y = event.pageY;
	} else if ( window.event.clientX ) {
		x = window.event.clientX+document.documentElement.scrollLeft;
		y = window.event.clientY+document.documentElement.scrollTop;
	}
	ttip.style.top=y+15;
	ttip.style.left=x+15;
}

function tipShow (event, text, text2) {
	if (ttip==null)
		ttip = document.getElementById("toolTip");
	var t = "<span class='ttnormal'>"+text+"<span>";
	if (text2) {
		if (text.length>0)
			t+="<br>";
		t+="<span class='ttsmall'>"+text2+"</span>";
	}
	ttip.innerHTML=t;
	tipMove(event);
	ttip.style.visibility='visible';
}

var tips = new Object();

function tipShowK (event, key) {
	if (ttip==null)
		ttip = document.getElementById("toolTip");
	ttip.innerHTML=tips[key];
	tipMove(event);
	ttip.style.visibility='visible';
}



