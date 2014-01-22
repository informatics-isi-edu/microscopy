Array.prototype.contains = function (elem) {
	for (i in this) {
		if (this[i] == elem) return true;
	}
	return false;
};

var rootTable = 'simulation';
var rootDisplayName = 'Simulations';
var rootEntityName = 'Simulation';
var rootColumn = 'name';
var rootDict = {};
var rootList = [];
var rootRefTable = 'MultiCell';
var rootRefColumn = 'simulation_id';
var expandStack = [];
var tablesMetadata = {};

var newSearchKeywords = null;

var GLOBUS_AUTHN = true;

var HOME;
var USER;
var ERMREST_HOME = '/ermrest/catalog/1/entity';
var ERMREST_SCHEMA_HOME = '/ermrest/catalog/1/schema/cansim/table/';
var WEBAUTHN_HOME = '/ermrest/authn/session';
var DOWNLOAD_HOME = '/cansim_files/';
var MAX_RETRIES = 10;
var AJAX_TIMEOUT = 300000;
var CIRM_START_INFO = '<p class="intro">Choose an entity from the left sidebar.</p>';
var CIRM_NO_ENTITIES_INFO = '<p class="intro">No entities are available.</p>';

var goauth_cookie = 'globusonline-goauth';
var token = null;

var URL_ESCAPE = new String("~!()'");

var searchList = [];

/*
var tables = {
		'simulation': {'id': '', 'name': ''},
		'MultiCell': {'id': '', 'simulation_id': '', 'metadata_id': 'metadata', 'cell_line_id': 'cell_line'},
		'metadata': {'id': '', 'data_source_id': 'data_source', 'bounding_box_id': 'bounding_box', 'current_time': ''},
		'data_source': {'id': '', 'filename': '', 'created': '', 'last_modified': '', 'description': '', 'UserInformation_id': 'UserInformation', 'reference_id': 'reference', 'ProgramInformation_id': 'ProgramInformation', 'notes': ''},
		'UserInformation': {'id': '', 'Name': '', 'Affiliation': '', 'Location': '', 'email': '', 'URL': '', 'Phone': ''},
		'reference': {'id': '', 'citation': '', 'URL': '', 'note': ''},
		'ProgramInformation': {'id': '', 'Name': '', 'Version': '', 'Compiled': '', 'Author': '', 'email': '', 'URL': ''},
		'bounding_box': {'id': '', 'lower_bounds': '', 'upper_bounds': ''},
		'cell_line': {'id': 'microenvironment_phenotype_pair', 'data_source': ''},
		'microenvironment_phenotype_pair': {'id': '', 'cell_line_id': '', 'microenvironment_vector_id': 'microenvironment_vector', 'phenotype_parameter_vector_id': 'phenotype_parameter_vector'},
		'microenvironment_vector': {'id': '', 'oxygen': ''},
		'phenotype_parameter_vector': {'id': '', 'duration_of_G1': '', 'duration_of_S': '', 'duration_of_G2': '', 'duration_of_M': '', 'fraction_failing_G1_checkpoint': '', 'cell_volume': '', 'cell_nuclear_volume': '', 'fluid_fraction': '', 'oxygen_uptake_rate_per_volume': '', 'Youngs_modulus': '', 'maximum_cell_deformation': ''}
};
*/

var referenceTables = {
		'cell_line': {'id': {'table': 'microenvironment_phenotype_pair', 'refColumn': 'cell_line_id'}}
};

var downloadTables = {
		'data_source': {'filename': ''}
};

var restAJAX = {
		POST: function(url, contentType, processData, obj, async, successCallback, param, errorCallback, count) {
			document.body.style.cursor = 'wait';
			$.ajax({
				url: url,
				contentType: contentType,
				headers: make_headers(),
				type: 'POST',
				data: (processData ? obj : JSON.stringify(obj)),
				dataType: 'text',
				timeout: AJAX_TIMEOUT,
				async: async,
				processData: processData,
				success: function(data, textStatus, jqXHR) {
					document.body.style.cursor = 'default';
					successCallback(data, textStatus, jqXHR, param);
				},
				error: function(jqXHR, textStatus, errorThrown) {
					if (errorCallback == null) {
						handleError(jqXHR, textStatus, errorThrown, restAJAX.POST, url, contentType, processData, obj, async, successCallback, param, errorCallback, count);
					} else {
						errorCallback(jqXHR, textStatus, errorThrown, restAJAX.POST, url, contentType, processData, obj, async, successCallback, param, errorCallback, count);
					}
				}
			});
		},
		GET: function(url, contentType, async, successCallback, param, errorCallback, count) {
			restAJAX.fetch(url, contentType, true, [], async, successCallback, param, errorCallback, count);
		},
		fetch: function(url, contentType, processData, obj, async, successCallback, param, errorCallback, count) {
			document.body.style.cursor = 'wait';
			$.ajax({
				url: url,
				contentType: contentType,
				headers: make_headers(),
				timeout: AJAX_TIMEOUT,
				async: async,
				accepts: {text: 'application/json'},
				processData: processData,
				data: (processData ? obj : JSON.stringify(obj)),
				dataType: 'json',
				success: function(data, textStatus, jqXHR) {
					document.body.style.cursor = 'default';
					successCallback(data, textStatus, jqXHR, param);
				},
				error: function(jqXHR, textStatus, errorThrown) {
					if (errorCallback == null) {
						handleError(jqXHR, textStatus, errorThrown, restAJAX.fetch, url, contentType, processData, obj, async, successCallback, param, errorCallback, count);
					} else {
						errorCallback(jqXHR, textStatus, errorThrown, restAJAX.fetch, url, contentType, processData, obj, async, successCallback, param, errorCallback, count);
					}
				}
			});
		},
		DELETE: function(url, async, successCallback, param, errorCallback, count) {
			restAJAX.remove(url, null, true, null, async, successCallback, param, errorCallback, count);
		},
		remove: function(url, contentType, processData, obj, async, successCallback, param, errorCallback, count) {
			document.body.style.cursor = 'wait';
			$.ajax({
				url: url,
				headers: make_headers(),
				type: 'DELETE',
				timeout: AJAX_TIMEOUT,
				async: async,
				dataType: 'text',
				success: function(data, textStatus, jqXHR) {
					document.body.style.cursor = 'default';
					successCallback(data, textStatus, jqXHR, param);
				},
				error: function(jqXHR, textStatus, errorThrown) {
					if (errorCallback == null) {
						handleError(jqXHR, textStatus, errorThrown, restAJAX.remove, url, contentType, processData, obj, async, successCallback, param, errorCallback, count);
					} else {
						errorCallback(jqXHR, textStatus, errorThrown, restAJAX.remove, url, contentType, processData, obj, async, successCallback, param, errorCallback, count);
					}
				}
			});
		},
		PUT: function(url, contentType, processData, obj, async, successCallback, param, errorCallback, count) {
			document.body.style.cursor = 'wait';
			$.ajax({
				url: url,
				contentType: contentType,
				headers: make_headers(),
				type: 'PUT',
				data: (processData ? obj : JSON.stringify(obj)),
				dataType: 'json',
				timeout: AJAX_TIMEOUT,
				processData: processData,
				async: async,
				success: function(data, textStatus, jqXHR) {
					document.body.style.cursor = 'default';
					successCallback(data, textStatus, jqXHR, param);
				},
				error: function(jqXHR, textStatus, errorThrown) {
					if (errorCallback == null) {
						handleError(jqXHR, textStatus, errorThrown, restAJAX.PUT, url, contentType, processData, obj, async, successCallback, param, errorCallback, count);
					} else {
						errorCallback(jqXHR, textStatus, errorThrown, restAJAX.PUT, url, contentType, processData, obj, async, successCallback, param, errorCallback, count);
					}
				}
			});
		}
};

function make_headers() {
	var res = {'User-agent': 'CIRM/1.0'};
	token = $.cookie(goauth_cookie);
	if (token != null) {
		res['Authorization'] = 'Globus-Goauthtoken ' + token;
	}
	return res;
}

/**
 * Handle an error from the AJAX request
 * retry the request in case of timeout
 * maximum retries: 10
 * each retry is performed after an exponential delay
 * 
 * @param jqXHR
 * 	the jQuery XMLHttpRequest
 * @param textStatus
 * 	the string describing the type of error
 * @param errorThrown
 * 	the textual portion of the HTTP status
 * @param retryCallback
 * 	the AJAX request to be retried
 * @param url
 * 	the request url
 * @param obj
 * 	the parameters (in a dictionary form) for the POST request
 * @param async
 * 	the operation type (sync or async)
 * @param successCallback
 * 	the success callback function
 * @param param
 * 	the parameters for the success callback function
 * @param errorCallback
 * 	the error callback function
 * @param count
 * 	the number of retries already performed
 */
function handleError(jqXHR, textStatus, errorThrown, retryCallback, url, contentType, processData, obj, async, successCallback, param, errorCallback, count) {
	var retry = false;
	
	switch(jqXHR.status) {
	case 0:		// client timeout
	case 408:	// server timeout
	case 503:	// Service Unavailable
	case 504:	// Gateway Timeout
		retry = (count <= MAX_RETRIES);
		break;
	}
	
	if (!retry) {
		var msg = '';
		var err = jqXHR.status;
		if (err != null) {
			msg += 'Status: ' + err + '\n';
		}
		err = jqXHR.responseText;
		if (err != null) {
			msg += 'ResponseText: ' + err + '\n';
		}
		if (textStatus != null) {
			msg += 'TextStatus: ' + textStatus + '\n';
		}
		if (errorThrown != null) {
			msg += 'ErrorThrown: ' + errorThrown + '\n';
		}
		msg += 'URL: ' + url + '\n';
		document.body.style.cursor = 'default';
		alert(msg);
	} else {
		var delay = Math.round(Math.ceil((0.75 + Math.random() * 0.5) * Math.pow(10, count) * 0.00001));
		setTimeout(function(){retryCallback(url, contentType, processData, obj, async, successCallback, param, errorCallback, count+1);}, delay);
	}
}

function init() {
	// necessary for window.location to be initialized
	setTimeout('renderLogin()', 1);
}

function renderLogin() {
	HOME = '' + window.location;
	var index = HOME.lastIndexOf('/cansim');
	HOME = HOME.substring(0, index);
	ERMREST_HOME = HOME + ERMREST_HOME;
	WEBAUTHN_HOME = HOME + WEBAUTHN_HOME;
	DOWNLOAD_HOME = HOME + DOWNLOAD_HOME;
	ERMREST_SCHEMA_HOME = HOME + ERMREST_SCHEMA_HOME;

	var uiDiv = $('#cansim');
	uiDiv.html('');
	var logoDiv = $('<div>');
	uiDiv.append(logoDiv);
	var img = $('<img>');
	logoDiv.append(img);
	img.attr({'alt': 'USC logo',
		'src': '/cansim/images/usc-primaryshieldwordmark.png',
		'width': 300,
		'height': 100
		});
	img.addClass('center');
	var fieldsetDiv = $('<div>');
	uiDiv.append(fieldsetDiv);
	fieldsetDiv.addClass('center_fieldset');
	fieldsetDiv.append('<br/><br/>');
	var fieldset = $('<fieldset>');
	fieldsetDiv.append(fieldset);
	var legend = $('<legend>');
	fieldset.append(legend);
	legend.html('Login');
	var table = $('<table>');
	fieldset.append(table);
	var tr = $('<tr>');
	table.append(tr);
	var td = $('<td>');
	tr.append(td);
	td.html('Username: ');
	td.addClass('tag');
	var input = $('<input>');
	input.attr({'type': 'text',
		'id': 'username',
		'name': 'username',
		'size': 15
	});
	td.append(input);
	tr = $('<tr>');
	table.append(tr);
	td = $('<td>');
	tr.append(td);
	td.html('Password: ');
	td.addClass('tag');
	var input = $('<input>');
	input.attr({'type': 'password',
		'id': 'password',
		'name': 'password',
		'size': 15
	});
	td.append(input);
	input.keyup(function(event) {checkSubmitLogin(event);});
	tr = $('<tr>');
	table.append(tr);
	td = $('<td>');
	tr.append(td);
	var input = $('<input>');
	input.attr({'type': 'button',
		'value': 'Login'
	});
	td.append(input);
	input.click(function(event) {submitLogin();});
}

function checkSubmitLogin(event) {
	if (event.which == 13) {
		submitLogin();
	}
}

function submitLogin() {
	USER = $('#username').val();
	if (GLOBUS_AUTHN) {
		submitGlobusLogin($('#username').val(), $('#password').val());
	} else {
		submitDatabaseLogin();
	}
}

function make_basic_auth(user, password) {
    var tok = user + ':' + password;
    var hash = btoa(tok);
    return 'Basic ' + hash;
}

function submitGlobusLogin(username, password) {
	token = $.cookie(goauth_cookie);
	if (token != null) {
		$.removeCookie(goauth_cookie);
		token = null;
	}
	if (token == null) {
		var url = '/service/nexus/goauth/token?grant_type=client_credentials';
		var result = {};
		$.ajax({
			async: false,
			type: 'GET',
			dataType: 'json',
			url: url,
			headers: { Authorization: make_basic_auth(username, password) },
			error: function(jqXHR, textStatus, errorThrown) {
				handleError(jqXHR, textStatus, errorThrown, null, url, null, null, null, false, null, null, null, MAX_RETRIES);
				result = null;
			},
			success: function(json) {
				result = json;
			}
		});

		if (result != null) {
			token = result['access_token'];
			//alert(token);
			$.cookie(goauth_cookie, token, { expires: 7 });
			postSubmitLogin();
		}
	}
}

function submitDatabaseLogin() {
	var user = $('#username').val();
	var password = $('#password').val();
	var url = WEBAUTHN_HOME;
	var obj = new Object();
	obj['username'] = user;
	obj['password'] = password;
	restAJAX.POST(url, 'application/x-www-form-urlencoded; charset=UTF-8', true, obj, true, postSubmitLogin, null, null, 0);
}

function postSubmitLogin(data, textStatus, jqXHR, param) {
	// check if the login page was loaded under an i-frame
	if (window.top.location != window.location) {
		alert('An expected frame was detected. For security reasons, you are logged out.');
		document.body.style.cursor = 'default';
		return;
	}
	initREST();
}

function initREST() {
	getRootEntities(rootTable);
}

function getRootEntities() {
	var url = ERMREST_HOME + '/' + encodeSafeURIComponent(rootTable);
	restAJAX.GET(url, 'application/x-www-form-urlencoded; charset=UTF-8', true, postGetRootEntities, null, null, 0);
}

function postGetRootEntities(data, textStatus, jqXHR, param) {
	rootList = data;
	rootDict = {};
	$.each(data, function(i, item) {
		rootDict[item['id']] = item;
	});
	
	drawPanels();
}

function getMetadata(table) {
	var url = ERMREST_SCHEMA_HOME + encodeSafeURIComponent(table);
	document.body.style.cursor = 'wait';
	$.ajax({
		url: url,
		contentType: 'application/x-www-form-urlencoded; charset=UTF-8',
		headers: make_headers(),
		timeout: AJAX_TIMEOUT,
		async: false,
		accepts: {text: 'application/json'},
		processData: true,
		data: [],
		dataType: 'json',
		success: function(data, textStatus, jqXHR) {
			document.body.style.cursor = 'default';
			tablesMetadata[table] = data;
		},
		error: function(jqXHR, textStatus, errorThrown) {
			document.body.style.cursor = 'default';
			var msg = '';
			var err = jqXHR.status;
			if (err != null) {
				msg += 'Status: ' + err + '\n';
			}
			err = jqXHR.responseText;
			if (err != null) {
				msg += 'ResponseText: ' + err + '\n';
			}
			if (textStatus != null) {
				msg += 'TextStatus: ' + textStatus + '\n';
			}
			if (errorThrown != null) {
				msg += 'ErrorThrown: ' + errorThrown + '\n';
			}
			msg += 'URL: ' + url + '\n';
			document.body.style.cursor = 'default';
			alert(msg);
		}
	});
}

function drawPanels() {
	var cirm = $('#cansim');
	cirm.html('');
	var container = $('<div>');
	cirm.append(container);
	container.attr('id', 'container');
	var div = $('<div>');
	container.append(div);
	div.attr('id', 'leftPanel');
	div.addClass('pane ui-layout-west');
	div = $('<div>');
	container.append(div);
	div.attr('id', 'centerPanel');
	div.addClass('pane ui-layout-center');
	var subdiv = $('<div>');
	subdiv.attr('id', 'centerPanelTop');
	div.append(subdiv);
	subdiv = $('<div>');
	subdiv.attr('id', 'centerPanelBottom');
	div.append(subdiv);
	initCenterPanelButtons();
	div = $('<div>');
	container.append(div);
	div.attr('id', 'rightPanel');
	div.addClass('pane ui-layout-east');
	var subdiv = $('<div>');
	subdiv.attr('id', 'rightPanelTop');
	div.append(subdiv);
	var subdiv = $('<div>');
	subdiv.attr('id', 'rightPanelBottom');
	div.append(subdiv);
	initRightPanelButtons();
	div = $('<div>');
	container.append(div);
	div.attr('id', 'topPanel');
	div.addClass('pane ui-layout-north');
	div = $('<div>');
	container.append(div);
	div.attr('id', 'bottomPanel');
	div.addClass('pane ui-layout-south right');
	initPanels();
	container.layout({
		east: {size: 350},
		west: {size: 350},
		north: {resizable: false},
		south: {resizable: false}});
	$('#centerPanel').css('max-height', $('#centerPanel').css('height'));
}

function initCenterPanelButtons() {
	var panel = $('#centerPanelBottom');
	panel.append('<br>');
		
	var button = $('<button>');
	panel.append(button);
	button.attr('id', 'backButton');
	button.html('Back');
	button.button({icons: {primary: 'ui-icon-arrowthick-1-w'}}).click(function(event) {goBack();});

	$('button', panel).hide();
}

function callFunction(f, args) {
	var no = args.length;
	switch(no) {
	case 0:
		f();
		break;
	case 1:
		f(args[0]);
		break;
	case 2:
		f(args[0], args[1]);
		break;
	case 3:
		f(args[0], args[1], args[2]);
		break;
	default:
		alert('Function with ' + no + ' arguments is not yet implemented.');
			
	}
}
function goBack() {
	expandStack.pop();
	var item = expandStack.pop();
	callFunction(item['f'], item['params']);
	$('#backButton').hide();
}

function initRightPanelButtons() {
	var panel = $('#rightPanelBottom');
	
	var button = $('<button>');
	panel.append(button);
	button.attr('id', 'editButton');
	button.html('Edit');
	button.button({icons: {primary: 'ui-icon-note'}});

	button = $('<button>');
	panel.append(button);
	button.attr('id', 'cancelButton');
	button.html('Cancel');
	button.button({icons: {primary: 'ui-icon-cancel'}});

	button = $('<button>');
	panel.append(button);
	button.attr('id', 'saveButton');
	button.html('Save');
	button.button({icons: {primary: 'ui-icon-document'}});

	$('button', panel).hide();
}

function initPanels() {
	initTopPanel();
	var leftPanel = $('#leftPanel');
	leftPanel.html('');
	var rootContent = getEntityContent(rootList, rootDisplayName, rootEntityName, displayRootEntity, null);
	loadLeftPanel(leftPanel, rootContent);
	//var searchContent = getEntityContent(searchList, 'Search History', 'Search', displaySearch, null);
	//loadLeftPanel(leftPanel, searchContent);
	//var active = (newSearchKeywords != null) ? 1 : 0;
	var active = 0;
	leftPanel.accordion({ 'header': 'h4',
		'heightStyle': 'content',
		'active': active});
	var rightPanel = $('#rightPanelTop');
	rightPanel.html('');
	$('#centerPanelTop').html(CIRM_START_INFO);
	/*
	if (newSearchKeywords == null) {
		$('#centerPanelTop').html(CIRM_START_INFO);
	}
	*/
	var bottomPanel = $('#bottomPanel');
	initBottomPanel(bottomPanel);
}

function initTopPanel() {
	var topPanel = $('#topPanel');
	var div = $('<div>');
	div.attr('id', 'header');
	topPanel.append(div);
	var h1 = $('<h1>');
	h1.html('Cancer Simulation Viewer');
	div.append(h1);
	/*
	var div = $('<div>');
	div.attr('id', 'searchForm');
	topPanel.append(div);
	var label = $('<label>');
	div.append(label);
	label.attr('for', 'search');
	label.html('Search: ');
	var input = $('<input>');
	input.attr({'id': 'search',
		'size': '50'});
	div.append(input);
	input.keyup(function(event) {checkSearch(event);});
	*/
}

function checkSearch(event) {
	if (event.which == 13) {
		var originalValue = $('#search').val().replace(/^\s*/, "").replace(/\s*$/, "");
		if (originalValue.length > 0) {
			originalValue = getSearchExpression(originalValue, ' ');
			if (searchList.contains(originalValue)) {
				selectSearch(originalValue);
			} else {
				searchList.unshift(originalValue);
				newSearchKeywords = originalValue;
				drawPanels();
				newSearchKeywords = null;
				selectNewSearch();
			}
		}
	}
}

function getSearchExpression(originalValue, delimiter) {
	var arr = originalValue.split(' ');
	var keywords = [];
	$.each(arr, function(i, value) {
		if (value != '') {
			keywords.push(value);
		}
	});
	keywords = keywords.join(delimiter);
	return keywords;
}

function selectSearch(keywords) {
	$.each($('li', $('#SearchUL')), function(i, li) {
		if ($(li).html() == keywords) {
			$('#leftPanel').accordion( "option", "active", 2 );
			$(li).click();
			return false;
		}
	});
}

function selectNewSearch() {
	var newSearch = $('li', $('#SearchUL'))[0];
	$(newSearch).click();
}

function displayRootEntity(ul, li) {
	$('li', $('#leftPanel')).removeClass('highlighted');
	li.addClass('highlighted');
	$('#centerPanelTop').html('');
	displayEntity(rootTable, rootDict[li.attr('entityId')]);
	expandEntity(li.attr('entityId'));
}

function displayEntity(table, item) {
	var cols = getTableColumns(table);
	$('#editButton').unbind('click');
	//$('#editButton').click(function(event) {editEntity(itemType);});
	$('#cancelButton').unbind('click');
	//$('#cancelButton').click(function(event) {cancel(updateItem);});
	$('#saveButton').unbind('click');
	//$('#saveButton').click(function(event) {updateEntity(itemType);});
	//$('#saveButton').removeAttr('disabled');
	$('#editButton').hide();
	$('#cancelButton').hide();
	$('#saveButton').hide();

	var rightPanel = $('#rightPanelTop');
	rightPanel.html('');

	$.each(cols, function(i, col) {
		var dl = $('<dl>');
		rightPanel.append(dl);
		var dt = $('<dt>');
		dl.append(dt);
		dt.addClass('info');
		dt.html(col+': ');
		var span = $('<span>');
		dl.append(span);
		var dd = $('<dd>');
		dd.attr('id', col + 'Label');
		dd.html(item[col]);
		span.append(dd);
		var input = $('<input>');
		input.attr({'type': 'text',
			'id': col + 'Input',
			'size': 30});
		span.append(input);
		input.hide();
	});
}

function expandLink(table, col, id) {
	var url = ERMREST_HOME + '/' + encodeSafeURIComponent(table) + '/' + encodeSafeURIComponent(col) + '=' + encodeSafeURIComponent(id);
	var params = {'table': table,
			'params': [table, col, id]};
	restAJAX.GET(url, 'application/x-www-form-urlencoded; charset=UTF-8', true, postExpandLink, params, null, 0);
}

function postExpandLink(data, textStatus, jqXHR, param) {
	var query = {'f': expandLink,
			'params': param['params']};
	expandStack.push(query);
	appendEntities(data, param['table']);
	$('#backButton').show();
}

function setEntityColumn(table, col, id, td) {
	var a = $('<a>');
	a.addClass('link-style banner-text');
	a.attr('href', 'javascript:expandLink("' + table + '", "' + col + '", "' + id + '")');
	a.html(id);
	td.append(a);
}

function setDownloadLink(filename, td) {
	var a = $('<a>');
	a.addClass('link-style banner-text');
	a.attr('href', 'javascript:download("' + filename + '")');
	a.html(filename);
	td.append(a);
}

function download(filename) {
	var url = DOWNLOAD_HOME + filename;
	window.open(
	  url,
	  '_blank' // <- This is what makes it open in a new window.
	);
}

function appendEntities(data, tableName) {
	var centerPanel = $('#centerPanelTop');
	var arr = [].concat(data);
	if (arr.length == 0) {
		centerPanel.html(CIRM_NO_ENTITIES_INFO);
	} else {
		getMetadata(tableName);
		var colNames = getColumnNames(data[0]);
		centerPanel.html('');
		var p = $('<p>');
		centerPanel.append(p);
		p.addClass('intro');
		p.html(tableName);
		var table = $('<table>');
		centerPanel.append(table);
		table.attr('id', 'queryTable');
		table.addClass('itemTable');
		var tr = $('<tr>');
		table.append(tr);
		$.each(colNames, function(i, col) {
			var th = $('<th>');
			tr.append(th);
			th.html(col);
		});
		$.each(data, function(i, row) {
			var tr = $('<tr>');
			table.append(tr);
			if (i%2 == 1) {
				tr.addClass('odd');
			}
			$.each(colNames, function(j, col) {
				var td = $('<td>');
				td.addClass('center');
				tr.append(td);
				if (isDownload(tableName, col)) {
					setDownloadLink(row[col], td);
				}
				else if (isReference(tableName, col)) {
					var refTable = getReferenceTable(tableName, col);
					var refColumn = getReferenceColumn(tableName, col);
					setEntityColumn(refTable, refColumn, row[col], td);
				} else {
					td.html(row[col]);
				}
			});
		});
	}
	$('#centerPanelTop').show();
}

function getColumnNames(row) {
	var res = [];
	$.each(row, function(col, val) {
		res.push(col);
	});
	return res;
}

function expandEntity(id) {
	$('#backButton').hide();
	var url = ERMREST_HOME + '/' + encodeSafeURIComponent(rootRefTable) + '/' + encodeSafeURIComponent(rootRefColumn ) + '=' + encodeSafeURIComponent(id);
	var params = {'table': rootRefTable,
			'params': [id]};
	restAJAX.GET(url, 'application/x-www-form-urlencoded; charset=UTF-8', true, postExpandEntity, params, null, 0);
}

function postExpandEntity(data, textStatus, jqXHR, param) {
	var query = {'f': expandEntity,
			'params': param['params']};
	expandStack.push(query);
	appendEntities(data, param['table']);
}

function submitLogout() {
	if (GLOBUS_AUTHN) {
		token = $.cookie(goauth_cookie);
		if (token != null) {
			$.removeCookie(goauth_cookie);
		}
		postSubmitLogout();
	} else {
		var url = WEBAUTHN_HOME;
		restAJAX.DELETE(url, true, postSubmitLogout, null, errorSubmitLogout, 0);
	}
}

function postSubmitLogout(data, textStatus, jqXHR, param) {
	window.location = window.location;
}

function errorSubmitLogout(jqXHR, textStatus, errorThrown, retryCallback, url, contentType, processData, obj, async, successCallback, param, errorCallback, count) {
	window.location = window.location;
}

function getEntityContent(entityList, displayName, entityName, clickFunction, createFunction) {
	var entityContent = [];
	var obj = {};
	obj['Display'] = displayName;
	obj['Name'] = entityName;
	obj['Click'] = clickFunction;
	obj['Create'] = createFunction;
	var values = [];
	var ids = [];
	var arr = [].concat(entityList);
	$.each(arr, function(i, item) {
		if (entityName != 'Search') {
			ids.push(item['id']);
			values.push(item[rootColumn]);
		} else {
			values.push(item);
		}
	});
	obj['ids'] = ids;
	obj['Values'] = values;
	entityContent.push(obj);
	return entityContent;
}

function setThumbnail(file, td) {
	var img = $('<img>');
	if (file != null) {
		img.attr({'alt': 'Undefined',
			'title': 'Thumbnail',
			'src': 'images/'+file,
			'width': 30,
			'height': 30
			});
	} else {
		img.attr({'alt': 'Undefined',
			'title': 'Thumbnail',
			'src': 'images/blank.jpeg',
			'width': 30,
			'height': 30
			});
	}
	td.append(img);
}

function getSearchEntities(table, keywords, originalValue) {
	var url = ERMREST_HOME + '/' + encodeSafeURIComponent(table) + '/' + encodeSafeURIComponent('*') + '::ts::' + encodeSafeURIComponent(keywords);
	var params = {'keywords': keywords,
			'originalValue': originalValue};
	restAJAX.GET(url, 'application/x-www-form-urlencoded; charset=UTF-8', true, postGetSearchEntities, params, null, 0);
}

function postGetSearchEntities(data, textStatus, jqXHR, param) {
	appendEntities(data);
}

function clickEntity(ul, label) {
	$.each($('li', ul), function(i, li) {
		if ($(li).html() == label) {
			$(li).click();
			return false;
		}
	});
}

function loadLeftPanel(panel, vals) {
	$.each(vals, function(i, val) {
		var h4 = $('<h4>');
		panel.append(h4);
		h4.html(val['Display']);
		if (val['Create'] != null) {
			var buttonImage = $('<button>').button({icons: {primary: 'ui-icon-circle-plus'},
				text: false});
			buttonImage.addClass('newEntity');
			buttonImage.click(function(event) {val['Create']();});
			buttonImage.attr('title', 'New '+val['Name']);
			buttonImage.css('width', 5);
			h4.append(buttonImage);
		}
		var div = $('<div>');
		div.attr('id', val['Name']+'Div');
		panel.append(div);
		var ul = $('<ul>');
		div.append(ul);
		ul.addClass('left_panel');
		ul.attr('id', val['Name']+'UL');
		var ids = val['ids'];
		$.each(val['Values'], function(j, value) {
			var li = $('<li>');
			li.attr('entityId', ids[j]);
			ul.append(li);
			li.addClass('nowrap');
			li.html(value);
		});
		$('li', ul).click(function(event) {val['Click'](ul, $(this));});
		$('li', ul).hover(
				function(event) {document.body.style.cursor = 'pointer';}, 
				function(){document.body.style.cursor = 'default';});
	});
}

function initBottomPanel(panel) {
	panel.html('');

	div = $('<div>');
	panel.append(div);
	div.attr('id', 'viterbi');
	div.html('<a href="http://viterbi.usc.edu" target="_newtab2">USC Viterbi School of Engineering</a>');

	var button = $('<button>');
	panel.append(button);
	button.attr('id', 'logoutButton');
	button.html('Logout');
	button.button({icons: {primary: 'ui-icon-home'}}).click(function(event) {submitLogout();});
}

function compareIgnoreCase(str1, str2) {
	var val1 = str1.toLowerCase();
	var val2 = str2.toLowerCase();
	if (val1 == val2) {
		return 0;
	} else if (val1 < val2) {
		return -1;
	} else {
		return 1;
	}
}

function compareNumbers(val1, val2) {
	var ret = 0;
	if (val1 < val2) {
		ret = -1;
	} else if (val1 > val2) {
		ret = 1;
	}
	return ret;
}

function compareIds(item1, item2) {
	var val1 = item1['id'];
	var val2 = item2['id'];
	return compareIgnoreCase(val1, val2);
}

function valueToString(val) {
	if ($.isArray(val)) {
		return arrayToString(val);
	} else if ($.isPlainObject(val)) {
		return objectToString(val);
	} else if ($.isNumeric(val)) {
		return val;
	} else if ($.isFunction(val)) {
		return '"Function"';
	} else if($.isWindow(val)) {
		return '"Window"';
	} else if ($.isXMLDoc(val)) {
		return '"XMLDoc"';
	} else {
		var valType = $.type(val);
		if (valType == 'string') {
			return '"' + escapeDoubleQuotes(val) + '"';
		} else if (valType == 'boolean') {
			return val;
		} else if (valType == 'object') {
			return '"Object"';
		} else {
			return '"' + valType + '"';
		}
	}
}

function arrayToString(obj) {
	var s = '[';
	var first = true;
	$.each(obj, function(i, val) {
		if (!first) {
			s += ',';
		}
		first = false;
		s += valueToString(val);
	});
	s += ']';
	return s;
}

function objectToString(obj) {
	var s = '{';
	var first = true;
	$.each(obj, function(key, val) {
		if (!first) {
			s += ',';
		}
		first = false;
		s += '"' + key + '":' + valueToString(val);
	});
	s += '}';
	return s;
}

function escapeDoubleQuotes(text) {
	return text.replace(/\n/g, '\\n').replace(/\r/g, '\\r').replace(/"/g, '\\"');
}

function encodeSafeURIComponent(value) {
	var ret = encodeURIComponent(value);
	$.each(URL_ESCAPE, function(i, c) {
		ret = ret.replace(new RegExp('\\' + c, 'g'), escape(c));
	});
	return ret;
}

function displaySearch(ul, li) {
	$('li', $('#leftPanel')).removeClass('highlighted');
	li.addClass('highlighted');
	$('#rightPanelTop').html('');
	$('#centerPanelTop').html('');
	$('#centerPanelBottom').show();
	$('button', $('#centerPanelBottom')).hide();
	getSearchEntities(getSearchExpression(li.html(), '&'), li.html());
}

function isDownload(tableName, col) {
	var ret = false;
	if (downloadTables[tableName] != null && downloadTables[tableName][col] != null) {
		ret = true;
	}
	return ret;
}

function getTableColumns(table) {
	getMetadata(table);
	var data = tablesMetadata[table];
	var ret = [];
	if (data != null) {
		var column_definitions = data['column_definitions'];
		$.each(column_definitions, function(i, col) {
			ret.push(col['name']);
		});
	}
	return ret;
}

function isReference(table, col) {
	var ret = false;
	if (referenceTables[table] != null && referenceTables[table][col] != null) {
		ret = true;
	} else {
		var data = tablesMetadata[table];
		if (data != null) {
			var foreign_keys = data['foreign_keys'];
			$.each(foreign_keys, function(i, foreign_key) {
				if (foreign_key['ref_columns'].contains(col)) {
					ret = true;
					return false;
				}
			});
		}
	}
	return ret;
}

function getReferenceTable(table, col) {
	var ret = null;
	if (referenceTables[table] != null && referenceTables[table][col] != null) {
		ret = referenceTables[table][col]['table'];
	} else {
		var reference = getReference(table, col);
		if (reference != null) {
			ret = reference['referred_table']['table_name'];
		}
	}
	return ret;
}

function getReference(table, col) {
	var ret = null;
	var data = tablesMetadata[table];
	if (data != null) {
		var foreign_keys = data['foreign_keys'];
		$.each(foreign_keys, function(i, foreign_key) {
			if (foreign_key['ref_columns'].contains(col)) {
				var references = foreign_key['references'];
				var hasReference = false;
				$.each(references, function(j, reference) {
					var referring_to_unique_maps = reference['referring_to_unique_maps'];
					$.each(referring_to_unique_maps, function(k, referring_to_unique_map) {
						$.each(referring_to_unique_map, function(key, val) {
							if (key == col) {
								ret = reference;
								return false;
							}
						});
					});
					if (ret != null) {
						return false;
					}
				});
			}
			if (ret != null) {
				return false;
			}
		});
	}
	return ret;
}

function getReferenceColumn(table, col) {
	var ret = null;
	if (referenceTables[table] != null && referenceTables[table][col] != null) {
		ret = referenceTables[table][col]['refColumn'];
	} else {
		var reference = getReference(table, col);
		if (reference != null) {
			var referring_to_unique_maps = reference['referring_to_unique_maps'];
			$.each(referring_to_unique_maps, function(i, referring_to_unique_map) {
				$.each(referring_to_unique_map, function(key, val) {
					if (key == col) {
						ret = val;
						return false;
					}
				});
				if (ret != null) {
					return false;
				}
			});
		}
	}
	return ret;
}

