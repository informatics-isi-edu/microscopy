Array.prototype.contains = function (elem) {
	for (i in this) {
		if (this[i] == elem) return true;
	}
	return false;
};

var CXI_RET='Return value';
var CXI_MSG='Return Message';
var GUEST_USER = '********';
var GUEST_PASSWORD = '********';
var GLOBUS_AUTHN = true;
var PRINTER_ADDR = 'mycxi.isi.edu';
var PRINTER_PORT = 9100;
var HOME;
var ERMREST_HOME = '/ermrest/catalog/1/entity';
var WEBAUTHN_HOME = '/ermrest/authn/session';
var PRINT_JOB_HOME = '/ermrest/printer/';
var PRINT_CONTROL_HOME = '/ermrest/printer/';
var ZOOMIFY_HOME = '/ermrest/zoomify/';
var MAX_RETRIES = 10;
var AJAX_TIMEOUT = 300000;
var CIRM_START_INFO = '<p class="intro">Choose an entity from the left sidebar or use the search box to find relevant images.</p>';
var CIRM_NO_SCANS_INFO = '<p class="intro">No images are available.</p>';
var CIRM_NO_SLIDES_INFO = '<p class="intro">No slides are available.</p>';
var CIRM_NO_UNASSIGNED_SLIDES_INFO = '<p class="intro">No slides are available to be assigned.</p>';
var CIRM_UNASSIGNED_SLIDES_INFO = '<p class="intro">Slides available to be assigned:</p>';
var CIRM_NEW_EXPERIMENT = '<p class="intro">New Experiment</p>';
var CIRM_NEW_BOX = '<p class="intro">New Box</p>';
var cirm_mobile = false;
var mobileParams = null;
var newBoxId = null;
var newExperimentId = null;
var newSlideId = null;

var goauth_cookie = 'globusonline-goauth';
var token = null;

var boxColumns = ['id', 'section_date', 'sample_name', 'initials', 'disambiguator', 'comment'];
var boxEditColumns = ['comment'];
var boxDisplayColumns = {'id': 'Box ID', 'section_date': 'Section Date', 'sample_name': 'Sample Name', 'initials': 'Initials', 'disambiguator': 'Disambiguator', 'comment': 'Comment'};
var boxesDict = {};
var boxesList = [];
// {"id":"20131108-wnt1creZEGG-RES-0","section_date":"2013-11-08","sample_name":"wnt1creZEGG","initials":"RES","disambiguator":"0","comment":"This is a box of origin"}

var experimentColumns = ['id', 'experiment_date', 'experiment_description', 'initials', 'disambiguator', 'comment'];
var experimentEditColumns = ['comment'];
var experimentDisplayColumns = {'id': 'Experiment ID', 'experiment_date': 'Experiment Date', 'experiment_description': 'Experiment Description', 'initials': 'Initials', 'disambiguator': 'Disambiguator', 'comment': 'Comment'};
var experimentsDict = {};
var experimentsList = [];
// {"id":"20131115-myantibody2-KC-0","experiment_date":"2013-11-15","experiment_description":"myantibody2","initials":"KC","disambiguator":"0","comment":"This is Karl's experiment"}

var slideNoDisplayColumns = ['id'];
var slideClassColumns = {'box_of_origin_id': 'box', 'experiment_id': 'experiment'};
var slideTableColumns = ['id', 'thumbnail', 'sequence_num', 'revision', 'box_of_origin_id', 'experiment_id', 'comment'];
var slideTableDisplayColumns = {'thumbnail': 'Thumbnail', 'sequence_num': 'Sequence Number', 'revision': 'Revision', 'box_of_origin_id': 'Box ID', 'experiment_id': 'Experiment ID', 'comment': 'Comment'};
var slideDisplayValue = {'id': getSlideIdValue, 'sequence_num': getSlideColumnValue, 'revision': getSlideColumnValue, 'box_of_origin_id': getSlideColumnValue, 'experiment_id': getSlideColumnValue, 'comment': getSlideColumnValue, 'thumbnail': getSlideThumbnail};

var slideColumns = ['id', 'box_of_origin_id', 'sequence_num', 'revision', 'experiment_id', 'comment'];
var slideDisplayColumns = {'id': 'Slide ID', 'box_of_origin_id': 'Box ID', 'sequence_num': 'Sequence Number', 'revision': 'Revision', 'experiment_id': 'Experiment ID', 'comment': 'Comment'};
var slideEditColumns = ['comment'];
var slideExperimentColumn = 'experiment_id';
var slidesDict = {};
var slidesList = [];
//{"id":"20131108-wnt1creZEGG-RES-0-09-000","sequence_num":9,"revision":0,"box_of_origin_id":"20131108-wnt1creZEGG-RES-0","experiment_id":"20131115-myantibody2-KC-0","comment":"This is a slide"}
var unassignedSlidesDict = {};
var unassignedSlidesList = [];
//{"id":"20131108-wnt1creZEGG-RES-0-09-000","sequence_num":9,"revision":0,"box_of_origin_id":"20131108-wnt1creZEGG-RES-0","experiment_id":null,"comment":"This is a slide"}

var scanColumns = ['id', 'slide_id', 'scan_num', 'filename', 'thumbnail', 'tilesdir', 'comment'];
var scanEditColumns = ['comment'];
var scanDisplayColumns = {'id': 'Scan ID', 'slide_id': 'Slide ID', 'scan_num': 'Scan Number', 'filename': 'File', 'thumbnail': 'Thumbnail', 'tilesdir': 'Tile Directory', 'comment': 'Comment'};
var scansDict = {};
var scansList = [];
// {"id":"20131108-wnt1creZEGG-RES-0-38-001-000","slide_id":"20131108-wnt1creZEGG-RES-0-38-001","scan_num":0,"filename":"20131108-wnt1creZEGG-RES-0-38-001.czi","thumbnail":"20131108-wnt1creZEGG-RES-0-38-001.jpeg","tilesdir":"20131108-wnt1creZEGG-RES-0-38-001/","comment":"This is a scan"}


var searchData = [];
// { label: 'anders', category: 'Experiment' }

var cirmAJAX = {
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
						handleError(jqXHR, textStatus, errorThrown, cirmAJAX.POST, url, contentType, processData, obj, async, successCallback, param, errorCallback, count);
					} else {
						errorCallback(jqXHR, textStatus, errorThrown, cirmAJAX.POST, url, contentType, processData, obj, async, successCallback, param, errorCallback, count);
					}
				}
			});
		},
		GET: function(url, contentType, async, successCallback, param, errorCallback, count) {
			cirmAJAX.fetch(url, contentType, true, [], async, successCallback, param, errorCallback, count);
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
						handleError(jqXHR, textStatus, errorThrown, cirmAJAX.fetch, url, contentType, processData, obj, async, successCallback, param, errorCallback, count);
					} else {
						errorCallback(jqXHR, textStatus, errorThrown, cirmAJAX.fetch, url, contentType, processData, obj, async, successCallback, param, errorCallback, count);
					}
				}
			});
		},
		DELETE: function(url, async, successCallback, param, errorCallback, count) {
			cirmAJAX.remove(url, null, true, null, async, successCallback, param, errorCallback, count);
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
						handleError(jqXHR, textStatus, errorThrown, cirmAJAX.remove, url, contentType, processData, obj, async, successCallback, param, errorCallback, count);
					} else {
						errorCallback(jqXHR, textStatus, errorThrown, cirmAJAX.remove, url, contentType, processData, obj, async, successCallback, param, errorCallback, count);
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
						handleError(jqXHR, textStatus, errorThrown, cirmAJAX.PUT, url, contentType, processData, obj, async, successCallback, param, errorCallback, count);
					} else {
						errorCallback(jqXHR, textStatus, errorThrown, cirmAJAX.PUT, url, contentType, processData, obj, async, successCallback, param, errorCallback, count);
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

function initCIRMMobile() {
	var params = window.location.search;
	if (params != null && params.length > 0) {
		var isSlide = ('' + window.location).indexOf('mobile.html') >= 0;
		var isBox = ('' + window.location).indexOf('box.html') >= 0;
		params = params.substring(1);
		var arr = params.split('&');
		$.each(arr, function(i, param) {
			var values = param.split('=');
			if (isSlide) {
				if (values[0] == 'experiment') {
					$('#experimentDiv').html('Experiment: ' + decodeURIComponent(values[1]));
				} else if (values[0] == 'date') {
					$('#dateDiv').html('Date: ' + decodeURIComponent(values[1]));
				} else if (values[0] == 'genotype') {
					$('#genotypeDiv').html('Sample: ' + decodeURIComponent(values[1]));
				} else if (values[0] == 'slide') {
					$('#slideDiv').html('Slide: ' + decodeURIComponent(values[1]));
				} else if (values[0] == 'img') {
					var gridDiv = $('#slideGridDiv');
					var arr = values[1].split(',');
					$.each(arr, function(i, val) {
						var div = $('<div>');
						gridDiv.append(div);
						div.addClass('ui-block-a');
						var imgDiv = $('<div>');
						div.append(imgDiv);
						imgDiv.addClass('ui-bar');
						if (i%2 == 0) {
							imgDiv.addClass('ui-bar-c');
						} else {
							imgDiv.addClass('ui-bar-d');
						}
						imgDiv.css('height', '100px');
						var image = decodeURIComponent(val);
						var img = $('<img>');
						img.attr({'alt': 'Undefined',
							'title': 'Thumbnail',
							'src': image,
							'width': 100,
							'height': 100
							});
						imgDiv.append(img);
					});
				}
			} else if (isBox) {
				if (values[0] == 'id') {
					$('#boxDiv').html('Box ID: ' + decodeURIComponent(values[1]));
				} else if (values[0] == 'date') {
					$('#dateDiv').html('Section Date: ' + decodeURIComponent(values[1]));
				} else if (values[0] == 'genotype') {
					$('#genotypeDiv').html('Sample Name: ' + decodeURIComponent(values[1]));
				} else if (values[0] == 'initials') {
					$('#initialsDiv').html('Initials: ' + decodeURIComponent(values[1]));
				} else if (values[0] == 'disambiguator') {
					$('#disambiguatorDiv').html('Disambiguator: ' + decodeURIComponent(values[1]));
				}
			}
		});
		$('.ui-block-a').css({'width': '500px'});
	}
}

function isMobileSearch() {
	var userAgent = navigator.userAgent; 
	cirm_mobile = (userAgent.indexOf('iPhone') != -1 || userAgent.indexOf('Mobile') != -1);
	return cirm_mobile && 
		((('' + window.location).indexOf('/cirm/slide') >= 0) || (('' + window.location).indexOf('/cirm/box') >= 0));
}

function initCIRM() {
	// Mozilla/5.0 (iPhone; CPU iPhone OS 7_0_3 like Mac OS X) AppleWebKit/537.51.1 (KHTML, like Gecko) Version/7.0 Mobile/11B511 Safari/9537.53
	// Mozilla/5.0 (X11; Linux x86_64; rv:17.0) Gecko/20131029 Firefox/17.0
	var params = window.location.search;
	if (cirm_mobile && params != null && params.length > 0) {
		params = params.substring(1);
		var arr = params.split('&');
		var label = null;
		$.each(arr, function(i, param) {
			var values = param.split('=');
			if (values[0] == 'id') {
				label = values[1];
				return false;
			}
		});
		if (label != null) {
			if (('' + window.location).indexOf('/cirm/slide') >= 0) {
				mobileParams = {};
				getSlide(label);
			} else if (('' + window.location).indexOf('/cirm/box') >= 0) {
				mobileParams = {};
				getBox(label);
			}
			return;
		}
	}
	getBoxes(null);
}

function mobileRequest() {
	var url = null;
	if (mobileParams['slide'] != null) {
		var slide = encodeSafeURIComponent(mobileParams['slide']['id']);
		var experiment = '';
		var experimentDate = '';
		if (mobileParams['slide']['experiment_id'] != null) {
			experiment = encodeSafeURIComponent(mobileParams['experiment']['experiment_description']);
			experimentDate = encodeSafeURIComponent(mobileParams['experiment']['experiment_date']);
		}
		var genotype = encodeSafeURIComponent(mobileParams['box']['sample_name']);
		var img = [];
		$.each(mobileParams['scans'], function(i, scan) {
			img.push(encodeSafeURIComponent('images/'+scan['thumbnail']));
		});
		url = '/cirm/mobile.html?slide='+slide+
			'&experiment='+experiment+
			'&date='+experimentDate+
			'&genotype='+genotype;
		if (img.length > 0) {
			url += '&img=' + img.join(',');
		}
	} else if (mobileParams['box'] != null) {
		var id = encodeSafeURIComponent(mobileParams['box']['id']);
		var sectionDate = encodeSafeURIComponent(mobileParams['box']['section_date']);
		var genotype = encodeSafeURIComponent(mobileParams['box']['sample_name']);
		var initials = encodeSafeURIComponent(mobileParams['box']['initials']);
		var disambiguator = encodeSafeURIComponent(mobileParams['box']['disambiguator']);
		url = '/cirm/box.html?id='+id+
		'&disambiguator='+disambiguator+
		'&date='+sectionDate+
		'&initials='+initials+
		'&genotype='+genotype;
	}
	if (url != null) {
		window.location = url;
	}
}

function getBox(id) {
	var url = ERMREST_HOME + '/box/id=' + encodeSafeURIComponent(id);
	cirmAJAX.GET(url, 'application/x-www-form-urlencoded; charset=UTF-8', true, postGetBox, {'id': id}, null, 0);
}

function postGetBox(data, textStatus, jqXHR, param) {
	mobileParams['box'] = data[0];
	submitLogout();
}

function getBoxes(id) {
	var url = ERMREST_HOME + '/box';
	if (id != null) {
		url += '/id=' + encodeSafeURIComponent(id);
	}
	cirmAJAX.GET(url, 'application/x-www-form-urlencoded; charset=UTF-8', true, postGetBoxes, {'id': id}, null, 0);
}

function postGetBoxes(data, textStatus, jqXHR, param) {
	if (mobileParams != null) {
		mobileParams['box'] = data[0];
	} else {
		boxesList = data;
		boxesDict = {};
		$.each(data, function(i, item) {
			boxesDict[item['id']] = item;
		});
	}
	
	getExperiments(mobileParams == null ? null : mobileParams.slide.experiment_id);
}

function getExperiments(id) {
	var url = ERMREST_HOME + '/experiment';
	if (id != null) {
		url += '/id=' + encodeSafeURIComponent(id);
	}
	cirmAJAX.GET(url, 'application/x-www-form-urlencoded; charset=UTF-8', true, postGetExperiments, null, null, 0);
}

function postGetExperiments(data, textStatus, jqXHR, param) {
	if (mobileParams != null) {
		mobileParams['experiment'] = data[0];
		getScans(mobileParams['slide']['id']);
	} else {
		experimentsList = data;
		experimentsDict = {};
		$.each(data, function(i, item) {
			experimentsDict[item['id']] = item;
		});
		drawPanels();
	}
}

function getUnassignedSlides() {
	var url = ERMREST_HOME + '/slide/experiment_id::null::';
	cirmAJAX.GET(url, 'application/x-www-form-urlencoded; charset=UTF-8', true, postGetUnassignedSlides, null, null, 0);
}

function postGetUnassignedSlides(data, textStatus, jqXHR, param) {
	unassignedSlidesList = data;
	unassignedSlidesDict = {};
	$.each(data, function(i, item) {
		unassignedSlidesDict[item['id']] = item;
	});
	displayUnassignedSlides();
}

function getSlide(id) {
	var url = ERMREST_HOME + '/slide/id=' + encodeSafeURIComponent(id);
	cirmAJAX.GET(url, 'application/x-www-form-urlencoded; charset=UTF-8', true, postGetSlide, null, null, 0);
}

function postGetSlide(data, textStatus, jqXHR, param) {
	mobileParams['slide'] = data[0];
	getBoxes(data[0]['box_of_origin_id']);
}

function getExperimentSlides(experimentId) {
	var url = ERMREST_HOME + '/slide/experiment_id=' + encodeSafeURIComponent(experimentId);
	cirmAJAX.GET(url, 'application/x-www-form-urlencoded; charset=UTF-8', true, postGetExperimentSlides, {'experimentId': experimentId}, null, 0);
}

function postGetExperimentSlides(data, textStatus, jqXHR, param) {
	slidesList = data;
	slidesDict = {};
	$.each(data, function(i, item) {
		slidesDict[item['id']] = item;
	});
	getExperimentScans(param['experimentId']);
}

function getExperimentScans(experimentId) {
	var url = ERMREST_HOME + '/slide/experiment_id=' + encodeSafeURIComponent(experimentId) + '/scan';
	cirmAJAX.GET(url, 'application/x-www-form-urlencoded; charset=UTF-8', true, postGetExperimentScans, null, null, 0);
}

function postGetExperimentScans(data, textStatus, jqXHR, param) {
	scansList = data;
	scansDict = {};
	$.each(data, function(i, item) {
		scansDict[item['id']] = item;
	});
	appendSlides('experiment');
	initSearchData();
	$('#search').catcomplete('option', {'source': searchData});
	selectNewSlide();
}

function getSlides(boxId) {
	var url = ERMREST_HOME + '/box/id=' + encodeSafeURIComponent(boxId) + '/slide';
	cirmAJAX.GET(url, 'application/x-www-form-urlencoded; charset=UTF-8', true, postGetSlides, {'boxId': boxId}, null, 0);
}

function postGetSlides(data, textStatus, jqXHR, param) {
	slidesList = data;
	slidesDict = {};
	$.each(data, function(i, item) {
		slidesDict[item['id']] = item;
	});
	getBoxScans(param['boxId']);
}

function getBoxScans(boxId) {
	var url = ERMREST_HOME + '/scan/id::regexp::' + encodeSafeURIComponent(boxId) + '*';
	cirmAJAX.GET(url, 'application/x-www-form-urlencoded; charset=UTF-8', true, postGetBoxScans, null, null, 0);
}

function postGetBoxScans(data, textStatus, jqXHR, param) {
	scansList = data;
	scansDict = {};
	$.each(data, function(i, item) {
		scansDict[item['id']] = item;
	});
	appendSlides('box');
	initSearchData();
	$('#search').catcomplete('option', {'source': searchData});
	selectNewSlide();
}

function renderLogin() {
	HOME = '' + window.location;
	var index = HOME.indexOf('/cirm');
	HOME = HOME.substring(0, index);
	ERMREST_HOME = HOME + ERMREST_HOME;
	WEBAUTHN_HOME = HOME + WEBAUTHN_HOME;
	PRINT_JOB_HOME = HOME + PRINT_JOB_HOME;
	PRINT_CONTROL_HOME = HOME + PRINT_CONTROL_HOME;
	ZOOMIFY_HOME = HOME + ZOOMIFY_HOME;
	if (isMobileSearch()) {
		submitMobileLogin();
		return;
	}
	var uiDiv = $('#cirm');
	uiDiv.html('');
	var logoDiv = $('<div>');
	uiDiv.append(logoDiv);
	var img = $('<img>');
	logoDiv.append(img);
	img.attr({'alt': 'USC logo',
		'src': '/cirm/images/usc-primaryshieldwordmark.png'
		});
	var h1 = $('<h1>');
	uiDiv.append(h1);
	h1.html('CIRM Log In');
	var fieldset = $('<fieldset>');
	uiDiv.append(fieldset);
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

function submitLogout() {
	if (GLOBUS_AUTHN) {
		token = $.cookie(goauth_cookie);
		if (token != null) {
			$.removeCookie(goauth_cookie);
		}
		postSubmitLogout();
	} else {
		var url = WEBAUTHN_HOME;
		cirmAJAX.DELETE(url, true, postSubmitLogout, null, errorSubmitLogout, 0);
	}
}

function postSubmitLogout(data, textStatus, jqXHR, param) {
	if (mobileParams == null) {
		window.location = window.location;
	} else {
		mobileRequest();
	}
}

function errorSubmitLogout(jqXHR, textStatus, errorThrown, retryCallback, url, contentType, processData, obj, async, successCallback, param, errorCallback, count) {
	window.location = window.location;
}

function checkSubmitLogin(event) {
	if (event.which == 13) {
		submitLogin();
	}
}

function submitMobileLogin() {
	if (GLOBUS_AUTHN) {
		submitGlobusLogin(GUEST_USER, GUEST_PASSWORD);
	} else {
		submitMobileDatabaseLogin();
	}
}

function submitMobileDatabaseLogin() {
	var url = WEBAUTHN_HOME;
	var obj = {'username': GUEST_USER,
			'password': GUEST_PASSWORD};
	cirmAJAX.POST(url, 'application/x-www-form-urlencoded; charset=UTF-8', true, obj, true, postSubmitLogin, null, null, 0);
}

function submitLogin() {
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
	cirmAJAX.POST(url, 'application/x-www-form-urlencoded; charset=UTF-8', true, obj, true, postSubmitLogin, null, null, 0);
}

function postSubmitLogin(data, textStatus, jqXHR, param) {
	// check if the login page was loaded under an i-frame
	if (window.top.location != window.location) {
		alert('An expected frame was detected. For security reasons, you are logged out.');
		document.body.style.cursor = 'default';
		return;
	}
	initCIRM();
}

function drawPanels() {
	var cirm = $('#cirm');
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
	subdiv.attr('id', 'centerPanelMiddle');
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
	selectNewBox();
	selectNewExperiment();
	$('#centerPanel').css('max-height', $('#centerPanel').css('height'));
}

function selectNewBox() {
	if (newBoxId != null) {
		$.each($('li', $('#BoxUL')), function(i, box) {
			if ($(box).html() == newBoxId) {
				$(box).click();
				return false;
			}
		});
	}
}

function selectNewExperiment() {
	if (newExperimentId != null) {
		$.each($('li', $('#ExperimentUL')), function(i, experiment) {
			if ($(experiment).html() == newExperimentId) {
				newExperimentId = null;
				$(experiment).click();
				return false;
			}
		});
	}
}

function selectNewSlide() {
	if (newSlideId != null) {
		$.each($('li', $('#SlideUL')), function(i, slide) {
			if ($(slide).html() == newSlideId) {
				newSlideId = null;
				$(slide).click();
				return false;
			}
		});
	}
}

function getEntityContent(entityList, displayName, entityName, clickFunction, createFunction) {
	var entityContent = [];
	var obj = {};
	obj['Display'] = displayName;
	obj['Name'] = entityName;
	obj['Click'] = clickFunction;
	obj['Create'] = createFunction;
	var values = [];
	var arr = [].concat(entityList);
	arr.sort(compareIds);
	$.each(arr, function(i, item) {
		values.push(item['id']);
	});
	obj['Values'] = values;
	entityContent.push(obj);
	return entityContent;
}

function initPanels() {
	initTopPanel();
	var leftPanel = $('#leftPanel');
	leftPanel.html('');
	var boxesContent = getEntityContent(boxesList, 'Boxes', 'Box', displayBox, createBox);
	loadLeftPanel(leftPanel, boxesContent);
	var experimentsContent = getEntityContent(experimentsList, 'Experiments', 'Experiment', displayExperiment, createExperiment);
	loadLeftPanel(leftPanel, experimentsContent);
	var active = (newExperimentId == null) ? 0 : 1;
	leftPanel.accordion({ 'header': 'h4',
		'heightStyle': 'content',
		'active': active});
	var rightPanel = $('#rightPanelTop');
	rightPanel.html('');
	$('#centerPanelTop').html(CIRM_START_INFO);
	var bottomPanel = $('#bottomPanel');
	initBottomPanel(bottomPanel);
}

function getSlideIdValue(slide, td, val, index) {
	var a = $('<a>');
	a.addClass('link-style banner-text');
	a.attr('href', 'javascript:displaySlide("' + slide['id'] + '")');
	a.html(index);
	td.append(a);
}

function getSlideColumnValue(slide, td, val, index) {
	var a = $('<a>');
	a.addClass('link-style banner-text');
	a.attr('href', 'javascript:displaySlide("' + slide['id'] + '")');
	a.html(val);
	td.append(a);
}

function getSlideThumbnail(slide, td, val) {
	var a = $('<a>');
	a.addClass('link-style banner-text');
	a.attr('href', 'javascript:displaySlide("' + slide['id'] + '")');
	var img = $('<img>');
	$.each(scansList, function(i, scan) {
		if (scan['id'].indexOf(slide['id']) == 0) {
			img.attr({'alt': 'Undefined',
				'title': 'Thumbnail',
				'src': 'images/'+scan['thumbnail'],
				'width': 10,
				'height': 10
				});
			return false;
		}
	});
	if (img.attr('src') == null) {
		img.attr({'alt': 'Undefined',
			'title': 'Thumbnail',
			'src': 'images/blank.jpeg',
			'width': 10,
			'height': 10
			});
	}
	a.append(img);
	td.append(a);
}

function addSlides() {
	var li = $('.highlighted', $('#leftPanel'))[0];
	var experimentId = $(li).html();
	var url = ERMREST_HOME + '/slide';
	var arr = [];
	$.each($('td', $('#unassignedSlidesTable')).find('input:checked'), function(i, checkbox) {
		var slide = unassignedSlidesDict[$(checkbox).attr('slideId')];
		var obj = new Object();
		$.each(slideColumns, function(j, col) {
			if (col == slideExperimentColumn) {
				obj[col] = experimentId;
			} else {
				obj[col] = slide[col];
			}
		});
		arr.push(obj);
	});
	cirmAJAX.PUT(url, 'application/json', false, arr, true, postAddSlides, null, null, 0);
}

function postAddSlides(data, textStatus, jqXHR, param) {
	$.each(data, function(i, item) {
		slidesList.push(item);
		slidesDict[item['id']] = item;
	});
	appendSlides('experiment');
}

function checkUncheckAll(tableId, thId, buttonId) {
	var checked = $('#' + thId).prop('checked');
	if (checked) {
		$('td', $('#' + tableId)).find('input:not(:checked)').prop('checked', true);
		$('td', $('#' + tableId)).find('input:disabled').prop('checked', false);
		$('#'+ buttonId).removeAttr('disabled');
	} else {
		$('td', $('#' + tableId)).find('input:checked').prop('checked', false);
		$('#'+ buttonId).attr('disabled', 'disabled');
	}
}

function checkAvailableSlides(tableId, thId, buttonId) {
	var count = $('td', $('#' + tableId)).find('input:checked').length;
	if (count == 0) {
		$('#' + thId).prop('checked', false);
		$('#'+ buttonId).attr('disabled', 'disabled');
	} else {
		$('#'+ buttonId).removeAttr('disabled');
		if ($('td', $('#' + tableId)).find('input:not(:checked)').length == $('td', $('#' + tableId)).find('input:disabled').length) {
			$('#' + thId).prop('checked', true);
		} else {
			$('#' + thId).prop('checked', false);
		}
	}
}

function displayUnassignedSlides() {
	var centerPanel = $('#centerPanelMiddle');
	centerPanel.html('');
	var arr = [].concat(unassignedSlidesList);
	arr.sort(compareIds);
	if (arr.length == 0) {
		centerPanel.append(CIRM_NO_UNASSIGNED_SLIDES_INFO);
	} else {
		centerPanel.append(CIRM_UNASSIGNED_SLIDES_INFO);
		var table = $('<table>');
		centerPanel.append(table);
		table.attr('id', 'unassignedSlidesTable');
		table.addClass('itemTable');
		var tr = $('<tr>');
		table.append(tr);
		var th = $('<th>');
		tr.append(th);
		var input = $('<input>');
		input.attr({'type': 'checkbox',
			'id': 'selectAllUnassignedSlidesTh'});
		input.click(function(event) {checkUncheckAll('unassignedSlidesTable', 'selectAllUnassignedSlidesTh', 'addButton');});
		th.append(input);
		$.each(slideTableColumns, function(i, col) {
			if (!slideNoDisplayColumns.contains(col)) {
				var th = $('<th>');
				tr.append(th);
				th.html(slideTableDisplayColumns[col]);
				if (slideClassColumns[col] != null) {
					th.addClass(slideClassColumns[col]);
				}
			}
		});
		$.each(arr, function(i, row) {
			var tr = $('<tr>');
			table.append(tr);
			if (i%2 == 1) {
				tr.addClass('odd');
			}
			var td = $('<td>');
			tr.append(td);
			var input = $('<input>');
			input.attr({'type': 'checkbox',
				'slideId': row['id']});
			input.click(function(event) {checkAvailableSlides('unassignedSlidesTable', 'selectAllUnassignedSlidesTh', 'addButton');});
			td.append(input);
			$.each(slideTableColumns, function(j, col) {
				if (!slideNoDisplayColumns.contains(col)) {
					var td = $('<td>');
					tr.append(td);
					if (slideDisplayValue[col] != null) {
						slideDisplayValue[col](row, td, row[col], i+1);
					} else {
						td.html(row[col]);
					}
					if (slideClassColumns[col] != null) {
						td.addClass(slideClassColumns[col]);
					}
				}
			});
		});
		$('.experiment', table).hide();
	}
	centerPanel.show();
	$('#backButton').unbind('click');
	$('#backButton').click(function(event) {appendSlides('experiment');});
	$('#backButton').show();
	$('#addButton').show();
	$('#addButton').attr('disabled', 'disabled');
	$('#addSlidesButton').hide();
	$('#printSlideButton').hide();
	$('#refreshButton').show();
	$('#centerPanelMiddle').show();
	$('#centerPanelTop').hide();
}

function appendSlides(item) {
	var centerPanel = $('#centerPanelTop');
	var arr = [].concat(slidesList);
	arr.sort(compareIds);
	if (arr.length == 0) {
		centerPanel.html(CIRM_NO_SLIDES_INFO);
	} else {
		centerPanel.html('');
		var table = $('<table>');
		centerPanel.append(table);
		table.attr('id', 'slidesTable');
		table.addClass('itemTable');
		var tr = $('<tr>');
		table.append(tr);
		var th = $('<th>');
		tr.append(th);
		var input = $('<input>');
		input.attr({'type': 'checkbox',
			'id': 'selectAllAssignedSlidesTh'});
		input.click(function(event) {checkUncheckAll('slidesTable', 'selectAllAssignedSlidesTh', 'printSlideButton');});
		th.append(input);
		$.each(slideTableColumns, function(i, col) {
			if (!slideNoDisplayColumns.contains(col)) {
				var th = $('<th>');
				tr.append(th);
				th.html(slideTableDisplayColumns[col]);
				if (slideClassColumns[col] != null) {
					th.addClass(slideClassColumns[col]);
				}
			}
		});
		$.each(arr, function(i, row) {
			var tr = $('<tr>');
			table.append(tr);
			if (i%2 == 1) {
				tr.addClass('odd');
			}
			var td = $('<td>');
			tr.append(td);
			var input = $('<input>');
			input.attr({'type': 'checkbox',
				'slideId': row['id']});
			input.click(function(event) {checkAvailableSlides('slidesTable', 'selectAllAssignedSlidesTh', 'printSlideButton');});
			td.append(input);
			if (row['experiment_id'] == null) {
				input.attr('disabled', 'disabled');
			}
			$.each(slideTableColumns, function(j, col) {
				if (!slideNoDisplayColumns.contains(col)) {
					var td = $('<td>');
					tr.append(td);
					if (slideDisplayValue[col] != null) {
						slideDisplayValue[col](row, td, row[col], i+1);
					} else {
						td.html(row[col]);
					}
					if (slideClassColumns[col] != null) {
						td.addClass(slideClassColumns[col]);
					}
				}
			});
		});
		$('.'+item, table).hide();
	}
	$('#centerPanelMiddle').hide();
	$('#centerPanelTop').show();
	if (arr.length > 0 && item == 'experiment') {
		$('#printSlideButton').show();
		$('#printSlideButton').attr('disabled', 'disabled');
	}
	$('#editButton').show();
	$('#cancelButton').hide();
	$('#saveButton').hide();
	$('#refreshButton').show();
	$('button', $('#centerPanelBottom')).hide();
	if (item == 'box') {
		$('#createSlideButton').show();
		$('#printBoxButton').show();
		if (newBoxId != null) {
			$('#createSlideButton').click();
			newBoxId = null;
		}
	}
	if (item == 'experiment') {
		$('#printBoxButton').hide();
		$('#createSlideButton').hide();
		$('#addSlidesButton').show();
		if (arr.length > 0) {
			$('#printSlideButton').show();
		}
	}
}

function initTopPanel() {
	var topPanel = $('#topPanel');
	var div = $('<div>');
	div.attr('id', 'header');
	topPanel.append(div);
	var h1 = $('<h1>');
	h1.html('CIRM Microscopy Image Viewer');
	div.append(h1);
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
	$.widget('custom.catcomplete', $.ui.autocomplete, {
		_renderMenu: function( ul, items ) {
			var that = this,
			currentCategory = '';
			$.each( items, function( index, item ) {
				if ( item.category != currentCategory ) {
					ul.append('<li class="ui-autocomplete-category">' + item.category + '</li>');
					currentCategory = item.category;
				}
				that._renderItemData( ul, item );
			});
			ul.css('z-index', Math.pow(2,32) - 1);
		}
	});
	initSearchData();
	$('#search').catcomplete({
		delay: 0,
		source: searchData,
		select: function(event, ui) {displaySearchResult(event, ui);}
	});
}

function displaySearchResult(event, ui) {
	var ul = null;
	var active = 0;
	if (ui.item.category == 'Boxes') {
		ul = $('#BoxUL');
	} else if (ui.item.category == 'Experiments') {
		ul = $('#ExperimentUL');
		active = 1;
	}
	if (ul != null) {
		$('#leftPanel').accordion('option', {'active': active});
		var label = ui.item.label;
		clickEntity(ul, label);
	}
}

function clickEntity(ul, label) {
	$.each($('li', ul), function(i, li) {
		if ($(li).html() == label) {
			$(li).click();
			return false;
		}
	});
}

function initSearchData() {
	searchData = [];
	var arr = [].concat(boxesList);
	arr.sort(compareIds);
	var value = '';
	$.each(arr, function(i, item) {
		if (item['id'] != value) {
			value = item['id'];
			searchData.push({'label': value, 'category': 'Boxes', 'item': item});
		}
	});
	var arr = [].concat(experimentsList);
	arr.sort(compareIds);
	var value = '';
	$.each(arr, function(i, item) {
		if (item['id'] != value) {
			value = item['id'];
			searchData.push({'label': value, 'category': 'Experiments', 'item': item});
		}
	});
}

function loadLeftPanel(panel, vals) {
	$.each(vals, function(i, val) {
		var h4 = $('<h4>');
		panel.append(h4);
		h4.html(val['Display']);
		var buttonImage = $('<button>').button({icons: {primary: 'ui-icon-circle-plus'},
			text: false});
		buttonImage.addClass('newEntity');
		buttonImage.click(function(event) {val['Create']();});
		buttonImage.attr('title', 'New '+val['Name']);
		buttonImage.css('width', 5);
		h4.append(buttonImage);
		var div = $('<div>');
		div.attr('id', val['Name']+'Div');
		panel.append(div);
		var ul = $('<ul>');
		div.append(ul);
		ul.addClass('left_panel');
		ul.attr('id', val['Name']+'UL');
		$.each(val['Values'], function(j, value) {
			var li = $('<li>');
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

function checkSlideSaveButton() {
	if ($('#slideRevision').val().replace(/^\s*/, "").replace(/\s*$/, "").length > 0 &&
		$('#slideSequenceNumber').val().replace(/^\s*/, "").replace(/\s*$/, "").length > 0 &&
		$('#slidesCount').val().replace(/^\s*/, "").replace(/\s*$/, "").length > 0) {
		$('#createButton').removeAttr('disabled');
	} else {
		$('#createButton').attr('disabled', 'disabled');
	}
}

function checkExperimentSaveButton() {
	if ($('#experimentDate').val().replace(/^\s*/, "").replace(/\s*$/, "").length > 0 &&
		$('#experimentRI').val().replace(/^\s*/, "").replace(/\s*$/, "").length > 0 &&
		$('#experimentDisambiguator').val().replace(/^\s*/, "").replace(/\s*$/, "").length > 0 &&
		$('#experimentDescription').val().replace(/^\s*/, "").replace(/\s*$/, "").length > 0) {
		$('#createButton').removeAttr('disabled');
	} else {
		$('#createButton').attr('disabled', 'disabled');
	}
}

function getScans(id) {
	var url = ERMREST_HOME + '/slide/id='+encodeSafeURIComponent(id)+'/scan';
	cirmAJAX.GET(url, 'application/x-www-form-urlencoded; charset=UTF-8', true, postGetScans, null, null, 0);
}

function postGetScans(data, textStatus, jqXHR, param) {
	if (mobileParams != null) {
		mobileParams['scans'] = data;
		submitLogout();
	} else {
		appendImage(data);
	}
}

function appendImage(images) {
	var item = 'box';
	if ($('.highlighted', $('#ExperimentDiv')).length > 0) {
		item = 'experiment';
	}
	var centerPanel = $('#centerPanelTop');
	if (images.length == 0) {
		centerPanel.html(CIRM_NO_SCANS_INFO);
	} else {
		centerPanel.html('');
	}
	$.each(images, function(i, image) {
		var img = $('<img>');
		img.attr({'alt': 'Undefined',
			'title': 'Thumbnail',
			'src': 'images/'+image['thumbnail'],
			'width': 100,
			'height': 100,
			'index': image['id']
			});
		centerPanel.append(img);
		img.click(function(event) {displayScan($(this), image);});
		img.dblclick(function(event) {enlargeImage($(this), image);});
	});
	$('button', $('#centerPanelBottom')).hide();
	$('#backButton').unbind('click');
	$('#backButton').click(function(event) {appendSlides(item);});
	$('#backButton').show();
	$('#printBoxButton').hide();
	$('#refreshButton').show();
	$('#editButton').show();
	$('#centerPanelMiddle').hide();
	$('#centerPanelTop').show();
}

function enlargeImage(img, image) {
	if (cirm_mobile) {
		var label = image['slide_id'];
		mobileParams = {};
		getSlide(label);
	} else {
		var tilesHTML = ZOOMIFY_HOME + image['tilesdir'].substr(0, image['tilesdir'].length-1);
		window.open(
		  tilesHTML,
		  '_blank' // <- This is what makes it open in a new window.
		);
	}
}

function displayEntity(itemType, item) {
	var updateItem = null;
	var cols = null;
	var displayCols = null;
	if (itemType == 'scan') {
		updateItem = 'updateScan';
		cols = scanColumns;
		displayCols = scanDisplayColumns;
	} else if (itemType == 'slide') {
		updateItem = 'updateSlide';
		cols = slideColumns;
		displayCols = slideDisplayColumns;
	} else if (itemType == 'box') {
		updateItem = 'updateBox';
		cols = boxColumns;
		displayCols = boxDisplayColumns;
	} else if (itemType == 'experiment') {
		updateItem = 'updateExperiment';
		cols = experimentColumns;
		displayCols = experimentDisplayColumns;
	}

	$('#editButton').unbind('click');
	$('#editButton').click(function(event) {editEntity(itemType);});
	$('#cancelButton').unbind('click');
	$('#cancelButton').click(function(event) {cancel(updateItem);});
	$('#saveButton').unbind('click');
	$('#saveButton').click(function(event) {updateEntity(itemType);});
	$('#saveButton').removeAttr('disabled');
	$('#printerButton').show();
	if (itemType == 'scan' || itemType == 'slide') {
		$('#refreshButton').show();
	}
	$('#editButton').show();
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
		dt.html(displayCols[col]+': ');
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

function displayScan(img, image) {
	displayEntity('scan', image);
	$('#backButton').unbind('click');
	$('#backButton').click(function(event) {appendSlides('box');});
	$('#backButton').show();
	$('#transferButton').unbind('click');
	$('#transferButton').click(function(event) {transferImage(image);});
	$('#transferButton').show();
	$('#enlargeButton').unbind('click');
	$('#enlargeButton').click(function(event) {enlargeImage(img, image);});
	$('#enlargeButton').show();

	$('img', $('#centerPanelTop')).removeClass('highlighted');
	img.addClass('highlighted');
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

function initCenterPanelButtons() {
	var panel = $('#centerPanelBottom');
	panel.append('<br>');
		
	var button = $('<button>');
	panel.append(button);
	button.attr('id', 'addSlidesButton');
	button.html('Add Slides');
	button.button();
	button.button({icons: {primary: 'ui-icon-cart'}}).click(function(event) {getUnassignedSlides();});

	button = $('<button>');
	panel.append(button);
	button.attr('id', 'createSlideButton');
	button.html('New Slide(s)');
	button.button({icons: {primary: 'ui-icon-newwin'}}).click(function(event) {createSlide();});

	button = $('<button>');
	panel.append(button);
	button.attr('id', 'printSlideButton');
	button.html('Print Slide(s)');
	button.button({icons: {primary: 'ui-icon-tag'}}).click(function(event) {submitPrintSlide();});

	button = $('<button>');
	panel.append(button);
	button.attr('id', 'backButton');
	button.html('Back');
	button.button({icons: {primary: 'ui-icon-arrowthick-1-w'}});

	button = $('<button>');
	panel.append(button);
	button.attr('id', 'createButton');
	button.html('Create');
	button.button({icons: {primary: 'ui-icon-document'}});

	button = $('<button>');
	panel.append(button);
	button.attr('id', 'addButton');
	button.html('Add');
	button.button();
	button.button({icons: {primary: 'ui-icon-cart'}}).click(function(event) {addSlides();});

	button = $('<button>');
	panel.append(button);
	button.attr('id', 'enlargeButton');
	button.html('Enlarge Image');
	button.button({icons: {primary: 'ui-icon-zoomin'}});

	button = $('<button>');
	panel.append(button);
	button.attr('id', 'transferButton');
	button.html('Download');
	button.button({icons: {primary: 'ui-icon-arrowthick-1-s'}});

	$('button', panel).hide();
}

function initBottomPanel(panel) {
	panel.html('');

	div = $('<div>');
	panel.append(div);
	div.attr('id', 'viterbi');
	div.html('<a href="http://viterbi.usc.edu" target="_newtab2">USC Viterbi School of Engineering</a>');

	button = $('<button>');
	panel.append(button);
	button.attr('id', 'printBoxButton');
	button.html('Print Box');
	button.button({icons: {primary: 'ui-icon-tag'}}).click(function(event) {submitPrintBox();});

	button = $('<button>');
	panel.append(button);
	button.attr('id', 'refreshButton');
	button.html('Refresh');
	button.button({icons: {primary: 'ui-icon-refresh'}}).click(function(event) {refresh();});

	button = $('<button>');
	panel.append(button);
	button.attr('id', 'clearButton');
	button.html('Clear');
	button.button({icons: {primary: 'ui-icon-arrowrefresh-1-n'}}).click(function(event) {clear();});

	button = $('<button>');
	panel.append(button);
	button.attr('id', 'printerButton');
	button.html('Printer');
	button.button({icons: {primary: 'ui-icon-print'}}).click(function(event) {printerManaging();});

	button = $('<button>');
	panel.append(button);
	button.attr('id', 'logoutButton');
	button.html('Logout');
	button.button({icons: {primary: 'ui-icon-home'}}).click(function(event) {submitLogout();});

	$('#printBoxButton').hide();
	$('#refreshButton').hide();
}

function editEntity(item) {
	var cols = null;
	if (item == 'scan') {
		cols = scanEditColumns;
	} else if (item == 'slide') {
		cols = slideEditColumns;
	} else if (item == 'box') {
		cols = boxEditColumns;
	} else if (item == 'experiment') {
		cols = experimentEditColumns;
	}
	$.each(cols, function(i, col) {
		$('#' + col + 'Input').val($('#' + col + 'Label').html());
		$('#' + col + 'Input').show();
		$('#' + col + 'Label').hide();
	});

	$('#printBoxButton').hide();
	$('#refreshButton').show();
	$('#cancelButton').show();
	$('#saveButton').show();
	$('#editButton').hide();
}

function updateEntity(item) {
	var cols = null;
	var editCols = null;
	if (item == 'scan') {
		cols = scanColumns;
		editCols = scanEditColumns;
	} else if (item == 'slide') {
		cols = slideColumns;
		editCols = slideEditColumns;
	} else if (item == 'box') {
		cols = boxColumns;
		editCols = boxEditColumns;
	} else if (item == 'experiment') {
		cols = experimentColumns;
		editCols = experimentEditColumns;
	}

	var url = ERMREST_HOME + '/' + item + '/id=' + encodeSafeURIComponent($('#idLabel').html());
	var arr = [];
	var obj = new Object();
	$.each(cols, function(i, col) {
		if (editCols.contains(col)) {
			obj[col] = $('#' + col + 'Input').val();
		} else {
			obj[col] = $('#' + col + 'Label').html();
		}
		if (obj[col] == '') {
			delete obj[col];
		}
	});
	arr.push(obj);
	cirmAJAX.PUT(url, 'application/json', false, arr, true, postUpdateEntity, {'item': item}, null, 0);
}

function postUpdateEntity(data, textStatus, jqXHR, param) {
	var item = param['item'];
	var colDict = null;
	var colList = null;
	var cols = null;
	var displayCols = null;
	if (item == 'scan') {
		colDict = scansDict;
		colList = scansList;
		cols = scanColumns;
		displayCols = scanDisplayColumns;
	} else if (item == 'slide') {
		colDict = slidesDict;
		colList = slidesList;
		cols = slideColumns;
		displayCols = slideDisplayColumns;
	} else if (item == 'box') {
		colDict = boxesDict;
		colList = boxesList;
		cols = boxColumns;
		displayCols = boxDisplayColumns;
	} else if (item == 'experiment') {
		colDict = experimentsDict;
		colList = experimentsList;
		cols = experimentColumns;
		displayCols = experimentDisplayColumns;
	}

	data = data[0];
	colDict[data['id']] = data;
	var temp = [];
	$.each(colList, function(i, col) {
		if (col['id'] != data['id']) {
			temp.push(col);
		} else {
			temp.push(data);
		}
	});
	colList = temp;
	displayEntity(item, data);
	$('#printBoxButton').hide();
	$('#refreshButton').show();
	if (item == 'scan') {
		$('#transferButton').show();
		$('#enlargeButton').show();
	} else if (item == 'box') {
		$('#printBoxButton').show();
	}
	initSearchData();
	$('#search').catcomplete('option', {'source': searchData});
}

function refresh() {
	var li = $('.highlighted', $('#leftPanel'))[0];
	if (li != null) {
		$(li).click();
	}
}

function cancel(item) {
	if (item == 'createBox' || item == 'createExperiment') {
		$('#centerPanelTop').html(CIRM_START_INFO);
		$('li', $('#leftPanel')).removeClass('highlighted');
		$('#centerPanelMiddle').hide();
		$('#centerPanelTop').show();
	} else if (item == 'createSlide' || item == 'printSlide') {
		$($('.highlighted', $('#BoxDiv'))[0]).click();
	} else if (item == 'addSlides') {
		$($('.highlighted', $('#ExperimentDiv'))[0]).click();
	} else if (item == 'updateBox' || item == 'updateExperiment' || item == 'updateSlide' || item == 'updateScan') {
		$('input', $('#rightPanelTop')).hide();
		$('dd', $('#rightPanelTop')).show();
		$('#editButton').show();
		$('#cancelButton').hide();
		$('#saveButton').hide();
	}
}

function transferImage(image) {
	var czi = 'http://lonestar.isi.edu/~schuler/' + image['filename'];
	window.open(
	  czi,
	  '_blank' // <- This is what makes it open in a new window.
	);
}

function clear() {
	$('li', $('#leftPanel')).removeClass('highlighted');
	$('#rightPanelTop').html('');
	$('#centerPanelTop').html(CIRM_START_INFO);
	$('#printBoxButton').hide();
	$('#refreshButton').hide();
	$('button', $('#centerPanelBottom')).hide();
	$('button', $('#rightPanelBottom')).hide();
	$('#search').val('');
	$('#SlideDiv').remove();
	$('#centerPanelMiddle').hide();
	$('#centerPanelTop').show();
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
	return ret;
	$.each("~!()'", function(i, c) {
		ret = ret.replace(new RegExp('\\' + c, 'g'), escape(c));
	});
	return ret;
}

function createSlide() {
	var centerPanel = $('#centerPanelTop');
	centerPanel.html('<p class="intro">New Slide(s)</p>');
	centerPanel.show();
	var table = $('<table>');
	centerPanel.append(table);
	table.addClass('define_entity');

	var tr = $('<tr>');
	table.append(tr);

	var tr = $('<tr>');
	table.append(tr);
	var td = $('<td>');
	tr.append(td);
	td.addClass('tag');
	td.html('Sequence Number:');
	var td = $('<td>');
	tr.append(td);
	var input = $('<input>');
	input.attr({'id': 'slideSequenceNumber',
		'type': 'text'});
	td.append(input);
	input.keyup(function(event) {checkSlideSaveButton();});
	input.val('1');

	var tr = $('<tr>');
	table.append(tr);
	var td = $('<td>');
	tr.append(td);
	td.addClass('tag');
	td.html('Revision:');
	var td = $('<td>');
	tr.append(td);
	var input = $('<input>');
	input.attr({'id': 'slideRevision',
		'type': 'text'});
	td.append(input);
	input.keyup(function(event) {checkSlideSaveButton();});
	input.val('0');

	var tr = $('<tr>');
	table.append(tr);
	var td = $('<td>');
	tr.append(td);
	td.addClass('tag');
	td.html('Comment:');
	var td = $('<td>');
	tr.append(td);
	var input = $('<input>');
	input.attr({'id': 'slideComment',
		'type': 'text'});
	td.append(input);

	var tr = $('<tr>');
	table.append(tr);
	var td = $('<td>');
	tr.append(td);
	td.addClass('tag');
	td.html('Number of Slides:');
	var td = $('<td>');
	tr.append(td);
	var input = $('<input>');
	input.attr({'id': 'slidesCount',
		'type': 'text'});
	td.append(input);
	input.keyup(function(event) {checkSlideSaveButton();});
	input.val(1);

	$('#createSlideButton').hide();
	$('#createButton').unbind('click');
	$('#createButton').click(function(event) {saveSlide();});
	$('#createButton').show();
	$('#backButton').unbind('click');
	$('#backButton').click(function(event) {appendSlides('box');});
	$('#backButton').show();
	$('#centerPanelMiddle').hide();
	$('#centerPanelTop').show();
}

function printerManaging() {
	var centerPanel = $('#centerPanelTop');
	centerPanel.html('<p class="intro">Printer Administration</p>');
	var printTable = $('<table>');
	centerPanel.append(printTable);
	printTable.addClass('radio_entity itemTable');
	printTable.attr({'align': 'center',
		'id': 'printerAdminTable'});
	var tr = $('<tr>');
	printTable.append(tr);
	var td = $('<td>');
	tr.append(td);
	var a = $('<a>');
	a.addClass('link-style banner-text');
	a.attr('href', 'javascript:printerSettings()');
	a.html('Printer Setting');
	td.append(a);
	
	var tr = $('<tr>');
	printTable.append(tr);
	var td = $('<td>');
	tr.append(td);
	var a = $('<a>');
	a.addClass('link-style banner-text');
	a.attr('href', 'javascript:managePrinter("checkConnection")');
	a.html('Check Connection');
	td.append(a);
	
	var tr = $('<tr>');
	printTable.append(tr);
	var td = $('<td>');
	tr.append(td);
	var a = $('<a>');
	a.addClass('link-style banner-text');
	a.attr('href', 'javascript:managePrinter("getStatus")');
	a.html('Get Status');
	td.append(a);
	
	/*
	var tr = $('<tr>');
	printTable.append(tr);
	var td = $('<td>');
	tr.append(td);
	var a = $('<a>');
	a.addClass('link-style banner-text');
	a.attr('href', 'javascript:managePrinter("getConfiguration")');
	a.html('Get Configuration');
	td.append(a);
	
	var tr = $('<tr>');
	printTable.append(tr);
	var td = $('<td>');
	tr.append(td);
	var a = $('<a>');
	a.addClass('link-style banner-text');
	a.attr('href', 'javascript:managePrinter("resetPrinter")');
	a.html('Reset Printer');
	td.append(a);
	
	var tr = $('<tr>');
	printTable.append(tr);
	var td = $('<td>');
	tr.append(td);
	var a = $('<a>');
	a.addClass('link-style banner-text');
	a.attr('href', 'javascript:managePrinter("calibratePrinter")');
	a.html('Calibrate Printer');
	td.append(a);
	
	var tr = $('<tr>');
	printTable.append(tr);
	var td = $('<td>');
	tr.append(td);
	var a = $('<a>');
	a.addClass('link-style banner-text');
	a.attr('href', 'javascript:managePrinter("forcePowerCycle")');
	a.html('Force Power Cycle');
	td.append(a);
	
	var tr = $('<tr>');
	printTable.append(tr);
	var td = $('<td>');
	tr.append(td);
	var a = $('<a>');
	a.addClass('link-style banner-text');
	a.attr('href', 'javascript:managePrinter("shiftUp")');
	a.html('Shift Up');
	td.append(a);
	
	var tr = $('<tr>');
	printTable.append(tr);
	var td = $('<td>');
	tr.append(td);
	var a = $('<a>');
	a.addClass('link-style banner-text');
	a.attr('href', 'javascript:managePrinter("shiftDown")');
	a.html('Shift Down');
	td.append(a);
	
	var tr = $('<tr>');
	printTable.append(tr);
	var td = $('<td>');
	tr.append(td);
	var a = $('<a>');
	a.addClass('link-style banner-text');
	a.attr('href', 'javascript:managePrinter("shiftLeft")');
	a.html('Shift Left');
	td.append(a);
	
	var tr = $('<tr>');
	printTable.append(tr);
	var td = $('<td>');
	tr.append(td);
	var a = $('<a>');
	a.addClass('link-style banner-text');
	a.attr('href', 'javascript:managePrinter("shiftRight")');
	a.html('Shift Right');
	td.append(a);
	
	var tr = $('<tr>');
	printTable.append(tr);
	var td = $('<td>');
	tr.append(td);
	var a = $('<a>');
	a.addClass('link-style banner-text');
	a.attr('href', 'javascript:managePrinter("testPrinter")');
	a.html('Test Printer');
	td.append(a);
	*/
	
	$('button', $('#centerPanelBottom')).hide();
	$('#printBoxButton').hide();
	$('#refreshButton').hide();
	$('#centerPanelMiddle').hide();
	$('#centerPanelTop').show();
}

function printerSettings() {
	var rightPanel = $('#rightPanelTop');
	rightPanel.html('');
	var dl = $('<dl>');
	rightPanel.append(dl);
	var dt = $('<dt>');
	dl.append(dt);
	dt.addClass('info');
	dt.html('Address: ');
	var span = $('<span>');
	dl.append(span);
	var input = $('<input>');
	input.attr({'type': 'text',
		'id': 'printerAddrInput',
		'size': 30});
	span.append(input);
	input.val(PRINTER_ADDR);
	
	var dl = $('<dl>');
	rightPanel.append(dl);
	var dt = $('<dt>');
	dl.append(dt);
	dt.addClass('info');
	dt.html('Port: ');
	var span = $('<span>');
	dl.append(span);
	var input = $('<input>');
	input.attr({'type': 'text',
		'id': 'printerPortInput',
		'size': 30});
	span.append(input);
	input.val(PRINTER_PORT);
	
	$('#cancelButton').unbind('click');
	$('#cancelButton').click(function(event) {cancelPrinterSettings();});
	$('#saveButton').unbind('click');
	$('#saveButton').click(function(event) {updatePrinterSettings();});
	$('#saveButton').removeAttr('disabled');
	$('#cancelButton').show();
	$('#saveButton').show();
	$('#editButton').hide();
	$('#printBoxButton').hide();
	$('#refreshButton').hide();
}

function updatePrinterSettings() {
	PRINTER_ADDR = $('#printerAddrInput').val();
	PRINTER_PORT = parseInt($('#printerPortInput').val());
	cancelPrinterSettings();
}

function cancelPrinterSettings() {
	var rightPanel = $('#rightPanelTop');
	rightPanel.html('');
	$('button', $('#rightPanelBottom')).hide();
	$('#printBoxButton').hide();
	$('#refreshButton').hide();
}

function managePrinter(param) {
	var url = PRINT_CONTROL_HOME + 'id/control/' + encodeSafeURIComponent(param) + '/';
	var arr = [];
	var obj = new Object();
	obj['printer_id'] = PRINTER_ADDR;
	obj['printer_port'] = PRINTER_PORT;
	arr.push(obj);
	if (param == 'getStatus' || param == 'getConfiguration') {
		cirmAJAX.fetch(url, 'application/x-www-form-urlencoded; charset=UTF-8', true, obj, true, postManagePrinter, {'param': param}, null, 0);
	} else {
		cirmAJAX.PUT(url, 'application/json', false, arr, true, postManagePrinter, {'param': param}, null, 0);
	}
}

function postManagePrinter(data, textStatus, jqXHR, param) {
	data = data[0];
	if (data[CXI_RET] <= 0) {
		alert('An error was reported in sending the request for "' + param['param'] + '".\nReason: '+data[CXI_MSG]);
	} else {
		alert('The request for "' + param['param'] + '" was send successfully.\nResult: '+data[CXI_MSG]);
	}
}

function createExperiment() {
	$('#rightPanelTop').html('');
	$('button', $('#rightPanelBottom')).hide();
	var centerPanel = $('#centerPanelTop');
	centerPanel.html('');
	centerPanel.append(CIRM_NEW_EXPERIMENT);
	centerPanel.show();
	var table = $('<table>');
	centerPanel.append(table);
	table.addClass('define_entity');

	var tr = $('<tr>');
	table.append(tr);
	var td = $('<td>');
	tr.append(td);
	td.addClass('tag');
	td.html('Experiment Date:');
	var td = $('<td>');
	tr.append(td);
	var input = $('<input>');
	input.attr({'id': 'experimentDate',
		'type': 'text'});
	input.addClass('datepicker');
	td.append(input);
	$('.datepicker').datetimepicker({	dateFormat: 'yy-mm-dd',
		timeFormat: '',
		separator: '',
		changeYear: true,
		showTime: false,
		showHour: false,
		showMinute: false
	});
	input.change(function(event) {checkExperimentSaveButton();});

	var tr = $('<tr>');
	table.append(tr);
	var td = $('<td>');
	tr.append(td);
	td.addClass('tag');
	td.html('Experiment Description:');
	var td = $('<td>');
	tr.append(td);
	var input = $('<input>');
	input.attr({'id': 'experimentDescription',
		'maxlength': '15',
		'type': 'text'});
	td.append(input);
	input.keyup(function(event) {checkExperimentSaveButton();});

	var tr = $('<tr>');
	table.append(tr);
	var td = $('<td>');
	tr.append(td);
	td.addClass('tag');
	td.html('Initials:');
	var td = $('<td>');
	tr.append(td);
	var input = $('<input>');
	input.attr({'id': 'experimentRI',
		'maxlength': '3',
		'type': 'text'});
	td.append(input);
	input.keyup(function(event) {checkExperimentSaveButton();});

	var tr = $('<tr>');
	table.append(tr);
	var td = $('<td>');
	tr.append(td);
	td.addClass('tag');
	td.html('Disambiguator:');
	var td = $('<td>');
	tr.append(td);
	var input = $('<input>');
	input.attr({'id': 'experimentDisambiguator',
		'maxlength': '1',
		'type': 'text'});
	td.append(input);
	input.keyup(function(event) {checkExperimentSaveButton();});

	var tr = $('<tr>');
	table.append(tr);
	var td = $('<td>');
	tr.append(td);
	td.addClass('tag');
	td.html('Comment:');
	var td = $('<td>');
	tr.append(td);
	var input = $('<input>');
	input.attr({'id': 'experimentComment',
		'type': 'text'});
	td.append(input);

	$('button', $('#centerPanelBottom')).hide();
	$('#createButton').unbind('click');
	$('#createButton').click(function(event) {saveExperiment();});
	$('#createButton').show();
	$('#createButton').attr('disabled', 'disabled');
	$('#backButton').unbind('click');
	$('#backButton').click(function(event) {clear();});
	$('#backButton').show();
	$('#printBoxButton').hide();
	$('#refreshButton').hide();
	$('#centerPanelMiddle').hide();
	$('#centerPanelTop').show();
}

function displaySlide(id) {
	var item = slidesDict[id];
	if (item == null) {
		item = unassignedSlidesDict[id];
	}
	displayEntity('slide', item);
	getScans(id);
}

function displayBox(ul, li) {
	$('li', $('#leftPanel')).removeClass('highlighted');
	li.addClass('highlighted');
	$('#clearButton').show();
	displayEntity('box', boxesDict[li.html()]);
	getSlides(li.html());
}

function displayExperiment(ul, li) {
	$('li', $('#leftPanel')).removeClass('highlighted');
	li.addClass('highlighted');
	$('#clearButton').show();
	displayEntity('experiment', experimentsDict[li.html()]);
	getExperimentSlides(li.html());
}

function checkBoxSaveButton() {
	if ($('#boxDate').val().replace(/^\s*/, "").replace(/\s*$/, "").length > 0 &&
		$('#boxGenotype').val().replace(/^\s*/, "").replace(/\s*$/, "").length > 0 &&
		$('#boxRI').val().replace(/^\s*/, "").replace(/\s*$/, "").length > 0 &&
		$('#boxDisambiguator').val().replace(/^\s*/, "").replace(/\s*$/, "").length > 0) {
		$('#createButton').removeAttr('disabled');
	} else {
		$('#createButton').attr('disabled', 'disabled');
	}
}

function createBox() {
	$('li', $('#leftPanel')).removeClass('highlighted');
	$('#rightPanelTop').html('');
	$('button', $('#rightPanelBottom')).hide();
	var centerPanel = $('#centerPanelTop');
	centerPanel.html('');
	centerPanel.append(CIRM_NEW_BOX);
	centerPanel.show();
	var table = $('<table>');
	centerPanel.append(table);
	table.addClass('define_entity');

	var tr = $('<tr>');
	table.append(tr);
	var td = $('<td>');
	tr.append(td);
	td.addClass('tag');
	td.html('Section Date:');
	var td = $('<td>');
	tr.append(td);
	var input = $('<input>');
	input.attr({'id': 'boxDate',
		'type': 'text'});
	input.addClass('datepicker');
	td.append(input);
	$('.datepicker').datetimepicker({	dateFormat: 'yy-mm-dd',
		timeFormat: '',
		separator: '',
		changeYear: true,
		showTime: false,
		showHour: false,
		showMinute: false
	});
	input.change(function(event) {checkBoxSaveButton();});

	var tr = $('<tr>');
	table.append(tr);
	var td = $('<td>');
	tr.append(td);
	td.addClass('tag');
	td.html('Sample Name (Genotype):');
	var td = $('<td>');
	tr.append(td);
	var input = $('<input>');
	input.attr({'id': 'boxGenotype',
		'maxlength': '15',
		'type': 'text'});
	td.append(input);
	input.keyup(function(event) {checkBoxSaveButton();});

	var tr = $('<tr>');
	table.append(tr);
	var td = $('<td>');
	tr.append(td);
	td.addClass('tag');
	td.html('Researcher Initials:');
	var td = $('<td>');
	tr.append(td);
	var input = $('<input>');
	input.attr({'id': 'boxRI',
		'maxlength': '3',
		'type': 'text'});
	td.append(input);
	input.keyup(function(event) {checkBoxSaveButton();});

	var tr = $('<tr>');
	table.append(tr);
	var td = $('<td>');
	tr.append(td);
	td.addClass('tag');
	td.html('Disambiguator:');
	var td = $('<td>');
	tr.append(td);
	var input = $('<input>');
	input.attr({'id': 'boxDisambiguator',
		'maxlength': '1',
		'type': 'text'});
	td.append(input);
	input.keyup(function(event) {checkBoxSaveButton();});

	var tr = $('<tr>');
	table.append(tr);
	var td = $('<td>');
	tr.append(td);
	td.addClass('tag');
	td.html('Comment:');
	var td = $('<td>');
	tr.append(td);
	var input = $('<input>');
	input.attr({'id': 'boxComment',
		'type': 'text'});
	td.append(input);

	$('button', $('#centerPanelBottom')).hide();
	$('#backButton').unbind('click');
	$('#backButton').click(function(event) {clear();});
	$('#backButton').show();
	$('#createButton').unbind('click');
	$('#createButton').click(function(event) {saveBox();});
	$('#createButton').show();
	$('#createButton').attr('disabled', 'disabled');
	$('#printBoxButton').hide();
	$('#refreshButton').hide();
	$('#centerPanelMiddle').hide();
	$('#centerPanelTop').show();
}

function saveBox() {
	var boxDate = $('#boxDate').val().split('-').join('');
	var url = ERMREST_HOME + '/box';
	var arr = [];
	var obj = new Object();
	obj['section_date'] = $('#boxDate').val();
	obj['sample_name'] = $('#boxGenotype').val();
	obj['initials'] = $('#boxRI').val();
	obj['disambiguator'] = $('#boxDisambiguator').val();
	obj['comment'] = $('#boxComment').val();
	var id = [boxDate, $('#boxGenotype').val(), $('#boxRI').val(), $('#boxDisambiguator').val()].join('-');
	obj['id'] = id;
	arr.push(obj);
	cirmAJAX.POST(url, 'application/json', false, arr, true, postSaveBox, null, null, 0);
}

function postSaveBox(data, textStatus, jqXHR, param) {
	data = $.parseJSON(data);
	newBoxId = data[0]['id'];
	getBoxes(null);
}

function saveExperiment() {
	var url = ERMREST_HOME + '/experiment';
	var arr = [];
	var obj = new Object();
	obj['experiment_date'] = $('#experimentDate').val();
	obj['experiment_description'] = $('#experimentDescription').val();
	obj['initials'] = $('#experimentRI').val();
	obj['disambiguator'] = $('#experimentDisambiguator').val();
	obj['comment'] = $('#experimentComment').val();
	var experimentDate = $('#experimentDate').val().split('-').join('');
	var id = [experimentDate, $('#experimentDescription').val(), $('#experimentRI').val(), $('#experimentDisambiguator').val()].join('-');
	obj['id'] = id;
	arr.push(obj);
	cirmAJAX.POST(url, 'application/json', false, arr, true, postSaveExperiment, null, null, 0);
}

function postSaveExperiment(data, textStatus, jqXHR, param) {
	data = $.parseJSON(data);
	newExperimentId = data[0]['id'];
	getBoxes(null);
}

function saveSlide() {
	var slidesCount = parseInt($('#slidesCount').val());
	var sequence_num = parseInt($('#slideSequenceNumber').val());
	var revision = parseInt($('#slideRevision').val());
	if (isNaN(slidesCount) || slidesCount < 1) {
		alert('Invalid value for the Number of Slides: "' + $('#slidesCount').val() + '".');
		return;
	} else if (isNaN(sequence_num)) {
		alert('Invalid value for the Sequence Number: "' + $('#slideSequenceNumber').val() + '".');
		return;
	} else if (isNaN(revision)) {
			alert('Invalid value for the Revision: "' + $('#slideRevision').val() + '".');
			return;
	}
	var id = $($('.highlighted', $('#BoxDiv'))[0]).html();
	var url = ERMREST_HOME + '/slide';
	var arr = [];
	for (var i=0; i < slidesCount; i++) {
		var obj = new Object();
		obj['box_of_origin_id'] = id;
		obj['sequence_num'] = sequence_num;
		obj['revision'] = $('#slideRevision').val();
		obj['comment'] = $('#slideComment').val();
		var slideRevision = '' + $('#slideRevision').val();
		while (slideRevision.length < 3) {
			slideRevision = '0' + slideRevision;
		}
		var slideSequenceNumber = '' + sequence_num++;
		while (slideSequenceNumber.length < 2) {
			slideSequenceNumber = '0' + slideSequenceNumber;
		}
		var slideId = [id, slideSequenceNumber, slideRevision].join('-');
		obj['id'] = slideId;
		arr.push(obj);
	}
//alert(JSON.stringify(arr));
	cirmAJAX.POST(url, 'application/json', false, arr, true, postSaveSlide, null, null, 0);
}

function postSaveSlide(data, textStatus, jqXHR, param) {
	data = $.parseJSON(data);
	$.each(data, function(i, item) {
		slidesList.push(item);
		slidesDict[item['id']] = item;
	});
	appendSlides('box');
}

function submitPrintSlide() {
	var url = PRINT_JOB_HOME + 'slide/job';
	var arr = [];
	$.each($('td', $('#slidesTable')).find('input:checked'), function(i, checkbox) {
		var slide = slidesDict[$(checkbox).attr('slideId')];
		var box = boxesDict[slide['box_of_origin_id']];
		var experiment = experimentsDict[slide['experiment_id']];
		var obj = new Object();
		obj['revision'] = slide['revision'];
		obj['sequence_num'] = slide['sequence_num'];
		obj['experiment'] = slide['experiment_id'];
		obj['experiment_date'] = experiment['experiment_date'];
		obj['sample_name'] = box['sample_name'];
		obj['experiment_description'] = experiment['experiment_description'];
		obj['initials'] = experiment['initials'];
		obj['id'] = slide['id'];
		obj['printer_id'] = PRINTER_ADDR;
		obj['printer_port'] = PRINTER_PORT;
		arr.push(obj);
	});
	cirmAJAX.POST(url, 'application/json', false, arr, true, postSubmitPrintSlide, null, null, 0);
}

function postSubmitPrintSlide(data, textStatus, jqXHR, param) {
	data = $.parseJSON(data)[0];
	if (data[CXI_RET] <= 0) {
		alert('An error was reported in sending the request for printing the slide label(s).\nReason: '+data[CXI_MSG]);
	} else {
		alert('The request for printing the slide label(s) was submitted successfully.');
	}
}

function submitPrintBox() {
	var url = PRINT_JOB_HOME + 'box/job';
	var arr = [];
	var box = boxesDict[$($('.highlighted', $('#BoxDiv'))[0]).html()];
	var obj = {};
	$.each(boxColumns, function(i, col) {
		obj[col] = box[col];
	});
	obj['printer_id'] = PRINTER_ADDR;
	obj['printer_port'] = PRINTER_PORT;
	arr.push(obj);
	cirmAJAX.POST(url, 'application/json', false, arr, true, postSubmitPrintBox, null, null, 0);
}

function postSubmitPrintBox(data, textStatus, jqXHR, param) {
	data = $.parseJSON(data)[0];
	if (data[CXI_RET] <= 0) {
		alert('An error was reported in sending the request for printing the box label.\nReason: '+data[CXI_MSG]);
	} else {
		alert('The request for printing the box label was submitted successfully.');
	}
}

