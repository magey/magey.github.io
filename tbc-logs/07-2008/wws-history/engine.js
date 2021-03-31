//-------------- AJAX request

function makeRequest(url, addInfo) {
	var http_request = false;
    if (window.XMLHttpRequest) { // Mozilla, Safari, ...
    	http_request = new XMLHttpRequest();
        if (http_request.overrideMimeType) {
            http_request.overrideMimeType('text/xml');
        }
    } else if (window.ActiveXObject) { // IE
        try {
            http_request = new ActiveXObject("Msxml2.XMLHTTP");
        } catch (e) {
            try {
                http_request = new ActiveXObject("Microsoft.XMLHTTP");
            } catch (e) {}
        }
    }
    if (!http_request) {
        alert('Giving up :( Cannot create an XMLHTTP instance');
        return false;
    }
    if (url.indexOf('.xml')!=-1)
	    http_request.onreadystatechange = function() { alertXml(http_request, addInfo); };
	else
	    http_request.onreadystatechange = function() { alertHtml(http_request, addInfo); };
    http_request.open('GET', url, true);
	http_request.setRequestHeader('Cache-Control','no-cache'); 
    http_request.send(null);
}

//------------ on XML reading, populate the javascript model

function alertHtml(http_request, addInfo) {
    if (http_request.readyState == 4) {
		document.getElementById(addInfo).innerHTML = http_request.responseText;
    }	
}

function alertXml(http_request) {
    if (http_request.readyState == 4) {
		text = http_request.responseText;
		var xml;
		var userAgent = navigator.userAgent;
		if (userAgent)
		
		if (window.XMLHttpRequest && !(userAgent.indexOf("MSIE")!=-1)){ // Mozilla, Safari, Opera
		   var parser = new DOMParser(); 
		   xml = parser.parseFromString(text, "text/xml"); 
		} else if (window.ActiveXObject){ 
		   xml = new ActiveXObject("Microsoft.XMLDOM") 
		   xml.async="false"; 
		   xml.loadXML(text);   
		} 
		
        readModel(xml);
		initPage();
    }
}

function init() {
	makeRequest('data.xml');
	makeRequest('custom-top.html', 'custom-top');
	makeRequest('custom-bottom.html', 'custom-bottom');
}

//------------ display page

var _currentPage = "raids"; // Main, Actor, 
var _currentActor = "";

function initPage() {
	var text = new StringBuffer();
	text.append(getTabs());
	
	if (_currentPage=="raids")
		text.append(raidsPage());
	if (_currentPage=="players") 
		text.append(playersPage());
	if (_currentPage=="player") 
		text.append(playerPage());

    document.getElementById("result").innerHTML = text.toString();	
    tipHide();
}

function goPage (page, playerName) {
	if (page=="player") {
		_tables.player.rows = _actors[playerName].raids;
	}
	_currentPage = page;
	_currentActor = playerName;
	window.scroll(0,0);
	initPage();
	return false;
}

function getTabs() {
	var buf = new StringBuffer();
	buf.append("<br><table class='tabs' width='100%'><tr><td class='fill' width='20px'>&nbsp;</td>")
	if (_currentPage=="raids")
		buf.append("<td class='tabon'>")
	else
		buf.append("<td class='taboff'>")
	buf.append("<a href='.' onclick=\"javascript:return goPage('raids')\">"+lang.misc.raidhistory+"</a>  ");
	buf.append("</td>")
	if (_currentPage=="players")
		buf.append("<td class='tabon'>")
	else
		buf.append("<td class='taboff'>")
	buf.append("<a href='.' onclick=\"javascript:return goPage('players')\">"+lang.misc.playersknown+"</a>");
	buf.append("</td>")
	if (_currentPage=="player") {
		buf.append("<td class='tabon'>")
		buf.append("<a href='.' onclick=\"javascript:return false\">"+ lang.misc.playerhistory + " : " + _currentActor +"</a>");
		buf.append("</td>")
	}
	buf.append("<td class='fill' width='80%'>&nbsp;</td></tr></table><br><br>")
	return buf.toString();
}

function playerPage() {
	var buf = new StringBuffer();
	buf.append(buildTable(_tables.player));
	return buf.toString();
}

function raidsPage() {
	var buf = new StringBuffer();
	buf.append(buildTable(_tables.raids));
	return buf.toString();
}

var _colorBlind = false;
function colorBlind() {
	_colorBlind = !_colorBlind;
	_tables.players.cols.classe.show=_colorBlind;
	initPage();
}
function showClass(c) {
	var classe = _classes[c];
	classe.show = !classe.show;
	initPage();
}
function filterClass(row) {
//	alert(row + "" + _classes[row.classe].show);
	return _classes[row.classe].show
}

function playersPage() {
	var buf = new StringBuffer();

	for (c in _classes) {
		var classe = _classes[c];
		buf.append("<input type='checkbox' onclick='javascript:showClass(\""+c+"\")' "+(classe.show?"CHECKED":"")+" />");
		buf.append(" <acronym " +
				"onclick='javascript:showClass(\""+c+"\")' " +
				"onmouseover=\"javascript:tipShow(event, '', 'Click to display class names.')\" " +
				"onmousemove='javascript:tipMove(event)' onmouseout='javascript:tipHide()' " +
				"><span class='c-"+c+"'>"+classe.name+"</span></acronym> &nbsp; ");
	}
	buf.append("<br><br>");

	buf.append("<input type='checkbox' onclick='javascript:colorBlind()' "+(_colorBlind?"CHECKED":"")+" />");
	buf.append(" <acronym " +
				"onclick='javascript:colorBlind()' " +
				"onmouseover=\"javascript:tipShow(event, '', 'Click to display class names.')\" " +
				"onmousemove='javascript:tipMove(event)' onmouseout='javascript:tipHide()' " +
				"><span class='var-txt'>Display class names</span></acronym><br><br>");
	
	buf.append(buildTable(_tables.players, filterClass));
	return buf.toString();
}

//----------- model setter

var _raids = new Vector();
var _actors = new Object();

var _tables = {
	player : {
		name:"player",
		sortCol:"dir",
		sortOrder:"up",
		rows:new Vector(),
		cols:{
			dir:     {show:true, css:"nb",  format:function(row){
				return ("<a " +
						"onmouseover=\"javascript:tipShow(event, '', '"+lang.misc.clicktoreport+"')\" " +
						"onmousemove='javascript:tipMove(event)' onmouseout='javascript:tipHide()' " +
						"class='c-pri' href='../"+row.dir+"/index.html'>"+row.dir+"</a>");
			}},
			comment:{show:true, css:"n",  format:"N"},
			pres:   {show:true, css:"w", format:"%"},
			dmgout: {show:true, css:"o",  format:"D0%"},
			dps:    {show:true, css:"o", format:"N"},
			dpstime:{show:true, css:"o", format:"D0%"},
			dmgin:  {show:true, css:"i",  format:"D0%"},
			death:  {show:true, css:"i", format:"N"},
			heal:   {show:true, css:"h",  format:"D0%"},
			ovh: 	{show:true, css:"h", format:"D0%"},
			decurse:{show:true, css:"h", format:"N"}
		}
	},
	raids : {
		name:"raids",
		sortCol:"start",
		sortOrder:"up",
		rows:new Vector(),
		cols:{
			dir:     {show:true, css:"nb",  format:function(row){
				return ("<a " +
						"onmouseover=\"javascript:tipShow(event, '', '"+lang.misc.clicktoreport+"')\" " +
						"onmousemove='javascript:tipMove(event)' onmouseout='javascript:tipHide()' " +
						"class='c-pri' href='../"+row.dir+"/index.html'>"+row.dir+"</a>");
			}},
			comment: {show:true, css:"n",  format:"N"},
			start:   {show:true, css:"n",  format:"DH"},
			dps:     {show:true, css:"o", format:"D0"},
			dpstime: {show:true, css:"o", format:"D0%"},
			lg:      {show:true, css:"w",  format:"d"},
			sumpres: {show:true, css:"w",  format:"D0"}
		}
	},
	players : {
		name:"players",
		sortCol:"raidCount",
		sortOrder:"up",
		rows:new Vector(),
		cols:{
			name:       {show:true, css:"n",  format:function(row) {
				return ("<acronym " +
						"onclick=\"javascript:goPage('player', '"+row.name+"')\" "+
						"onmouseover=\"javascript:tipShow(event, '', '"+lang.misc.clicktohistorypage+"')\" " +
						"onmousemove='javascript:tipMove(event)' onmouseout='javascript:tipHide()' " +
						"><span class='c-"+row.classe+"'>"+row.name+"</span></acronym>");
			}},
			classe:     {show:false, css:"n",  format:function(row) {
				return (_classes[row.classe].name);
			}},
			raidCount:  {show:true, css:"w",  format:"N"},
			avgdmgout:  {show:true, css:"o",  format:"D0%"},
			dps:        {show:true, css:"o",  format:"D0"},
			avgdpstime: {show:true, css:"o",  format:"D0%"},
			avgdmgin:   {show:true, css:"i",  format:"D0%"},
			sumdeath:   {show:true, css:"i",  format:"N"},
			deathAvg:   {show:true, css:"i",  format:"D1"},
			avgheal:    {show:true, css:"h",  format:"D0%"},
			avgovh:     {show:true, css:"h",  format:"D0%"},
			avgdecurse: {show:true, css:"h",  format:"D0"}
		}
	}
}

var _classes = {
	rog:{show:true,name:"Rogue",actors:new Vector()}, 
	mag:{show:true,name:"Mage",actors:new Vector()},
	wrl:{show:true,name:"Warlock",actors:new Vector()},
	hnt:{show:true,name:"Hunter",actors:new Vector()},
	war:{show:true,name:"Warrior",actors:new Vector()},
	pri:{show:true,name:"Priest",actors:new Vector()},
	drd:{show:true,name:"Druid",actors:new Vector()},
	pal:{show:true,name:"Paladin",actors:new Vector()},
	sha:{show:true,name:"Shaman",actors:new Vector()}};


function readModel (xml) {
	raidNodes = xml.getElementsByTagName("raid");
	for (var i = 0; i < raidNodes.length; i++) {
		raidNode = raidNodes[i];
		var raid = new Object();
		for (var j=0; j<raidNode.attributes.length; j++) {
			raid[raidNode.attributes[j].nodeName] = raidNode.attributes[j].nodeValue;
		}
		var sumpres = 0;
		actorNodes = raidNode.getElementsByTagName("player");
		for (var j = 0; j < actorNodes.length; j++) {
			actorNode = actorNodes[j];
			temp = new Object();
			for (var k=0; k<actorNode.attributes.length; k++) {
				temp[actorNode.attributes[k].nodeName] = actorNode.attributes[k].nodeValue;
			}
			if (_actors[temp.name]==null) {
				_actors[temp.name] = new Object();
				actor = _actors[temp.name];
				actor.name = temp.name;
				actor.classe = temp.classe;
				actor.raidCount = 0;
				actor.dpsCount = 0;
				actor.sumdpstime = 0;
				actor.sumdmgout = 0;
				actor.sumdmgin = 0;
				actor.sumheal = 0;
				actor.sumdeath = 0;
				actor.sumovh = 0;
				actor.raids = new Vector();
				actor.counters = {};
				actor.counters.decurse = new Counter();
			}
			sumpres += Number(temp.pres);
			actor = _actors[temp.name];
			actor.raidCount ++;
			actor.dpsCount += Number(temp.dps);
			actor.sumovh += Number(temp.ovh);
			actor.sumdpstime += Number(temp.dpstime);
			actor.sumdeath += Number(temp.death);
			actor.sumdmgout += Number(temp.dmgout);
			actor.sumdmgin += Number(temp.dmgin);
			actor.sumheal += Number(temp.heal);
			actor.counters.decurse.add(temp.decurse);
			
			// add this raid info
			aRaid = new Object();
			actor.raids.add(aRaid);
			for(var bli in temp) {
				if (Number(temp[bli])!=NaN)
					aRaid[bli] = Number(temp[bli]);
				else
					aRaid[bli] = temp[bli];
			}
			aRaid.dir = raid.dir;
			aRaid.comment = raid.comment;
		}
		_tables.raids.rows.add(raid);
		raid.sumpres = sumpres/100;
	}
	// finalize raids, convert some variables to numbers
	for (var i=0; i<_tables.raids.rows.size; i++) {
		var raid = _tables.raids.rows.get(i);
		raid.lg = Number(raid.lg);
		raid.start = Number(raid.start);
		raid.dps = Number(raid.dps);
	}	
	// finalize actors and convert _actors map to an array for sorts
	for (var actorName in _actors) {
		actor = _actors[actorName];
		actor.avgdmgin = actor.sumdmgin/actor.raidCount;
		actor.avgdmgout = actor.sumdmgout/actor.raidCount;
		actor.avgheal = actor.sumheal/actor.raidCount;
		actor.avgovh = actor.sumovh/actor.raidCount;
		actor.avgdecurse = actor.counters.decurse.getAvg();
		actor.dps = actor.dpsCount/actor.raidCount;
		actor.avgdpstime = actor.sumdpstime/actor.raidCount;
		actor.deathAvg = actor.sumdeath/actor.raidCount;
		_tables.players.rows.add(actor);
	}	
	// populate columns with localized strings
	for (var tableName in _tables) {
		var table = _tables[tableName];
		for (colName in table.cols) {
			var col = table.cols[colName];
			if (!lang.cols[tableName][colName])
				alert("could not find text for " + tableName + ", " + colName)
			col.title = lang.cols[tableName][colName].title;
			col.tooltip = lang.cols[tableName][colName].tooltip;
		}
	}
}

function Counter(property) {
	this.property = property;
	this.sum = 0;
	this.count = 0;
	this.add = function (val) {
		if (val) {
			this.count++;
			this.sum += Number(val);
		}
	}
	this.getAvg = function () {
		if (this.count==0)
			return 0;
		else
			return this.sum/this.count;
	}
}
