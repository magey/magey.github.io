
// debug functions

function dump(obj) {
	var res="";
	for(var prop in obj) {
		res+=prop+":"+obj[prop]+"\n";		
	}
	return res;
}

function debug(text) {
	document.getElementById("debug").innerText += text+"\n";
}

function clearDebug() {
	document.getElementById("debug").innerText = "";
}

// custom formating

function formatTime(timeInteger, part) {
  function zeropad( n ){ return n>9 ? n : '0'+n; }
  var t = new Date( timeInteger );
  var Y = t.getUTCFullYear();
  var M = t.getUTCMonth(); // month-1
  var D = t.getUTCDate();
  var d = t.getUTCDay(); // 0..6 == sun..sat
  var day = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][d];
  var mon = ['Jan','Feb','Mar','Apr','May','Jun',
             'Jul','Aug','Sep','Oct','Nov','Dec'][M];
  var h = t.getUTCHours();
  var m = t.getUTCMinutes();
  if (part=="hour")
	  return zeropad(h)+':'+zeropad(m)
  else
	  return day +' '+ D +' '+ mon + ', '+ zeropad(h)+':'+zeropad(m)
}

function format (val, f) {
	if (f=="N")
		return val;
	if (f=="DH") { // date & hour
		return formatTime(val);
	}
	if (f=="d") { // duration in ms
		return formatTime(val, "hour");
	}
	if (f=="%")
		return val+"&nbsp;%";
	if (f=="M") {
		val = String(val);
		var res="";
		var pos=1;
		for(var i=val.length-1; i>=0; i--) {
			res=val.charAt(i)+res;
			if (pos%3==0)
				res=" "+res;
			pos++;
		}
		return res;
	}
	if (f.charAt(0)=="D") {
		val=Number(val);
		var nb = f.charAt(1);
		if (f.charAt(2)=='%')
			return val.toFixed(nb)+" %";
		else
			return val.toFixed(nb);
	}
	return "?"+val+"?";
}

// a Stringbuffer implementation

function StringBuffer() { 
	this.buffer = []; 
	this.append = function (string) { 
		this.buffer.push(string); 
		return this; 
	}; 
	this.toString = function () { 
		return this.buffer.join(""); 
	}; 
} 

// a vector implementation

function Vector() {
	this.data = new Array(10);
	this.size = 0;
	
	this.sort = function (sortfn) {
		this.data.sort(sortfn);
	}
	this.get = function (i) {
		return this.data[i];
	}
	this.add = function (obj) {
		if(this.size == this.data.length)
			this.resize();
		this.data[this.size++] = obj;
	};
	this.resize = function () {
		newData = new Array(this.data.length*2);
		for	(var i=0; i< this.data.length; i++) {
			newData[i] = this.data[i];
		}
		this.data = newData;
	}
}

// a merge sort

function myMergeSort(aMain, min, max, aBack, dec) { // marche pô... :(
	if (min >= max) 
		return; 

	var mid = Math.floor((min + max) / 2);
	myMergeSort(aMain, min, mid, aBack, " - " + dec); // sort 1st sublist
	myMergeSort(aMain, (mid + 1), max, aBack, " - " + dec); // sort 2nd sublist

	// merge sorted sublists
	var bmin = min;
	var bmax = mid + 1;
	for (var i = min; i <= max; i++)
		if ((bmin <= mid) && ((bmax > max) || sortfn(aMain[bmin], aMain[bmax])<0)) {
			aBack[i] = aMain[bmin++];
		} else {
			aBack[i] = aMain[bmax++];
		}

	// copy back to main
	for (var i = min; i <= max; i++) {
		aMain[i] = aBack[i]; 
	}
}

function sortVector (vector) {
	var back = new Array(vector.size);
	myMergeSort(vector.data, 0, vector.size-1, back);
}

var _sortCol = ""; 
var _sortOrder = ""; 
function sortfn (a, b) {
	a = a[_sortCol];
	b = b[_sortCol];
	if (_sortOrder=="up") {
		var c=b; b=a; a=c;
	}
	if (a<b) return -1;
	if (a>b) return +1;
	return 0;
}

// table engine

function evSort(tableName, sortCol) {
	var table = _tables[tableName];
	if (table.sortCol==sortCol) { // change sort order
		table.sortOrder = (table.sortOrder=="up")?"down":"up";
	} else {
		table.sortOrder="up";
	}
	table.sortCol = sortCol;
	initPage();
}

function buildTable (table, filter) {
	var text = new StringBuffer();
	text.append("<table>")
	// header
	text.append("<tr><th>");
	for (var colName in table.cols) {
		var col = table.cols[colName];
		if (!col.show)
			continue;
		text.append("<th>");
		text.append("<acronym " +
				"onmouseover=\"javascript:tipShow(event, '"+col.tooltip+"', '"+lang.misc.clicktosort+"')\" " +
				"onmousemove='javascript:tipMove(event)' onmouseout='javascript:tipHide()' " +
				"onclick='javascript:evSort(\""+table.name+"\", \""+colName+"\")' " +
				"><span class='var-"+col.css+"'>"+col.title);
				
		if (table.sortCol==colName)		
			if (table.sortOrder=="down")
				text.append("&nbsp;&nbsp;&darr; ")
			else
				text.append("&nbsp;&nbsp;&uarr; ")
				
		text.append("</span>");
	}
	text.append("</tr>");
	// sorting
	_sortCol = table.sortCol;
	_sortOrder = table.sortOrder;
	table.rows.sort(sortfn);
	
//	sortVector(table.rows);
	// body
	var index = 1;
	for(i=0; i<table.rows.size; i++) {
		var row = table.rows.get(i);
		if (filter!=null)
			if(filter(row)==false)
				continue;
		if (index%2==0)
			text.append("<tr>");
		else	
			text.append("<tr class='odd'>");
		text.append("<td>"+index);
		index++;
		for (var colName in table.cols) {
			var col = table.cols[colName];
			if (!col.show)
				continue;
			if (typeof(col.format)=="function") {
				text.append("<td class='"+col.css+"'>");
				text.append(col.format(row));
			} else {
				text.append("<td class='"+col.css+"'>");
				text.append(format(row[colName], col.format));
			}
		}
		text.append("</tr>\n")
	}
	text.append("</table>\n")
	return text;
}


