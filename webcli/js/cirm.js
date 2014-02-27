Array.prototype.contains = function (elem) {
	for (i in this) {
		if (this[i] == elem) return true;
	}
	return false;
};

var debug = false;
var selectedEndpoint = null;
var endpointPath = [];

var ENDPOINT_SOURCE='isidev#cirm-files';
var TILES_DIR='/';
var CXI_RET='Return value';
var CXI_MSG='Return Message';
var MOBILE_AUTHENTICATE = true;
var GUEST_USER = '********';
var GUEST_PASSWORD = '********';
var GLOBUS_AUTHN = true;
var SLIDE_PRINTER_ADDR = 'mycxi.isi.edu';
var SLIDE_PRINTER_PORT = 9100;
var BOX_PRINTER_ADDR = 'mycxilabel.isi.edu';
var BOX_PRINTER_PORT = 9100;
var PRINTER_ADDR = null;
var PRINTER_PORT = 0;
var HOME;
var CIRM_HOME;
var PAGE_URL = null;
var USER;
var ERMREST_HOME = '/ermrest/catalog/1/entity';
var WEBAUTHN_HOME = '/ermrest/authn/session';
var PRINTER_HOME = '/ermrest/printer/';
var GLOBUS_TRANSFER_HOME = '/ermrest/transfer';
var ZOOMIFY_HOME = '/ermrest/zoomify/';
var DOWNLOAD_HOME = '/cirm-files/';
var SERVICE_TRANSFER_HOME = '/service/transfer/';
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
var newSearchKeywords = null;

var goauth_cookie = 'globusonline-goauth';
var token = null;

var URL_ESCAPE = new String("~!()'");

var globusTasksTableColumns = ['label', 'task_id', 'status', 'source_endpoint', 'destination_endpoint', 'request_time', 'completion_time', 'bytes_transferred'];
var globusTasksTableDisplayColumns = {'label': 'Label', 'task_id': 'Task ID', 'status': 'Status', 'source_endpoint': 'Source', 'destination_endpoint': 'Destination', 'request_time': 'Requested', 'completion_time': 'Completed', 'bytes_transferred': 'Bytes Transferred'};
var globusTasksDisplayValue = {'task_id': getTaskIdValues};

var filesTableColumns = ['thumbnail', 'filename', 'tilesdir'];
var filesTableDisplayColumns = {'thumbnail': 'Thumbnail', 'filename': 'File Name', 'tilesdir': 'Tiles Directory'};
var fileDisplayValue = {'thumbnail': getFileThumbnail};
var filesDict = {};

var boxColumns = ['id', 'section_date', 'sample_name', 'initials', 'disambiguator', 'comment', 'tags'];
var boxEditColumns = ['comment', 'tags'];
var boxMultiValuesColumns = ['tags'];
var boxDisplayColumns = {'id': 'Box ID', 'section_date': 'Section Date', 'sample_name': 'Sample Name', 'initials': 'Initials', 'disambiguator': 'Disambiguator', 'comment': 'Comment', 'tags': 'Tags'};
var boxesDict = {};
var boxesList = [];
// {"id":"20131108-wnt1creZEGG-RES-0","section_date":"2013-11-08","sample_name":"wnt1creZEGG","initials":"RES","disambiguator":"0","comment":"This is a box of origin"}

var experimentColumns = ['id', 'experiment_date', 'experiment_description', 'initials', 'disambiguator', 'comment', 'tags'];
var experimentEditColumns = ['comment', 'tags'];
var experimentMultiValuesColumns = ['tags'];
var experimentDisplayColumns = {'id': 'Experiment ID', 'experiment_date': 'Experiment Date', 'experiment_description': 'Experiment Description', 'initials': 'Initials', 'disambiguator': 'Disambiguator', 'comment': 'Comment', 'tags': 'Tags'};
var experimentsDict = {};
var experimentsList = [];
// {"id":"20131115-myantibody2-KC-0","experiment_date":"2013-11-15","experiment_description":"myantibody2","initials":"KC","disambiguator":"0","comment":"This is Karl's experiment"}

var slideNoDisplayColumns = ['id'];
var slideClassColumns = {'box_of_origin_id': 'box', 'experiment_id': 'experiment'};
var slideTableColumns = ['id', 'thumbnail', 'sequence_num', 'revision', 'box_of_origin_id', 'experiment_id', 'comment', 'tags'];
var slideTableDisplayColumns = {'thumbnail': 'Thumbnail', 'sequence_num': 'Seq.', 'revision': 'Rev.', 'box_of_origin_id': 'Box ID', 'experiment_id': 'Experiment ID', 'comment': 'Comment', 'tags': 'Tags'};
var slideDisplayValue = {'id': getSlideIdValue, 'sequence_num': getSlideColumnValue, 'revision': getSlideColumnValue, 'box_of_origin_id': getSlideBoxValue, 'experiment_id': getSlideExperimentValue, 'comment': getSlideColumnValue, 'tags': getSlideColumnValue, 'thumbnail': getSlideThumbnail};

var slideColumns = ['id', 'box_of_origin_id', 'sequence_num', 'revision', 'experiment_id', 'comment', 'tags'];
var slideDisplayColumns = {'id': 'Slide ID', 'box_of_origin_id': 'Box ID', 'sequence_num': 'Sequence Number', 'revision': 'Revision', 'experiment_id': 'Experiment ID', 'comment': 'Comment', 'tags': 'Tags'};
var slideEditColumns = ['comment', 'tags'];
var slideMultiValuesColumns = ['tags'];
var slideExperimentColumn = 'experiment_id';
var slidesDict = {};
var slidesList = [];
//{"id":"20131108-wnt1creZEGG-RES-0-09-000","sequence_num":9,"revision":0,"box_of_origin_id":"20131108-wnt1creZEGG-RES-0","experiment_id":"20131115-myantibody2-KC-0","comment":"This is a slide"}
var unassignedSlidesDict = {};
var unassignedSlidesList = [];
//{"id":"20131108-wnt1creZEGG-RES-0-09-000","sequence_num":9,"revision":0,"box_of_origin_id":"20131108-wnt1creZEGG-RES-0","experiment_id":null,"comment":"This is a slide"}

var scanColumns = ['id', 'slide_id', 'scan_num', 'filename', 'thumbnail', 'tilesdir', 'comment', 'tags'];
var scanEditColumns = ['comment', 'tags'];
var scanMultiValuesColumns = ['tags'];
var scanDisplayColumns = {'id': 'Scan ID', 'slide_id': 'Slide ID', 'scan_num': 'Scan Number', 'filename': 'File', 'thumbnail': 'Thumbnail', 'tilesdir': 'Tile Directory', 'comment': 'Comment', 'tags': 'Tags'};
var scansDict = {};
var scansList = [];
// {"id":"20131108-wnt1creZEGG-RES-0-38-001-000","slide_id":"20131108-wnt1creZEGG-RES-0-38-001","scan_num":0,"filename":"20131108-wnt1creZEGG-RES-0-38-001.czi","thumbnail":"20131108-wnt1creZEGG-RES-0-38-001.jpeg","tilesdir":"20131108-wnt1creZEGG-RES-0-38-001/","comment":"This is a scan"}

var searchList = [];
var isSlidePrinter = false;

var entityStack = [];
var timestampsColumns = ['completion_time', 'deadline', 'request_time']

var viewsList = ['Transfer', 'Printers'];

var containerLayout = null;

var lastSearchValue = '';

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
		var responseText = jqXHR.responseText;
		if (!debug && responseText != null) {
			try {
				responseText = $.parseJSON(responseText);
				if (responseText['message'] != null) {
					msg = responseText['message'];
				} else {
					msg = jqXHR.responseText;
				}
			} catch (err) {
				msg = jqXHR.responseText;
			}
		} else {
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
		}
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
	window.onpopstate = function(event) {
		goBack(event);
	};
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
	if (data.length == 0) {
		alert('Box not found.');
		submitLogout();
		return;
	}
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
		if (PAGE_URL == null) {
			pushHistoryState('drawPanels', '', '', null);
		}
		drawPanels();
		if (PAGE_URL != null) {
			initPage();
		}
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
	if (data.length == 0) {
		alert('Slide not found.');
		submitLogout();
		return;
	}
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
	cirmAJAX.GET(url, 'application/x-www-form-urlencoded; charset=UTF-8', true, postGetExperimentScans, {'id': experimentId}, null, 0);
}

function postGetExperimentScans(data, textStatus, jqXHR, param) {
	scansList = data;
	scansDict = {};
	$.each(data, function(i, item) {
		scansDict[item['id']] = item;
	});
	pushHistoryState('experiment', '', 'query=experiment&id='+encodeSafeURIComponent(param['id']), {'id': param['id']});
	appendSlides('experiment');
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
	cirmAJAX.GET(url, 'application/x-www-form-urlencoded; charset=UTF-8', true, postGetBoxScans, {'id': boxId}, null, 0);
}

function postGetBoxScans(data, textStatus, jqXHR, param) {
	scansList = data;
	scansDict = {};
	$.each(data, function(i, item) {
		scansDict[item['id']] = item;
	});
	pushHistoryState('box', '', 'query=box&id='+encodeSafeURIComponent(param['id']), {'id': param['id']});
	appendSlides('box');
	selectNewSlide();
}

function renderLogin() {
	HOME = CIRM_HOME = '' + window.location;
	var index = CIRM_HOME.indexOf('#');
	if (index > 0) {
		PAGE_URL = CIRM_HOME.substring(index+1);
		CIRM_HOME = CIRM_HOME.substring(0, index);
	}
	var index = HOME.lastIndexOf('/cirm');
	HOME = HOME.substring(0, index);
	ERMREST_HOME = HOME + ERMREST_HOME;
	WEBAUTHN_HOME = HOME + WEBAUTHN_HOME;
	PRINTER_HOME = HOME + PRINTER_HOME;
	GLOBUS_TRANSFER_HOME = HOME + GLOBUS_TRANSFER_HOME;
	ZOOMIFY_HOME = HOME + ZOOMIFY_HOME;
	DOWNLOAD_HOME = HOME + DOWNLOAD_HOME;
	SERVICE_TRANSFER_HOME = HOME + SERVICE_TRANSFER_HOME;
	if (isMobileSearch() && !MOBILE_AUTHENTICATE) {
		submitMobileLogin();
		return;
	}
	token = $.cookie(goauth_cookie);
	if (token != null) {
		submitLogin();
	} else {
		var uiDiv = $('#cirm');
		uiDiv.html('');
		var logoDiv = $('<div>');
		uiDiv.append(logoDiv);
		var img = $('<img>');
		logoDiv.append(img);
		img.attr({'alt': 'USC logo',
			'src': '/cirm/images/usc-primaryshieldwordmark.png',
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
		window.location = CIRM_HOME;
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
	USER = $('#username').val();
	if (USER == null && history.state != null) {
		USER = history.state['user'];
	}
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
		//$.removeCookie(goauth_cookie);
		//token = null;
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
			checkGlobusAuthorization();
		}
	} else {
		checkGlobusAuthorization();
	}
}

function checkGlobusAuthorization() {
	var url = ERMREST_HOME + '/box';
	cirmAJAX.GET(url, 'application/x-www-form-urlencoded; charset=UTF-8', true, postSubmitLogin, null, errorGlobusAuthorization, 0);
}

function errorGlobusAuthorization(jqXHR, textStatus, errorThrown) {
	if (jqXHR.status == 401) {
		alert('You are not authorized to use this application.');
		submitLogout();
	} else {
		handleError(jqXHR, textStatus, errorThrown, cirmAJAX.fetch, ERMREST_HOME + '/box', 'application/json', true, null, true, postSubmitLogin, null, null,  MAX_RETRIES+1);
		postSubmitLogin();
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

function createNewFolderRequest() {
	var pathes = [];
	$.each(endpointPath, function(i, path) {
		pathes.push((i==0) ? path : encodeSafeURIComponent(path));
	});
	pathes.push(encodeSafeURIComponent($('#newDirName').val().replace(/^\s*/, "").replace(/\s*$/, "")));
	var path = '/' + pathes.join('/');
	var endpoint = encodeSafeURIComponent(selectedEndpoint);
	var url = SERVICE_TRANSFER_HOME + 'endpoint/' + endpoint + '/mkdir';
	var obj = {
			  "path": path,
			  "DATA_TYPE": "mkdir"
			};
	cirmAJAX.POST(url, 'application/json', false, obj, true, postCreateNewFolderRequest, null, null, 0);
}

function postCreateNewFolderRequest(data, textStatus, jqXHR, param) {
	var newDir = $('#newDirName').val().replace(/^\s*/, "").replace(/\s*$/, "");
	var div = $('#dirDiv');
	div.html('');
	div.hide();
	$('#transferLinks').hide();
	postAutoActivateEndpoint(null, null, null, {'newDir': newDir});
}

function getEndpointData() {
	var div = $('#dirDiv');
	div.html('');
	div.hide();
	$('#transferLinks').hide();
	var endpoint = encodeSafeURIComponent(selectedEndpoint);
	var url = SERVICE_TRANSFER_HOME + 'endpoint/' + endpoint + '/autoactivate';
	cirmAJAX.POST(url, 'application/json', false, {}, true, postAutoActivateEndpoint, null, null, 0);
}

function getTaskStatus(task_id) {
	var url = SERVICE_TRANSFER_HOME + 'task/' + encodeSafeURIComponent(task_id);
	cirmAJAX.GET(url, 'application/json', false, postGetTaskStatus, null, null, MAX_RETRIES+1);
}

function postGetTaskStatus(data, textStatus, jqXHR, param) {
	displayData(data, 'activity');
}

function postAutoActivateEndpoint(data, textStatus, jqXHR, param) {
	var endpoint = encodeSafeURIComponent(selectedEndpoint);
	var pathes = [];
	$.each(endpointPath, function(i, path) {
		pathes.push((i==0) ? path : encodeSafeURIComponent(path));
	});
	var path = '/' + pathes.join('/') + '/';
	var url = SERVICE_TRANSFER_HOME + 'endpoint/' + endpoint + '/ls?path='+path+'&orderby=type,name&fields=name,type,size';
	var params = (param == null ? {} : param);
	cirmAJAX.GET(url, 'application/json', false, postGetEndpointData, params, null, MAX_RETRIES+1);
}

function postGetEndpointData(data, textStatus, jqXHR, param) {
	var div = $('#dirDiv');
	var table = $('<table>');
	div.append(table);
	var tbody = $('<tbody>');
	table.addClass('files_table');
	table.append(tbody);
	if (endpointPath.length > 1) {
		appendData(tbody, '..', 'dir', 4096);
	}
	var pathes = getPathes(data);
	var tr = null;
	$.each(pathes, function(i, path) {
		var row = appendData(tbody, path['name'], path['type'], path['size']);
		if (param['newDir'] != null && path['name'] == param['newDir']) {
			tr = row;
		}
	});
	div.show();
	$('#transferLinks').show();
	var value = endpointPath.join('/');
	if (value[0] != '/') {
		value = '/' + value
	}
	if (value[value.length-1] != '/') {
		value += '/'
	}
	$('#destinationDirectoryInput').val(value);
	checkFilesTransferButton();
	if (tr != null) {
		tr.click();
	}
}

function insertNewFolder() {
	var tbody = $($('tbody', $('#dirDiv'))[0]);
	var firstTr = $($('tr', tbody)[0]);
	var tr = $('<tr>');
	tr.attr('id', 'newFolderTr')
	tr.insertBefore(firstTr);
	var td = $('<td>');
	tr.append(td);
	var img = $('<img>');
	img.attr({'alt': 'Undefined',
		'title': name,
		'src': 'images/folder.jpeg',
		'width': 15,
		'height': 15
		});
	
	td.append(img);
	var td = $('<td>');
	td.addClass('nowrap');
	tr.append(td);
	var input = $('<input>');
	input.attr({'type': 'text',
		'id': 'newDirName',
		'placeholder': 'New Folder'});
	input.keyup(function(event) {checkCreateFolder(event);});
	td.append(input);
	var button = $('<button>');
	button.attr('id', 'createNewFolderButton');
	td.append(button);
	button.html('Create');
	button.button().click(function(event) {createNewFolderRequest();});
	button.attr('disabled', 'disabled');
	button.addClass('disabledButton');
	var td = $('<td>');
	tr.append(td);
	var span = $('<span>');
	span.addClass('ui-icon ui-icon-circle-close');
	span.addClass('floatRight');
	td.append(span);
	span.hover(
			function(event) {document.body.style.cursor = 'pointer';}, 
			function(){document.body.style.cursor = 'default';});
	span.click(function(event) {removeNewFolderTr();});
}

function removeNewFolderTr() {
	$('#newFolderTr').remove();
}

function appendData(tbody, name, type, size) {
	var tr = $('<tr>');
	tbody.append(tr);
	var td = $('<td>');
	td.addClass('file_name');
	tr.append(td);
	var img = $('<img>');
	img.attr({'alt': 'Undefined',
		'title': name,
		'src': 'images/' + (type == 'dir' ? 'folder.jpeg' : 'file.jpeg'),
		'width': 15,
		'height': 15
		});
	
	td.append(img);
	var td = $('<td>');
	td.addClass('file_name');
	tr.append(td);
	if (name == '..') {
		var span = '<span class="ui-icon ui-icon-arrowreturnthick-1-w"></span>';
		td.append(span);
	} else {
		td.html(name);
	}
	td.attr('dirname', name);
	if (type == 'dir') {
		tr.hover(
				function(event) {document.body.style.cursor = 'pointer';}, 
				function(){document.body.style.cursor = 'default';});
		tr.click(function(event) {setDestinationFolder($(this));});
		tr.dblclick(function(event) {getSubFolder($(this));});
	}
	var td = $('<td>');
	td.addClass('file_info');
	tr.append(td);
	td.html(getSize(type, size));
	return tr;
}

function getSize(type, size) {
	var ret = 'Folder';
	if (type == 'file') {
		var unit = 'b';
		if (size >= 1000000000) {
			unit = 'GB';
			size /= 1000000000;
		} else if (size >= 1000000) {
			unit = 'MB';
			size /= 1000000;
		} else if (size >= 1000) {
			unit = 'KB';
			size /= 1000;
		}
		size = Math.round(size*100)/100;
		ret = '' + size + ' ' + unit;
	}
	return ret;
}

function getEndpoints(data) {
	var ret = [];
	var data = data['DATA'];
	$.each(data, function(i, item) {
		ret.push(item['canonical_name']);
	});
	return ret;
}

function getPathes(data) {
	var ret = [];
	var data = data['DATA'];
	$.each(data, function(i, item) {
		ret.push(item);
	});
	ret.sort(compareFiles);
	return ret;
}

function setDestinationFolder(tr) {
	$('.selected').removeClass('selected');
	tr.addClass('selected');
	var td = $('td', tr)[1];
	var values = [];
	$.each(endpointPath, function(i, path) {
		values.push(path);
	});
	values.push($(td).attr('dirname'));
	var path = values.join('/') + '/';
	if (values[0] != '') {
		path = '/' + path;
	}
	$('#destinationDirectoryInput').val(path);
	checkFilesTransferButton();
}

function getSubFolder(tr) {
	var td = $('td', tr)[1];
	var val = $(td).attr('dirname');
	if (val == '..') {
		endpointPath.pop();		
	} else {
		endpointPath.push(val);	
	}
	getEndpointData();
}

function drawPanels() {
	var eastSize = 350;
	var westSize = 225;
	if (containerLayout != null) {
		westSize = containerLayout.state.west.size;
		eastSize = containerLayout.state.east.size;
	}
	if ($('#search').get(0) != null) {
		lastSearchValue = $('#search').val();
	}
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
	containerLayout = container.layout({
		east: {size: eastSize},
		west: {size: westSize},
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

function selectNewSearch() {
	var newSearch = $('li', $('#SearchUL'))[0];
	$(newSearch).click();
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
	if (entityName != 'Search' && entityName != 'View') {
		arr.sort(compareIds);
	}
	$.each(arr, function(i, item) {
		if (entityName != 'Search' && entityName != 'View') {
			values.push(item['id']);
		} else {
			values.push(item);
		}
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
	var searchContent = getEntityContent(searchList, 'Search History', 'Search', displaySearch, null);
	loadLeftPanel(leftPanel, searchContent);
	var viewsContent = getEntityContent(viewsList, 'Admin', 'View', displayView, null);
	loadLeftPanel(leftPanel, viewsContent);
	var active = false;
	if (newSearchKeywords != null) {
		active = 2;
	} else if (newExperimentId != null) {
		active = 1;
	} else if (newBoxId != null) {
		active = 0;
	}
	leftPanel.accordion({ 'header': 'h4',
		'heightStyle': 'content',
		'collapsible': true,
		'active': active});
	var rightPanel = $('#rightPanelTop');
	rightPanel.html('');
	if (newSearchKeywords == null) {
		$('#centerPanelTop').html(CIRM_START_INFO);
	}
	var bottomPanel = $('#bottomPanel');
	initBottomPanel(bottomPanel);
}

function getTaskIdValues(td, val) {
	var a = $('<a>');
	a.addClass('link-style banner-text');
	a.attr('href', 'javascript:getTaskStatus("' + val + '")');
	a.html(val);
	td.append(a);
}

function getSlideIdValue(slide, td, val, index) {
	var a = $('<a>');
	a.addClass('link-style banner-text');
	a.attr('href', 'javascript:displaySlide("' + slide['id'] + '")');
	a.html(index);
	td.append(a);
}

function getSlideBoxValue(slide, td, val, index) {
	var a = $('<a>');
	a.addClass('link-style banner-text');
	a.attr('href', 'javascript:selectSlideBox("' + val + '")');
	a.click(function(event) {event.stopPropagation();});
	a.html(val);
	td.append(a);
}

function selectSlideBox(boxId) {
	$('#leftPanel').accordion( "option", "active", 0 );
	$.each($('li', $('#BoxUL')), function(i, box) {
		if ($(box).html() == boxId) {
			$(box).click();
			return false;
		}
	});
}

function selectTransfer() {
	$('#leftPanel').accordion( "option", "active", 3 );
	$.each($('li', $('#ViewUL')), function(i, li) {
		if ($(li).html() == 'Transfer') {
			$(li).click();
			return false;
		}
	});
}

function selectSlideSearch(value) {
	$('#leftPanel').accordion( "option", "active", 2 );
	$.each($('li', $('#SearchUL')), function(i, li) {
		if ($(li).html() == value) {
			$(li).click();
			return false;
		}
	});
}

function getSlideExperimentValue(slide, td, val, index) {
	var a = $('<a>');
	a.addClass('link-style banner-text');
	a.attr('href', 'javascript:selectSlideExperiment("' + val + '")');
	a.click(function(event) {event.stopPropagation();});
	a.html(val);
	td.append(a);
}

function selectSlideExperiment(experimentId) {
	newExperimentId = experimentId;
	$('#leftPanel').accordion( "option", "active", 1 );
	selectNewExperiment();
}

function getSlideColumnValue(slide, td, val, index) {
	td.html(val);
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
				'width': 30,
				'height': 30
				});
			return false;
		}
	});
	if (img.attr('src') == null) {
		img.attr({'alt': 'Undefined',
			'title': 'Thumbnail',
			'src': 'images/blank.jpeg',
			'width': 30,
			'height': 30
			});
	}
	a.append(img);
	td.append(a);
	if (img.attr('src') == 'images/blank.jpeg') {
		a.click(function(event) {event.preventDefault();});
	}
}

function getFileThumbnail(td, scan) {
	var img = $('<img>');
	img.attr({'alt': 'Undefined',
		'title': 'Thumbnail',
		'src': 'images/'+scan['thumbnail'],
		'width': 30,
		'height': 30
		});
	td.append(img);
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
	cirmAJAX.PUT(url, 'application/json', false, arr, true, postAddSlides, {'id': experimentId}, null, 0);
}

function postAddSlides(data, textStatus, jqXHR, param) {
	$.each(data, function(i, item) {
		slidesList.push(item);
		slidesDict[item['id']] = item;
	});
	pushHistoryState('experiment', '', 'query=experiment&id='+encodeSafeURIComponent(param['id']), {'id': param['id']});
	appendSlides('experiment');
}

function checkUncheckAll(tableId, thId, buttons) {
	var checked = $('#' + thId).prop('checked');
	if (checked) {
		$('td', $('#' + tableId)).find('input:not(:checked)').prop('checked', true);
		$('td', $('#' + tableId)).find('input:disabled').prop('checked', false);
		$.each(buttons, function(i, buttonId) {
			$('#'+ buttonId).removeAttr('disabled');
			$('#'+ buttonId).removeClass('disabledButton');
		});
	} else {
		$('td', $('#' + tableId)).find('input:checked').prop('checked', false);
		$.each(buttons, function(i, buttonId) {
			$('#'+ buttonId).attr('disabled', 'disabled');
			$('#'+ buttonId).addClass('disabledButton');
		});
	}
}

function checkAvailableSlides(event, tableId, thId, buttons) {
	event.stopPropagation();
	var count = $('td', $('#' + tableId)).find('input:checked').length;
	if (count == 0) {
		$('#' + thId).prop('checked', false);
		$.each(buttons, function(i, buttonId) {
			$('#'+ buttonId).attr('disabled', 'disabled');
			$('#'+ buttonId).addClass('disabledButton');
		});
	} else {
		$.each(buttons, function(i, buttonId) {
			$('#'+ buttonId).removeAttr('disabled');
			$('#'+ buttonId).removeClass('disabledButton');
		});
		if ($('td', $('#' + tableId)).find('input:not(:checked)').length == $('td', $('#' + tableId)).find('input:disabled').length) {
			$('#' + thId).prop('checked', true);
		} else {
			$('#' + thId).prop('checked', false);
		}
	}
}

function displayUnassignedSlides() {
	var centerPanel = $('#centerPanelMiddle');
	centerPanel.show();
	centerPanel.html('');
	var arr = [].concat(unassignedSlidesList);
	arr.sort(compareIds);
	if (arr.length == 0) {
		centerPanel.append(CIRM_NO_UNASSIGNED_SLIDES_INFO);
	} else {
		var p = $('<p>');
		p.addClass('intro');
		p.html('Unassigned Slides');
		centerPanel.append(p);
		var containerDiv = $('<div>');
		centerPanel.append(containerDiv);
		containerDiv.addClass('container_div');
		var gridDiv = $('<div>');
		containerDiv.append(gridDiv);
		gridDiv.addClass('grid_div height_table_div');
		gridDiv.height($('#centerPanel').height()*90/100);
		var table = $('<table>');
		gridDiv.append(table);
		table.attr('id', 'unassignedSlidesTable');
		table.attr({'cellpadding': '0', 'cellspacing': '0'});
		table.addClass('fancyTable');
		var thead = $('<thead>');
		table.append(thead);
		var tr = $('<tr>');
		thead.append(tr);
		var th = $('<th>');
		tr.append(th);
		var input = $('<input>');
		input.attr({'type': 'checkbox',
			'id': 'selectAllUnassignedSlidesTh'});
		input.click(function(event) {checkUncheckAll('unassignedSlidesTable', 'selectAllUnassignedSlidesTh', ['addButton']);});
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
		var tbody = $('<tbody>');
		table.append(tbody);
		$.each(arr, function(i, row) {
			var tr = $('<tr>');
			if (i%2 == 1) {
				tr.addClass('odd');
			}
			tbody.append(tr);
			tr.click(function(event) {displaySlidesDetails($(this));});
			var td = $('<td>');
			td.addClass('center');
			tr.append(td);
			var input = $('<input>');
			input.attr({'type': 'checkbox',
				'slideId': row['id']});
			input.click(function(event) {checkAvailableSlides(event, 'unassignedSlidesTable', 'selectAllUnassignedSlidesTh', ['addButton']);});
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
		/*
		table.fixedHeaderTable({ 
			altClass: 'odd'
		});
		*/
		$('#selectAllUnassignedSlidesTh').unbind('click');
		$('#selectAllUnassignedSlidesTh').click(function(event) {checkUncheckAll('unassignedSlidesTable', 'selectAllUnassignedSlidesTh', ['addButton']);});
	}
	$('#cancelCreateButton').unbind('click');
	$('#cancelCreateButton').click(function(event) {appendSlides('experiment');});
	$('#cancelCreateButton').show();
	$('#addButton').show();
	$('#addButton').attr('disabled', 'disabled');
	$('#addButton').addClass('disabledButton');
	$('#addSlidesButton').hide();
	$('#printSlideButton').hide();
	$('#globusTransferButton').hide();
	$('#centerPanelMiddle').show();
	$('#centerPanelTop').hide();
}

function appendSlides(item) {
	$('#centerPanelMiddle').hide();
	$('#centerPanelTop').show();
	$('button[context="centerPanelBottom"]').hide();
	var centerPanel = $('#centerPanelTop');
	var arr = [].concat(slidesList);
	arr.sort(compareIds);
	if (arr.length == 0) {
		centerPanel.html(CIRM_NO_SLIDES_INFO);
	} else {
		centerPanel.html('');
		var p = $('<p>');
		p.addClass('intro');
		centerPanel.append(p);
		if (item == 'box') {
			p.html('Box Slides');
		} else if (item == 'experiment') {
			p.html('Experiment Slides');
		} else if (item == 'search') {
			p.html('Search Slides');
		}
		var containerDiv = $('<div>');
		centerPanel.append(containerDiv);
		containerDiv.addClass('container_div');
		var gridDiv = $('<div>');
		containerDiv.append(gridDiv);
		gridDiv.addClass('grid_div height_table_div');
		gridDiv.height($('#centerPanel').height()*90/100);
		var table = $('<table>');
		gridDiv.append(table);
		table.attr('id', 'slidesTable');
		table.attr({'cellpadding': '0', 'cellspacing': '0'});
		table.addClass('fancyTable');
		var thead = $('<thead>');
		table.append(thead);
		var tr = $('<tr>');
		thead.append(tr);
		var th = $('<th>');
		tr.append(th);
		var input = $('<input>');
		input.attr({'type': 'checkbox',
			'id': 'selectAllAssignedSlidesTh'});
		input.click(function(event) {checkUncheckAll('slidesTable', 'selectAllAssignedSlidesTh', ['printSlideButton', 'globusTransferButton']);});
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
		var tbody = $('<tbody>');
		table.append(tbody);
		$.each(arr, function(i, row) {
			var tr = $('<tr>');
			if (i%2 == 1) {
				tr.addClass('odd');
			}
			tbody.append(tr);
			tr.click(function(event) {displaySlidesDetails($(this));});
			var td = $('<td>');
			td.addClass('center');
			tr.append(td);
			var input = $('<input>');
			input.attr({'type': 'checkbox',
				'slideId': row['id']});
			input.click(function(event) {checkAvailableSlides(event, 'slidesTable', 'selectAllAssignedSlidesTh', ['printSlideButton', 'globusTransferButton']);});
			td.append(input);
			if (row['experiment_id'] == null) {
				input.attr('disabled', 'disabled');
				input.addClass('disabledButton');
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
		/*
		table.fixedHeaderTable({ 
			altClass: 'odd'
		});
		*/
		$('#selectAllAssignedSlidesTh').unbind('click');
		$('#selectAllAssignedSlidesTh').click(function(event) {checkUncheckAll('slidesTable', 'selectAllAssignedSlidesTh', ['printSlideButton', 'globusTransferButton']);});
	}
	
	if (arr.length > 0 && item == 'experiment') {
		$('#printSlideButton').show();
		$('#printSlideButton').attr('disabled', 'disabled');
		$('#printSlideButton').addClass('disabledButton');
	}
	$('button[context="centerPanelBottom"]').hide();
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
		$('#addSlidesButton').show();
		if (arr.length > 0) {
			$('#printSlideButton').show();
		}
	}
	if (arr.length > 0) {
		$('#globusTransferButton').show();
		$('#globusTransferButton').attr('disabled', 'disabled');
		$('#globusTransferButton').addClass('disabledButton');
	}
}

function displaySlidesDetails(tr) {
	$.each($('tr', tr.parent()), function(i, row) {
		if ($(row).hasClass('highlighted')) {
			$(row).removeClass('highlighted');
			if (i%2 == 1) {
				$(row).addClass('odd');
			}
			return false;
		}
	});
	tr.addClass('highlighted');
	$.each($('tr', tr.parent()), function(i, row) {
		if ($(row).hasClass('highlighted')) {
			if (i%2 == 1) {
				$(row).removeClass('odd');
			}
			return false;
		}
	});
	displaySlideEntity($($(':checkbox', tr).get(0)).attr('slideId'));
}

function displaySlideEntity(id) {
	var item = slidesDict[id];
	if (item == null) {
		item = unassignedSlidesDict[id];
	}
	displayEntity('slide', item);
}

function initTopPanel() {
	var topPanel = $('#topPanel');
	var div = $('<div>');
	topPanel.append(div);
	div.addClass('floatLeft');
	var a = $('<a>');
	div.append(a);
	a.addClass('link-style banner-text');
	a.attr({
		'id': 'welcomeLink',
		'href': '#'});
	a.html('Welcome ' + USER + '!');
	var div = $('<div>');
	topPanel.append(div);
	div.addClass('floatRight');
	var a = $('<a>');
	div.append(a);
	a.addClass('link-style banner-text');
	a.attr({
		'id': 'logoutLink',
		'href': 'javascript:submitLogout()'});
	a.html('Logout');
	var br = $('<br>');
	br.addClass('clearBoth');
	topPanel.append(br);
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
	input.keyup(function(event) {checkSearch(event);});
	input.val(lastSearchValue);
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

function checkCreateFolder(event) {
	if ($('#newDirName').val().replace(/^\s*/, "").replace(/\s*$/, "").length > 0) {
		$('#createNewFolderButton').removeAttr('disabled');
		$('#createNewFolderButton').removeClass('disabledButton');
		if (event.which == 13) {
			createNewFolderRequest();
		}
	} else {
		$('#createNewFolderButton').attr('disabled', 'disabled');
		$('#createNewFolderButton').addClass('disabledButton');
	}
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
				pushHistoryState('drawPanels', '', 'query=drawPanels&newSearchKeywords='+encodeSafeURIComponent(newSearchKeywords), {'newSearchKeywords': newSearchKeywords});
				drawPanels();
				newSearchKeywords = null;
				selectNewSearch();
			}
		}
	}
}

function getSearchSlides(keywords, originalValue) {
	var url = ERMREST_HOME + '/scan';
	var params = {'keywords': keywords,
			'originalValue': originalValue};
	cirmAJAX.GET(url, 'application/x-www-form-urlencoded; charset=UTF-8', true, postGetSearchSlides, params, null, 0);
}

function postGetSearchSlides(data, textStatus, jqXHR, param) {
	scansDict = {};
	scansList = data;
	$.each(data, function(i, item) {
		scansDict[item['id']] = item;
	});
	getSlideSearchSlides(param['keywords'], param['originalValue']);
}

function getSlideSearchSlides(keywords, originalValue) {
	var url = ERMREST_HOME + '/slide/' + encodeSafeURIComponent('*') + '::ts::' + encodeSafeURIComponent(keywords);
	var params = {'keywords': keywords,
			'originalValue': originalValue};
	cirmAJAX.GET(url, 'application/x-www-form-urlencoded; charset=UTF-8', true, postGetSlideSearchSlides, params, null, 0);
}

function postGetSlideSearchSlides(data, textStatus, jqXHR, param) {
	slidesDict = {};
	$.each(data, function(i, item) {
		slidesDict[item['id']] = item;
	});
	getExperimentSearchSlides(param['keywords'], param['originalValue']);
}

function getExperimentSearchSlides(keywords, originalValue) {
	var url = ERMREST_HOME + '/experiment/' + encodeSafeURIComponent('*') + '::ts::' + encodeSafeURIComponent(keywords) + '/slide';
	var params = {'keywords': keywords,
			'originalValue': originalValue};
	cirmAJAX.GET(url, 'application/x-www-form-urlencoded; charset=UTF-8', true, postGetExperimentSearchSlides, params, null, 0);
}

function postGetExperimentSearchSlides(data, textStatus, jqXHR, param) {
	$.each(data, function(i, item) {
		slidesDict[item['id']] = item;
	});
	getBoxSearchSlides(param['keywords'], param['originalValue']);
}

function getBoxSearchSlides(keywords, originalValue) {
	var url = ERMREST_HOME + '/box/' + encodeSafeURIComponent('*') + '::ts::' + encodeSafeURIComponent(keywords) + '/slide';
	var params = {'keywords': keywords,
			'originalValue': originalValue};
	cirmAJAX.GET(url, 'application/x-www-form-urlencoded; charset=UTF-8', true, postGetBoxSearchSlides, params, null, 0);
}

function postGetBoxSearchSlides(data, textStatus, jqXHR, param) {
	$.each(data, function(i, item) {
		slidesDict[item['id']] = item;
	});
	slidesList = [];
	$.each(slidesDict, function(key, item) {
		slidesList.push(item);
	});
	slidesList.sort(compareIds);
	entityStack = [];
	pushHistoryState('search', '', 'query=search&keywords='+encodeSafeURIComponent(param['originalValue']), {'keywords': param['originalValue']});
	appendSlides('search');
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
		$('#createButton').removeClass('disabledButton');
	} else {
		$('#createButton').attr('disabled', 'disabled');
		$('#createButton').addClass('disabledButton');
	}
}

function checkExperimentSaveButton() {
	if ($('#experimentDate').val().replace(/^\s*/, "").replace(/\s*$/, "").length > 0 &&
		$('#experimentRI').val().replace(/^\s*/, "").replace(/\s*$/, "").length > 0 &&
		$('#experimentDisambiguator').val().replace(/^\s*/, "").replace(/\s*$/, "").length > 0 &&
		$('#experimentDescription').val().replace(/^\s*/, "").replace(/\s*$/, "").length > 0) {
		$('#createButton').removeAttr('disabled');
		$('#createButton').removeClass('disabledButton');
	} else {
		$('#createButton').attr('disabled', 'disabled');
		$('#createButton').addClass('disabledButton');
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
	$('button[context="centerPanelBottom"]').hide();
	$('#printBoxButton').hide();
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

	$('#cancelButton').hide();
	$('#saveButton').hide();
	displayItem(cols, displayCols, item, itemType);
}

function displayItem(cols, displayCols, item, itemType) {
	$('button', $('#rightPanelBottom')).hide();
	var editColumns = [];
	var multiValuesColumns = [];
	var rightPanel = $('#rightPanelTop');
	rightPanel.html('');
	var p = $('<p>');
	p.addClass('intro');
	if (itemType == 'box') {
		p.html('Box Attributes');
		editColumns = boxEditColumns;
		multiValuesColumns = boxMultiValuesColumns;
	} else if (itemType == 'experiment') {
		p.html('Experiment Attributes');
		editColumns = experimentEditColumns;
		multiValuesColumns = experimentMultiValuesColumns;
	} else if (itemType == 'scan') {
		p.html('Scan Attributes');
		editColumns = scanEditColumns;
		multiValuesColumns = scanMultiValuesColumns;
	} else if (itemType == 'activity') {
		p.html('Activity Attributes');
	} else if (itemType == 'slide') {
		p.html('Slide Attributes');
		editColumns = slideEditColumns;
		multiValuesColumns = slideMultiValuesColumns;
	} else if (itemType == 'printer') {
		p.html('Printer Attributes');
	}
	rightPanel.append(p);

	$.each(cols, function(i, col) {
		var div = $('<div>');
		rightPanel.append(div);
		div.addClass('info');
		div.html(displayCols[col]+':');
		var div = $('<div>');
		div.addClass('attributes');
		rightPanel.append(div);
		var label = $('<label>');
		label.attr('id', col + 'Label');
		label.html(item[col]);
		if (!multiValuesColumns.contains(col) && editColumns.contains(col)) {
			label.attr('title', 'Click to Update');
			label.css('color', '#800000');
			label.hover(
					function(event) {label.get(0).style.cursor = 'pointer';}, 
					function(){label.get(0).style.cursor = 'default';});
			label.click(function(event) {editItem(col);});
		}
		div.append(label);
		if (multiValuesColumns.contains(col)) {
			if (item[col] != null && item[col] !== '') {
				var multiValues = item[col].split(';');
				var multiTable = $('<table>');
				div.append(multiTable);
				multiTable.attr('id', col + 'MultiTable');
				multiTable.addClass('multiValues');
				$.each(multiValues, function(i, value) {
					var tr = $('<tr>');
					tr.attr('id', col+'multiValuesTr'+i);
					multiTable.append(tr);
					var td = $('<td>');
					tr.append(td);
					var valLabel = $('<label>');
					td.append(valLabel);
					valLabel.attr('title', 'Click to Update');
					valLabel.css('color', '#800000');
					valLabel.hover(
							function(event) {valLabel.get(0).style.cursor = 'pointer';}, 
							function(){valLabel.get(0).style.cursor = 'default';});
					valLabel.click(function(event) {editMultiValueItem(col, col+'multiValuesTr'+i);});
					valLabel.html(value);
					var td = $('<td>');
					tr.append(td);
					var input = $('<input>');
					input.attr({'type': 'text',
						'placeholder': 'Add a tag...',
						'size': 30});
					input.keyup(function(event) {updateMultiValue(event, itemType, col, col+'multiValuesTr'+i);});
					td.append(input);
					input.hide();
					var td = $('<td>');
					tr.append(td);
					var span = $('<span>');
					td.append(span);
					span.addClass('ui-icon ui-icon-circle-minus');
					span.click(function(event) {removeMultiValue(event, itemType, col, col+'multiValuesTr'+i);});
				});
			}
			var input = $('<input>');
			input.attr({'type': 'text',
				'id': col + 'Input',
				'placeholder': 'Add a tag...',
				'size': 30});
			input.keyup(function(event) {checkMultiValueButton(event, itemType, col);});
			div.append(input);
			label.hide();
		} else {
			var input = $('<input>');
			input.hide();
			input.attr({'type': 'text',
				'id': col + 'Input',
				'placeholder': 'Add a value...',
				'size': 30});
			input.keyup(function(event) {checkSaveButton(event, itemType, col);});
			div.append(input);
			
			if (editColumns.contains(col) && (item[col] == null || item[col] === '')) {
				label.hide();
				input.show();
			}
		}
	});
}

function getMultiValue(col) {
	var values = [];
	$.each($('label', $('#'+col+'MultiTable')), function(i, label) {
		if ($(label).html() !== '') {
			values.push($(label).html());
		}
	});
	return values;
}

function removeMultiValue(event, itemType, col, trId) {
	$('#'+trId).remove();
	var values = getMultiValue(col);
	$('#'+col + 'Label').html(values.join(';'));
	updateEntity(itemType, col, true);
}

function updateMultiValue(event, itemType, col, trId) {
	if (event.which == 13) {
		var input = $($('input', $('#'+trId))[0]);
		var value = input.val().replace(/^\s*/, "").replace(/\s*$/, "");
		if (value === '') {
			removeMultiValue(event, itemType, col, trId)
		} else {
			var label = $($('label', $('#'+trId))[0]);
			label.html(value);
			var values = getMultiValue(col);
			$('#'+col + 'Label').html(values.join(';'));
			updateEntity(itemType, col, true);
		}
	} else if (event.which == 27) {
		// ESCAPE character
		updateEntity(itemType, col, true);
	}
}

function checkMultiValueButton(event, itemType, col) {
	if (event.which == 13) {
		var input = $('#'+col + 'Input');
		var value = input.val().replace(/^\s*/, "").replace(/\s*$/, "");
		if (value !== '') {
			var values = getMultiValue(col);
			values.push(value);
			$('#'+col + 'Label').html(values.join(';'));
			updateEntity(itemType, col, true);
		}
	}
}

function checkSaveButton(event, itemType, col) {
	if (event.which == 13) {
		updateEntity(itemType, col, false);
	} else if (event.which == 27) {
		// ESCAPE character
		$('#'+col + 'Input').hide();
		$('#'+col + 'Label').show();
	}
}

function editMultiValueItem(col, trId) {
	$('label', $('#' + col + 'MultiTable')).hide();
	$('span', $('#' + col + 'MultiTable')).hide();
	$('#' + col + 'Input').hide();
	var input = $($('input', $('#'+trId))[0]);
	var label = $($('label', $('#'+trId))[0]);
	input.val(label.html());
	input.show();
}

function editItem(col) {
	$('#' + col + 'Input').val($('#' + col + 'Label').html());
	$('#' + col + 'Input').show();
	$('#' + col + 'Label').hide();
}

function displayScan(img, image) {
	displayEntity('scan', image);
	$('#transferButton').unbind('click');
	$('#transferButton').click(function(event) {transferImage(image);});
	$('#transferButton').show();
	$('#enlargeButton').unbind('click');
	$('#enlargeButton').click(function(event) {enlargeImage(img, image);});
	$('#enlargeButton').show();

	$('img', $('#centerPanelTop')).removeClass('highlighted');
	img.addClass('highlighted');
}

function backupRightPanel() {
	var rightPanel = $('#rightPanelTop');
	rightPanel.html('');
	if (entityStack.length > 0) {
		var entity = entityStack.pop();
		displayEntity(entity['itemType'], entity['item']);
		entityStack.push(entity);
	}
}

function initRightPanelButtons() {
	var panel = $('#rightPanelBottom');
	
	var button = $('<button>');
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

function initCenterPanelButtons(panel) {
	var button = $('<button>');
	panel.append(button);
	button.attr('id', 'addSlidesButton');
	button.attr('context', 'centerPanelBottom');
	button.html('Add Slides');
	button.button({icons: {primary: 'ui-icon-cart'}}).click(function(event) {getUnassignedSlides();});

	button = $('<button>');
	panel.append(button);
	button.attr('id', 'createSlideButton');
	button.attr('context', 'centerPanelBottom');
	button.html('New Slide(s)');
	button.button({icons: {primary: 'ui-icon-newwin'}}).click(function(event) {createSlide();});

	button = $('<button>');
	panel.append(button);
	button.attr('id', 'printSlideButton');
	button.attr('context', 'centerPanelBottom');
	button.html('Print Slide(s)');
	button.button({icons: {primary: 'ui-icon-tag'}}).click(function(event) {submitPrintSlide();});

	button = $('<button>');
	panel.append(button);
	button.attr('id', 'backButton');
	button.attr('context', 'centerPanelBottom');
	button.html('Back');
	button.button({icons: {primary: 'ui-icon-arrowthick-1-w'}});

	button = $('<button>');
	panel.append(button);
	button.attr('id', 'submitButton');
	button.attr('context', 'centerPanelBottom');
	button.html('Submit');
	button.button({icons: {primary: 'ui-icon-play'}}).click(function(event) {globusFileTransfer();});

	button = $('<button>');
	panel.append(button);
	button.attr('id', 'cancelCreateButton');
	button.attr('context', 'centerPanelBottom');
	button.html('Cancel');
	button.button({icons: {primary: 'ui-icon-cancel'}});

	button = $('<button>');
	panel.append(button);
	button.attr('id', 'createButton');
	button.attr('context', 'centerPanelBottom');
	button.html('Create');
	button.button({icons: {primary: 'ui-icon-document'}});

	button = $('<button>');
	panel.append(button);
	button.attr('id', 'addButton');
	button.attr('context', 'centerPanelBottom');
	button.html('Add');
	button.button();
	button.button({icons: {primary: 'ui-icon-cart'}}).click(function(event) {addSlides();});

	button = $('<button>');
	panel.append(button);
	button.attr('id', 'enlargeButton');
	button.attr('context', 'centerPanelBottom');
	button.html('Enlarge Image');
	button.button({icons: {primary: 'ui-icon-zoomin'}});

	button = $('<button>');
	panel.append(button);
	button.attr('id', 'transferButton');
	button.attr('context', 'centerPanelBottom');
	button.html('Download');
	button.button({icons: {primary: 'ui-icon-arrowthick-1-s'}});

	button = $('<button>');
	panel.append(button);
	button.attr('id', 'globusTransferButton');
	button.attr('context', 'centerPanelBottom');
	button.html('Transfer');
	button.button({icons: {primary: 'ui-icon-transferthick-e-w'}}).click(function(event) {submitTransfer();});

	button = $('<button>');
	panel.append(button);
	button.attr('id', 'refreshActivityButton');
	button.attr('context', 'centerPanelBottom');
	button.html('Refresh');
	button.button({icons: {primary: 'ui-icon-refresh'}});

	$('button', panel).hide();
}

function initBottomPanel(panel) {
	panel.html('');

	div = $('<div>');
	panel.append(div);
	div.attr('id', 'viterbi');
	div.html('<a href="http://viterbi.usc.edu" target="_newtab2">USC Viterbi School of Engineering</a>');
	
	initCenterPanelButtons(panel);

	var button = $('<button>');
	panel.append(button);
	button.attr('id', 'printBoxButton');
	button.html('Print Box');
	button.button({icons: {primary: 'ui-icon-tag'}}).click(function(event) {submitPrintBox();});

	$('#printBoxButton').hide();
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
}

function updateEntity(item, column, isMultiValue) {
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
		if (col == column && !isMultiValue) {
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
	if (item == 'scan') {
		$('#transferButton').show();
		$('#enlargeButton').show();
	} else if (item == 'box') {
		$('#printBoxButton').show();
	}
}

function refresh() {
	var li = $('.highlighted', $('#leftPanel'))[0];
	if (li != null) {
		$(li).click();
	}
}

function cancel(itemType, item) {
	displayEntity(itemType, item);
}

function transferImage(image) {
	//var czi = 'http://cirm-dev.misd.isi.edu/cirm-files/' + image['tilesdir'] + image['filename'];
	var czi = DOWNLOAD_HOME + image['tilesdir'] + image['filename'];
	window.open(
	  czi,
	  '_blank' // <- This is what makes it open in a new window.
	);
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

function compareFiles(item1, item2) {
	var ret = compareIgnoreCase(item1['type'], item2['type']);
	if (ret == 0) {
		ret = compareIgnoreCase(item1['name'], item2['name']);
	}
	return ret;
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
		'maxlength': '3',
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
		'maxlength': '3',
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
	$('#cancelCreateButton').unbind('click');
	$('#cancelCreateButton').click(function(event) {backupRightPanel(); appendSlides('box');});
	$('#cancelCreateButton').show();
	$('#centerPanelMiddle').hide();
	$('#centerPanelTop').show();
	$('#globusTransferButton').hide();
	$('#printBoxButton').hide();
}

function checkSubmitGetEndpointData(event) {
	checkFilesTransferButton();
	if (event.which == 13 && 
			$('#destinationEnpointInput').val().replace(/^\s*/, "").replace(/\s*$/, "").length > 0 &&
			$('#destinationDirectoryInput').val().replace(/^\s*/, "").replace(/\s*$/, "").length > 0) {
		var path = $('#destinationDirectoryInput').val().replace(/^\s*/, "").replace(/\s*$/, "");
		var length = path.length;
		if (path[length-1] == '/') {
			path = path.substr(0, length-1);
		}
		if (path.length > 0 && path[0] == '/') {
			path = path.substring(1);
		}
		endpointPath = [path];
		getEndpointData();
	}
}

function renderTransferFiles(files) {
	var centerPanel = $('#centerPanelTop');
	centerPanel.html('<p class="intro">Transfer Files</p>');
	centerPanel.show();
	var globusTable = $('<table>');
	globusTable.attr('id', 'globusTransferTable');
	centerPanel.append(globusTable);
	var thead = $('<thead>');
	globusTable.append(thead);
	var globusTr = $('<tr>');
	thead.append(globusTr);
	var th = $('<th>');
	globusTr.append(th);
	th.html('Files');
	var th = $('<th>');
	globusTr.append(th);
	th.html('Destination');
	var tbody = $('<tbody>');
	globusTable.append(tbody);
	var globusTr = $('<tr>');
	tbody.append(globusTr);
	var globusFilesTd = $('<td>');
	globusFilesTd.addClass('files_panel');
	globusTr.append(globusFilesTd);
	var globusDirsTd = $('<td>');
	globusDirsTd.addClass('dirs_panel');
	globusTr.append(globusDirsTd);
	var containerDiv = $('<div>');
	globusFilesTd.append(containerDiv);
	containerDiv.addClass('container_div');
	var gridDiv = $('<div>');
	containerDiv.append(gridDiv);
	gridDiv.addClass('grid_div height_table_div');
	gridDiv.height($('#centerPanel').height()*50/100);
	var table1 = $('<table>');
	gridDiv.append(table1);
	table1.attr('id', 'filesTable');
	table1.attr({'cellpadding': '0', 'cellspacing': '0'});
	table1.addClass('fancyTable');
	var thead = $('<thead>');
	table1.append(thead);
	var tr = $('<tr>');
	thead.append(tr);
	var th = $('<th>');
	tr.append(th);
	var input = $('<input>');
	input.attr({'type': 'checkbox',
		'id': 'selectAllFilesTh'});
	input.click(function(event) {checkUncheckAll('filesTable', 'selectAllFilesTh', ['submitButton']);});
	th.append(input);
	th.hide();
	$.each(filesTableColumns, function(i, col) {
		var th = $('<th>');
		tr.append(th);
		th.html(filesTableDisplayColumns[col]);
	});
	var tbody = $('<tbody>');
	table1.append(tbody);
	$.each(files, function(i, file) {
		var tr = $('<tr>');
		if (i%2 == 1) {
			tr.addClass('odd');
		}
		tbody.append(tr);
		var td = $('<td>');
		td.addClass('center');
		tr.append(td);
		var input = $('<input>');
		input.attr({'type': 'checkbox',
			'checked': 'checked',
			'filename': file});
		input.click(function(event) {checkAvailableSlides(event, 'filesTable', 'selectAllFilesTh', ['submitButton']);});
		td.append(input);
		td.hide();
		$.each(filesTableColumns, function(j, col) {
			var td = $('<td>');
			tr.append(td);
			if (fileDisplayValue[col] != null) {
				fileDisplayValue[col](td, filesDict[file]);
			} else {
				td.html(filesDict[file][col]);
			}
		});
	});
	/*
	table1.fixedHeaderTable({ 
		altClass: 'odd'
	});
	*/
	
	var table = $('<table>');
	globusDirsTd.append(table);
	var tr = $('<tr>');
	table.append(tr);
	var td = $('<td>');
	tr.append(td);
	td.addClass('tag');
	td.html('Endpoint');
	var td = $('<td>');
	tr.append(td);
	var input = $('<input>');
	input.attr({'id': 'destinationEnpointInput',
		'placeholder': 'enter endpoint name',
		'size': 30});
	td.append(input);
	input.val('');
	input.autocomplete({
		source: function(request, response) {
			var endpoint = encodeSafeURIComponent(request.term);
			var url = SERVICE_TRANSFER_HOME + 'endpoint_list?filter=canonical_name:~'+endpoint+'*&fields=canonical_name';
			$.ajax({
				url: url,
				contentType: 'application/json',
				headers: make_headers(),
				timeout: AJAX_TIMEOUT,
				async: true,
				accepts: {text: 'application/json'},
				processData: true,
				data: [],
				dataType: 'json',
				success: function( data ) {
					response(getEndpoints(data));
				},
				error: function(jqXHR, textStatus, errorThrown) {
					handleError(jqXHR, textStatus, errorThrown, cirmAJAX.fetch, url, 'application/json', true, null, true, null, null, null,  MAX_RETRIES+1);
				}
			});
		},
		select: function(event, ui) {setSelectedEndpoint(ui.item.value);}
	});
	var tr = $('<tr>');
	table.append(tr);
	var td = $('<td>');
	tr.append(td);
	td.addClass('tag');
	td.html('Path');
	var td = $('<td>');
	tr.append(td);
	var input = $('<input>');
	input.attr({'id': 'destinationDirectoryInput',
		'type': 'text',
		//'disabled': 'disabled',
		'size': 30});
	td.append(input);
	input.keyup(function(event) {checkSubmitGetEndpointData(event);});
	input.val('');
	
	var tr = $('<tr>');
	table.append(tr);
	var td = $('<td>');
	tr.append(td);
	td.addClass('tag');
	td.html('Label This Transfer');
	var td = $('<td>');
	tr.append(td);
	var input = $('<input>');
	input.attr({'id': 'transferLabelInput',
		'type': 'text',
		'size': 30});
	td.append(input);
	input.val('');
	
	globusDirsTd.append('<br>');

	var table = $('<table>');
	table.attr('id', 'transferLinks');
	globusDirsTd.append(table);
	var tr = $('<tr>');
	table.append(tr);
	var td = $('<td>');
	tr.append(td);
	var span = $('<span>');
	td.append(span);
	span.addClass('ui-icon ui-icon-newwin');
	var td = $('<td>');
	tr.append(td);
	var a = $('<a>');
	a.addClass('link-style banner-text');
	a.attr('href', 'javascript:insertNewFolder()');
	a.html('New Folder');
	td.append(a);
	var td = $('<td>');
	tr.append(td);
	var span = $('<span>');
	td.append(span);
	span.addClass('ui-icon ui-icon-refresh');
	var td = $('<td>');
	tr.append(td);
	var a = $('<a>');
	a.addClass('link-style banner-text');
	a.attr('href', 'javascript:getEndpointData()');
	a.html('Refresh List');
	td.append(a);
	table.hide();

	var div = $('<div>');
	div.addClass('globus_destination');
	div.attr('id', 'dirDiv');
	globusDirsTd.append(div);
	div.hide();

	$('button[context="centerPanelBottom"]').hide();
	$('#submitButton').attr('disabled', 'disabled');
	$('#submitButton').addClass('disabledButton');
	$('#submitButton').show();
	$('#centerPanelMiddle').hide();
	$('#centerPanelTop').show();
	$('#globusTransferButton').hide();
	$('#refreshActivityButton').attr('disabled', 'disabled');
	$('#refreshActivityButton').addClass('disabledButton');
	$('#refreshActivityButton').show();
	$('#printBoxButton').hide();
	selectedEndpoint = null;
}

function renderGlobusTasks(tasks) {
	var centerPanel = $('#centerPanelTop');
	centerPanel.html('');
	centerPanel.show();
	var p = $('<p>');
	p.addClass('intro');
	centerPanel.append(p);
	p.html('Globus Activity');
	var containerDiv = $('<div>');
	centerPanel.append(containerDiv);
	containerDiv.addClass('container_div');
	var gridDiv = $('<div>');
	containerDiv.append(gridDiv);
	gridDiv.addClass('grid_div height_table_div');
	gridDiv.height($('#centerPanel').height()*90/100);
	var globusTable = $('<table>');
	gridDiv.append(globusTable);
	globusTable.attr('id', 'globusActivityTable');
	globusTable.attr({'cellpadding': '0', 'cellspacing': '0'});
	globusTable.addClass('fancyTable');
	var thead = $('<thead>');
	globusTable.append(thead);
	var tr = $('<tr>');
	thead.append(tr);
	$.each(globusTasksTableColumns, function(i, col) {
		var th = $('<th>');
		tr.append(th);
		th.html(globusTasksTableDisplayColumns[col]);
	});
	var tbody = $('<tbody>');
	globusTable.append(tbody);
	$.each(tasks, function(i, task) {
		var tr = $('<tr>');
		if (i%2 == 1) {
			tr.addClass('odd');
		}
		tbody.append(tr);
		$.each(globusTasksTableColumns, function(j, col) {
			var td = $('<td>');
			tr.append(td);
			if (globusTasksDisplayValue[col] != null) {
				globusTasksDisplayValue[col](td, task[col]);
			} else if (task[col] != null && timestampsColumns.contains(col)) {
				td.html(getLocaleTimestamp(task[col]));
			} else {
				td.html(task[col]);
			}
		});
	});
	/*
	globusTable.fixedHeaderTable({ 
		altClass: 'odd',
	});
	*/
	$('button[context="centerPanelBottom"]').hide();
	selectedEndpoint = null;
}

function setSelectedEndpoint(value) {
	selectedEndpoint = value;
	checkFilesTransferButton();
	endpointPath = ['~'];
	setTimeout('getEndpointData()', 1);
}

function checkFilesTransferButton() {
	if (selectedEndpoint != null &&
			$('#destinationDirectoryInput').val().replace(/^\s*/, "").replace(/\s*$/, "").length > 0 &&
			$('td', $('#filesTable')).find('input:checked').length > 0) {
			$('#submitButton').removeAttr('disabled');
			$('#submitButton').removeClass('disabledButton');
		} else {
			$('#submitButton').attr('disabled', 'disabled');
			$('#submitButton').addClass('disabledButton');
		}
}

function getSlidesType() {
	var ret = null;
	if ($('.highlighted', $('#BoxDiv')).length > 0) {
		ret = 'box';
	} else if ($('.highlighted', $('#ExperimentDiv')).length > 0) {
		ret = 'experiment';
	} else if ($('.highlighted', $('#SearchDiv')).length > 0) {
		ret = 'search';
	}
	return ret;
}

function globusTasks(fromRefresh) {
	if (!fromRefresh) {
		$('#rightPanelTop').html('');
		$('#printBoxButton').hide();
	}
	$('button', $('#rightPanelBottom')).hide();
	$('button[context="centerPanelBottom"]').hide();
	pushHistoryState('globus', '', 'query=globus', null);
	var url = SERVICE_TRANSFER_HOME + 'task_list?fields=task_id,request_time,completion_time,destination_endpoint,bytes_transferred,label,status,source_endpoint&orderby=request_time desc';
	cirmAJAX.GET(url, 'application/json', false, postGlobusTasks, null, null, MAX_RETRIES+1);
}

function postGlobusTasks(data, textStatus, jqXHR, param) {
	renderGlobusTasks(data['DATA']);
}

function printersManaging() {
	$('#rightPanelTop').html('');
	$('button', $('#rightPanelBottom')).hide();
	$('button[context="centerPanelBottom"]').hide();
	$('#printBoxButton').hide();
	var centerPanel = $('#centerPanelTop');
	centerPanel.html('<p class="intro"></p>');
	var p = $('<p>');
	p.addClass('center');
	centerPanel.append(p);
	var button = $('<button>');
	p.append(button);
	button.html('Box Labels Printer');
	button.button({icons: {primary: 'ui-icon-print'}}).click(function(event) {printerManaging('Box');});
	var p = $('<p>');
	p.addClass('center');
	centerPanel.append(p);
	var button = $('<button>');
	p.append(button);
	button.html('Slide Labels Printer');
	button.button({icons: {primary: 'ui-icon-print'}}).click(function(event) {printerManaging('Slide');});
}

function printerManaging(printer) {
	var centerPanel = $('#centerPanelTop');
	isSlidePrinter = (printer == 'Slide');
	if (isSlidePrinter) {
		PRINTER_ADDR = SLIDE_PRINTER_ADDR;
		PRINTER_PORT = SLIDE_PRINTER_PORT;
		centerPanel.html('<p class="intro">Slide Labels Printer</p>');
	} else {
		PRINTER_ADDR = BOX_PRINTER_ADDR;
		PRINTER_PORT = BOX_PRINTER_PORT;
		centerPanel.html('<p class="intro">Box Labels Printer</p>');
	}
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
	
	var tr = $('<tr>');
	printTable.append(tr);
	var td = $('<td>');
	tr.append(td);
	var a = $('<a>');
	a.addClass('link-style banner-text');
	a.attr('href', 'javascript:managePrinter("getConfiguration")');
	a.html('Get Configuration');
	td.append(a);
	
	/*
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
	
	$('button[context="centerPanelBottom"]').hide();
	$('#backButton').unbind('click');
	$('#backButton').click(function(event) {printersManaging();});
	$('#backButton').show();
	$('#printBoxButton').hide();
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
	dt.html('Address:');
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
	dt.html('Port:');
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
	$('#saveButton').removeClass('disabledButton');
	$('#cancelButton').show();
	$('#saveButton').show();
	$('#printBoxButton').hide();
}

function updatePrinterSettings() {
	PRINTER_ADDR = $('#printerAddrInput').val();
	PRINTER_PORT = parseInt($('#printerPortInput').val());
	if (isSlidePrinter) {
		SLIDE_PRINTER_ADDR = PRINTER_ADDR;
		SLIDE_PRINTER_PORT = PRINTER_PORT;
	} else {
		BOX_PRINTER_ADDR = PRINTER_ADDR;
		BOX_PRINTER_PORT = PRINTER_PORT;
	}
	cancelPrinterSettings();
}

function cancelPrinterSettings() {
	var rightPanel = $('#rightPanelTop');
	rightPanel.html('');
	$('button', $('#rightPanelBottom')).hide();
	$('#printBoxButton').hide();
}

function managePrinter(param) {
	var url = PRINTER_HOME + (isSlidePrinter ? 'slide' : 'box') + '/control/' + encodeSafeURIComponent(param) + '/';
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
		if (param['param'] == 'getConfiguration') {
			displayData(data[CXI_MSG], 'printer');
		} else {
			alert('The request for "' + param['param'] + '" was send successfully.\nResult: '+JSON.stringify(data[CXI_MSG]));
		}
	}
}

function displayData(item, itemType) {
	var cols = [];
	var displayCols = {};
	$.each(item, function(col, value) {
		if (value != null && !$.isPlainObject(value)) {
			cols.push(col);
			displayCols[col] = col;
			if (timestampsColumns.contains(col)) {
				item[col] = getLocaleTimestamp(item[col]);
			} else {
				item[col] = JSON.stringify(item[col]);
			}
		}
	});
	cols.sort(compareIgnoreCase);
	displayItem(cols, displayCols, item, itemType);
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

	$('button[context="centerPanelBottom"]').hide();
	$('#createButton').unbind('click');
	$('#createButton').click(function(event) {saveExperiment();});
	$('#createButton').show();
	$('#createButton').attr('disabled', 'disabled');
	$('#createButton').addClass('disabledButton');
	$('#cancelCreateButton').unbind('click');
	$('#cancelCreateButton').click(function(event) {clear();});
	$('#cancelCreateButton').show();
	$('#printBoxButton').hide();
	$('#centerPanelMiddle').hide();
	$('#centerPanelTop').show();
	$('#globusTransferButton').hide();
}

function displaySlide(id) {
	var rightPanel = $('#rightPanelTop');
	rightPanel.html('');
	var currentState = history.state;
	if (currentState != null && 
			(currentState['query'] == 'box' || currentState['query'] == 'experiment' || currentState['query'] == 'search')) {
		pushHistoryState('scan', '', 
				'query=scan&slide='+encodeSafeURIComponent(id), 
				{'slide': id});
	}
	getScans(id);
}

function displayView(ul, li) {
	$('li', $('#leftPanel')).removeClass('highlighted');
	li.addClass('highlighted');
	$('#centerPanelTop').html('');
	$('button[context="centerPanelBottom"]').hide();
	if (li.html() == 'Transfer') {
		globusTasks(false);
	} else if (li.html() == 'Printers') {
		printersManaging();
	}
}

function displayBox(ul, li) {
	$('li', $('#leftPanel')).removeClass('highlighted');
	li.addClass('highlighted');
	$('#centerPanelTop').html('');
	$('button[context="centerPanelBottom"]').hide();
	displayEntity('box', boxesDict[li.html()]);
	entityStack = [];
	getSlides(li.html());
}

function displayExperiment(ul, li) {
	$('li', $('#leftPanel')).removeClass('highlighted');
	li.addClass('highlighted');
	$('#centerPanelTop').html('');
	$('button[context="centerPanelBottom"]').hide();
	displayEntity('experiment', experimentsDict[li.html()]);
	entityStack = [];
	getExperimentSlides(li.html());
}

function displaySearch(ul, li) {
	$('li', $('#leftPanel')).removeClass('highlighted');
	li.addClass('highlighted');
	$('#rightPanelTop').html('');
	$('#centerPanelTop').html('');
	$('#printBoxButton').hide();
	$('button', $('#rightPanelBottom')).hide();
	$('button[context="centerPanelBottom"]').hide();
	entityStack = [];
	getSearchSlides(getSearchExpression(li.html(), '&'), li.html());
}

function checkBoxSaveButton() {
	if ($('#boxDate').val().replace(/^\s*/, "").replace(/\s*$/, "").length > 0 &&
		$('#boxGenotype').val().replace(/^\s*/, "").replace(/\s*$/, "").length > 0 &&
		$('#boxRI').val().replace(/^\s*/, "").replace(/\s*$/, "").length > 0 &&
		$('#boxDisambiguator').val().replace(/^\s*/, "").replace(/\s*$/, "").length > 0) {
		$('#createButton').removeAttr('disabled');
		$('#createButton').removeClass('disabledButton');
	} else {
		$('#createButton').attr('disabled', 'disabled');
		$('#createButton').addClass('disabledButton');
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

	$('button[context="centerPanelBottom"]').hide();
	$('#cancelCreateButton').unbind('click');
	$('#cancelCreateButton').click(function(event) {clear();});
	$('#cancelCreateButton').show();
	$('#createButton').unbind('click');
	$('#createButton').click(function(event) {saveBox();});
	$('#createButton').show();
	$('#createButton').attr('disabled', 'disabled');
	$('#createButton').addClass('disabledButton');
	$('#printBoxButton').hide();
	$('#centerPanelMiddle').hide();
	$('#centerPanelTop').show();
	$('#globusTransferButton').hide();
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
	appendSlides(getSlidesType());
}

function submitTransfer() {
	$('#rightPanelTop').html('');
	$('button', $('#rightPanelBottom')).hide();
	var url = ERMREST_HOME + '/scan/';
	var slides = [];
	$.each($('td', $('#slidesTable')).find('input:checked'), function(i, checkbox) {
		slides.push('slide_id=' + encodeSafeURIComponent($(checkbox).attr('slideId')));
	});
	url += slides.join(';');
	cirmAJAX.GET(url, 'application/x-www-form-urlencoded; charset=UTF-8', true, postSubmitTransfer, null, null, 0);
}

function postSubmitTransfer(data, textStatus, jqXHR, param) {
	var files = [];
	filesDict = {};
	$.each(data, function(i, scan) {
		var filename = scan['filename'];
		if (!files.contains(filename)) {
			files.push(filename);
			filesDict[filename] = scan;
		}
	});
	files.sort(compareIgnoreCase);
	renderTransferFiles(files);
}

function globusFileTransfer() {
	if ($('#destinationEnpointInput').val().replace(/^\s*/, "").replace(/\s*$/, "").length == 0 ||
			$('#destinationDirectoryInput').val().replace(/^\s*/, "").replace(/\s*$/, "").length == 0 ||
			$('td', $('#filesTable')).find('input:checked').length == 0) {
		$('#submitButton').attr('disabled', 'disabled');
		$('#submitButton').addClass('disabledButton');
		return;
	}
	var endpoint_2 = $('#destinationEnpointInput').val();
	var files = [];
	$.each($('td', $('#filesTable')).find('input:checked'), function(i, checkbox) {
		var file = $(checkbox).attr('filename');
		files.push(file);
	});
	var destDir = $('#destinationDirectoryInput').val().replace(/^\s*/, "").replace(/\s*$/, "");
	if (destDir[destDir.length-1] != '/') {
		destDir += '/';
	}
	var url = GLOBUS_TRANSFER_HOME;
	var obj = new Object();
	obj['user'] = USER;
	obj['token'] = token;
	obj['endpoint_1'] = ENDPOINT_SOURCE;
	obj['endpoint_2'] = endpoint_2;
	if ($('#transferLabelInput').val().replace(/^\s*/, "").replace(/\s*$/, "").length > 0) {
		obj['label'] = $('#transferLabelInput').val().replace(/^\s*/, "").replace(/\s*$/, "");
	}
	obj['files'] = files;
	var arr = [];
	$.each(files, function(i, file) {
		var scan = filesDict[file];
		var item = {};
		item['file_from'] = TILES_DIR + scan['tilesdir'] + file;
		item['file_to'] = destDir + file;
		arr.push(item);
	});
	obj['files'] = arr;
	cirmAJAX.POST(url, 'application/json', false, obj, true, postGlobusFileTransfer, null, null, 0);
}

function postGlobusFileTransfer(data, textStatus, jqXHR, param) {
	data = $.parseJSON(data)[0];
	if (data['task_id'] != null) {
		$('#refreshActivityButton').removeAttr('disabled');
		$('#refreshActivityButton').removeClass('disabledButton');
		$('#refreshActivityButton').unbind('click');
		$('#refreshActivityButton').click(function(event) {getTaskStatus(data['task_id']);});
		getTaskStatus(data['task_id']);
	} else {
		alert(data['error']);
	}
}

function submitPrintSlide() {
	var url = PRINTER_HOME + 'slide/job';
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
		obj['printer_id'] = SLIDE_PRINTER_ADDR;
		obj['printer_port'] = SLIDE_PRINTER_PORT;
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
	var url = PRINTER_HOME + 'box/job';
	var arr = [];
	var box = boxesDict[$($('.highlighted', $('#BoxDiv'))[0]).html()];
	var obj = {};
	$.each(boxColumns, function(i, col) {
		obj[col] = box[col];
	});
	obj['printer_id'] = BOX_PRINTER_ADDR;
	obj['printer_port'] = BOX_PRINTER_PORT;
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

/**
 * Returns the locale string of a timestamp having the format '2014-02-07 18:51:21+00:00' or 'yyyy-mm-dd hh:mm:ss[.llllll]{+|-}HH:MM'.
 * .llllll represents microseconds and is optional
 * the last part represents the timezone offset and it has the + or - sign followed by the number of hours and minutes
 * Example: '2011-12-02 09:33:34.784133-08:00'
 */
function getLocaleTimestamp(s) {
	var values = s.split(' ');
	var localValues = values[0].split('-');
	var date = (new Date(parseInt(localValues[0], 10), parseInt(localValues[1], 10) - 1, parseInt(localValues[2], 10))).getTime();
	var utc = '00';
	var utcSign = '-';
	var time = values[1].split('-');
	if (time.length == 1) {
		time = values[1].split('+');
		utcSign = '+';
	}
	if (time.length == 1) {
		time = time[0];
	} else {
		utc = utcSign + time[1];
		time = time[0];
	}
	var timeValues = time.split('.');
	var ms = 0;
	var msText = '';
	if (timeValues.length > 1) {
		msText = '.' + timeValues[1];
		ms = Math.floor(parseInt(timeValues[1]) / 1000, 10);
	}
	var hms = timeValues[0].split(':');
	var hours = parseInt(hms[0], 10);
	var minutes = parseInt(hms[1], 10);
	var seconds = parseInt(hms[2], 10);
	var utcValues = utc.split(':');
	if (utcValues.length == 1) {
		utcValues.push('00');
	}
	var utcDelta = (new Date()).getTimezoneOffset() + parseInt(utcValues[0], 10) * 60 + parseInt(utcValues[1], 10);
	date += hours * 60 * 60 * 1000 +
			(minutes - utcDelta) * 60 * 1000 +
			seconds * 1000 +
			ms;
	var newDate = new Date(date);
	var hour = newDate.getHours();
	var am_pm = ' am';
	if (hour > 12) {
		hour -= 12;
		am_pm = ' pm';
	}
	var ret = 	newDate.getFullYear() + '-' +
				('0' + (newDate.getMonth() + 1)).slice(-2) + '-' +
				('0' + newDate.getDate()).slice(-2) + ' ' +
				('0' + hour).slice(-2) + ':' +
				('0' + newDate.getMinutes()).slice(-2) + ':' +
				('0' + newDate.getSeconds()).slice(-2) +
				msText +
				am_pm;
	return ret;
	
}

function clear() {
	$('li', $('#leftPanel')).removeClass('highlighted');
	$('#rightPanelTop').html('');
	$('#centerPanelTop').html(CIRM_START_INFO);
	$('#printBoxButton').hide();
	$('button[context="centerPanelBottom"]').hide();
	$('button', $('#rightPanelBottom')).hide();
	$('#search').val('');
	$('#centerPanelMiddle').hide();
	$('#centerPanelTop').show();
}

function pushHistoryState(query, title, url, params) {
	var state = {
			'query': query,
			'user': USER
			};
	if (params != null) {
		$.each(params, function(key, val) {
			state[key] = val;
		})
	}
	var currentState = history.state;
	if (!testEqual(currentState, state)) {
		history.pushState(state, title, CIRM_HOME+'#'+url);
	}
}

function goBack(event) {
	var state = event.state;
	if (state != null) {
		$('#welcomeLink').html('Welcome ' + state['user'] + '!');
		renderQuery(state);
	} else {
		history.back();
	}
}

function testEqual(obj1, obj2) {
	var ret = false;
	if (obj1 != null && obj2 != null) {
		ret = true;
		$.each(obj1, function(key, val) {
			if (obj2[key] != val) {
				ret = false;
				return false;
			}
		});
		if (ret) {
			$.each(obj2, function(key, val) {
				if (obj1[key] != val) {
					ret = false;
					return false;
				}
			});
		}
	}
	return ret;
}

function initPage() {
	var state = {};
	var parts = PAGE_URL.split('&');
	PAGE_URL = null;
	$.each(parts, function(i, part) {
		var param = part.split('=');
		state[param[0]] = decodeURIComponent(param[1]);
	});
	renderQuery(state);
}

function renderQuery(state) {
	var query = state['query'];
	if (query == '') {
		drawPanels();
	} else if (query == 'drawPanels') {
		newSearchKeywords = state['newSearchKeywords'];
		drawPanels();
		if (newSearchKeywords != null) {
			$('#search').val(newSearchKeywords);
			newSearchKeywords = null;
			selectNewSearch();
		}
	} else if (query == 'box') {
		selectSlideBox(state['id']);
	} else if (query == 'experiment') {
		selectSlideExperiment(state['id']) ;
	} else if (query == 'search') {
		selectSearch(state['keywords']);
	} else if (query == 'scan') {
		displaySlide(state['slide']);
	} else if (query == 'globus') {
		selectTransfer();
	}
}
