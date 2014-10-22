Array.prototype.contains = function (elem) {
	for (i in this) {
		if (this[i] == elem) return true;
	}
	return false;
};

var slideExperimentColumn = 'Experiment ID';
var cirm_tables = ['Specimen', 'Experiment', 'Slide', 'Scan'];
var cirm_tables_columns = {};
var debug = false;
var selectedEndpoint = null;
var endpointPath = [];

var LAST_STATE = null;
var CXI_RET='Return value';
var CXI_MSG='Return Message';
var MOBILE_AUTHENTICATE = true;
var GUEST_USER = '********';
var GUEST_PASSWORD = '********';
var GLOBUS_AUTHN = true;
var SLIDE_PRINTER_ADDR = 'slidecode.hsc.usc.edu';
var SLIDE_PRINTER_PORT = 9100;
var SPECIMEN_PRINTER_ADDR = 'boxcode.hsc.usc.edu';
var SPECIMEN_PRINTER_PORT = 9100;
var PRINTER_ADDR = null;
var PRINTER_PORT = 0;
var HOME;
var ERMREST_SCHEMA_HOME = '/ermrest/catalog/1/schema/CIRM/table/';
var CIRM_HOME;
var PAGE_URL = null;
var USER;
var ERMREST_HOME = '/ermrest/catalog/1/entity';
var CATALOG_HOME = '/ermrest/catalog/1';
var WEBAUTHN_HOME = '/ermrest/authn/session';
var PRINTER_HOME = '/ermrest/printer/';
var GLOBUS_TRANSFER_HOME = '/ermrest/transfer';
var SERVICE_TRANSFER_HOME = '/service/transfer/';
var MAX_RETRIES = 10;
var AJAX_TIMEOUT = 300000;
var CIRM_START_INFO = '<p class="intro">Choose an entity from the left sidebar or use the search box to find relevant images.</p>';
var CIRM_NO_SCANS_INFO = '<p class="intro">No images are available.</p>';
var CIRM_NO_SLIDES_INFO = '<p class="intro">No slides are available.</p>';
var CIRM_NO_UNASSIGNED_SLIDES_INFO = '<p class="intro">No slides are available to be assigned.</p>';
var CIRM_UNASSIGNED_SLIDES_INFO = '<p class="intro">Slides available to be assigned:</p>';
var CIRM_NEW_EXPERIMENT = '<p class="intro">New Experiment</p>';
var CIRM_NEW_SPECIMEN = '<p class="intro">New Specimen</p>';
var CIRM_NEW_TERM = '<p class="intro">New Term</p>';
var cirm_mobile = false;
var mobileParams = null;
var newSpecimenId = null;
var updatedSpecimenId = null;
var newExperimentId = null;
var specimenActive = false;
var experimentActive = false;
var newSlideId = null;
var newSearchKeywords = null;
var ACTIVITY_TASK_ID = null;
var SLIDE_VIEW = null;

var goauth_cookie = 'globusonline-goauth';
var token = null;

var URL_ESCAPE = new String("~!()'");
var ID_ESCAPE = new String(".");

var tablesMetadata = {};

var globusTasksTableColumns = ['label', 'task_id', 'status', 'source_endpoint', 'destination_endpoint', 'request_time', 'completion_time', 'bytes_transferred'];
var globusTasksTableDisplayColumns = {'label': 'Label', 'task_id': 'Task ID', 'status': 'Status', 'source_endpoint': 'Source', 'destination_endpoint': 'Destination', 'request_time': 'Requested', 'completion_time': 'Completed', 'bytes_transferred': 'Bytes Transferred'};
var globusTasksDisplayValue = {'task_id': getTaskIdValues};

var filesTableColumns = ['Thumbnail', 'Original Filename', 'File Size'];
var fileDisplayValue = {'Thumbnail': getFileThumbnail, 'File Size': getFileSize};
var fileClassValue = {'Thumbnail': 'thumbnail', 'File Size': 'file_size'};
var filesDict = {};

var specimenColumns = null;
var specimenEditColumns = ['Comment', 'Tags', 'Specimen Identifier', 'Sample Name'];
var specimenMultiValuesColumns = ['Tags'];
var specimensDict = {};
var specimensList = [];
// {"ID":"20131108-wnt1creZEGG-RES-0","Section Date":"2013-11-08","Sample Name":"wnt1creZEGG","Initials":"RES","Disambiguator":"0","Comment":"This is a specimen of origin"}

var experimentColumns = null;
var experimentEditColumns = ['Comment', 'Tags'];
var experimentMultiValuesColumns = ['Tags'];
var experimentsDict = {};
var experimentsList = [];
// {"ID":"20131115-myantibody2-KC-0","Experiment Date":"2013-11-15","Experiment Description":"myantibody2","Initials":"KC","Disambiguator":"0","Comment":"This is Karl's experiment"}

var slideNoDisplayColumns = ['ID'];
var slideClassColumns = {'Specimen ID': 'Specimen', 'Experiment ID': 'Experiment', 'Seq.': 'center', 'Rev.': 'center', 'Thumbnail': 'center', 'Scans': 'center'};
var slideTableColumns = ['ID', 'Seq.', 'Rev.', 'Thumbnail', 'Scans', 'Specimen ID', 'Experiment ID', 'Comment', 'Tags'];
var slideDisplayValue = {'ID': getSlideIdValue, 'Seq.': getSlideColumnValue, 'Rev.': getSlideColumnValue, 'Specimen ID': getSlideSpecimenValue, 'Experiment ID': getSlideExperimentValue, 'Comment': getSlideColumnValue, 'Tags': getSlideColumnValue, 'Thumbnail': getSlideThumbnail, 'Scans': getSlideScansNumber};

var slideColumns = null;
var slideEditColumns = ['Comment', 'Tags'];
var slideMultiValuesColumns = ['Tags'];
var slidesDict = {};
var slidesList = [];
//{"ID":"20131108-wnt1creZEGG-RES-0-09-000","Seq.":9,"Rev.":0,"Specimen ID":"20131108-wnt1creZEGG-RES-0","Experiment ID":"20131115-myantibody2-KC-0","Comment":"This is a slide"}
var unassignedSlidesDict = {};
var unassignedSlidesList = [];
//{"ID":"20131108-wnt1creZEGG-RES-0-09-000","Seq.":9,"Rev.":0,"Specimen ID":"20131108-wnt1creZEGG-RES-0","Experiment ID":null,"Comment":"This is a slide"}

var scanColumns = null;
var scanEditColumns = ['Comment', 'Tags'];
var scanMultiValuesColumns = ['Tags'];
var scansDict = {};
var scansList = [];
// {"ID":"20131108-wnt1creZEGG-RES-0-38-001-000","Slide ID":"20131108-wnt1creZEGG-RES-0-38-001","Original Filename":"20131108-wnt1creZEGG-RES-0-38-001.czi","Filename":"20131108-wnt1creZEGG-RES-0-38-001.czi","Thumbnail":"20131108-wnt1creZEGG-RES-0-38-001.jpeg","Comment":"This is a scan"}

var searchList = [];
var isSlidePrinter = false;

var entityStack = [];
var timestampsColumns = ['completion_time', 'deadline', 'request_time'];

var viewsList = ['Transfer', 'Printers', '+/- Age', '+/- Gene', '+/- Species', '+/- Specimen Identifier', '+/- Tissue'];
var slidesViewList = ['All', 'Unassigned'];
var SCAN_HISTORY = ['Specimen', 'Experiment', 'Slide', 'search'];

var containerLayout = null;

var lastSearchValue = '';

var speciesList = [];
var speciesDict = {};
var ageList = [];
var ageDict = {};
var tissueList = [];
var tissueDict = {};
var geneList = [];
var geneDict = {};
var speciemenIdentifierList = [];
var speciemenIdentifierDict = {};

var specimenDropDown = {
		'Specimen Identifier': {'list': speciemenIdentifierList, 'dict': speciemenIdentifierDict},
		'Species': {'list': speciesList, 'dict': speciesDict},
		'Age': {'list': ageList, 'dict': ageDict, 'input': true},
		'Tissue': {'list': tissueList, 'dict': tissueDict},
		'Gene': {'list': geneList, 'dict': geneDict, 'autocomplete': true, 'multivalue': true}
};

var buttonsEnableFunction = {
		'globusTransferButton': hasScans,
		'printSlideButton': hasExperiments,
		'addButton': hasCheckedEntries,
		'submitButton': hasCheckedFiles,
		'deleteTermButton': hasCheckedEntries
};

var updateEntityParameters = null;

var specimensInitialsList = [];
var experimentsInitialsList = [];

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
		var isSpecimen = ('' + window.location).indexOf('specimen.html') >= 0;
		params = params.substring(1);
		var arr = params.split('&');
		$.each(arr, function(i, param) {
			var values = param.split('=');
			if (isSlide) {
				if (values[0] == 'Experiment') {
					$('#experimentDiv').html('Experiment: ' + decodeURIComponent(values[1]));
				} else if (values[0] == 'date') {
					$('#dateDiv').html('Date: ' + decodeURIComponent(values[1]));
				} else if (values[0] == 'genotype') {
					$('#genotypeDiv').html('Sample: ' + decodeURIComponent(values[1]));
				} else if (values[0] == 'Slide') {
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
			} else if (isSpecimen) {
				if (values[0] == 'ID') {
					$('#specimenDiv').html('Specimen ID: ' + decodeURIComponent(values[1]));
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
		((('' + window.location).indexOf('/cirm/slide') >= 0) || (('' + window.location).indexOf('/cirm/specimen') >= 0));
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
			} else if (('' + window.location).indexOf('/cirm/specimen') >= 0) {
				mobileParams = {};
				getSpecimen(label);
			}
			return;
		}
	}
	$('#dialog-confirm').dialog({
		modal: true,
		autoOpen: false,
		buttons: {
			'No': function() {
				proceedUpdateEntity(updateEntityParameters['item'], 
						updateEntityParameters['column'], 
						updateEntityParameters['isMultiValue'], 
						false);
				$(this).dialog('close');
			},
			'Yes': function() {
				proceedUpdateEntity(updateEntityParameters['item'], 
						updateEntityParameters['column'], 
						updateEntityParameters['isMultiValue'], 
						true);
				$( this ).dialog('close');
			}
		}
	});
	
	window.onpopstate = function(event) {
		goBack(event);
	};
	$.each(cirm_tables, function(i, table) {
		getMetadata(table);
		cirm_tables_columns[table] = getTableColumns(table);
	});
	specimenColumns = cirm_tables_columns['Specimen'];
	experimentColumns = cirm_tables_columns['Experiment'];
	slideColumns = cirm_tables_columns['Slide'];
	scanColumns = cirm_tables_columns['Scan'];
	getSpecimens(null);
}

function mobileRequest() {
	var url = null;
	if (mobileParams['Slide'] != null) {
		var slide = encodeSafeURIComponent(mobileParams['Slide']['ID']);
		var experiment = '';
		var experimentDate = '';
		if (mobileParams['Slide'][slideExperimentColumn] != null) {
			experiment = encodeSafeURIComponent(mobileParams['Experiment']['Experiment Description']);
			experimentDate = encodeSafeURIComponent(mobileParams['Experiment']['Experiment Date']);
		}
		var genotype = encodeSafeURIComponent(mobileParams['Specimen']['Sample Name']);
		var img = [];
		$.each(mobileParams['scans'], function(i, scan) {
			img.push(encodeSafeURIComponent(scan['Thumbnail']));
		});
		url = '/cirm/mobile.html?Slide='+slide+
			'&Experiment='+experiment+
			'&date='+experimentDate+
			'&genotype='+genotype;
		if (img.length > 0) {
			url += '&img=' + img.join(',');
		}
	} else if (mobileParams['Specimen'] != null) {
		var id = encodeSafeURIComponent(mobileParams['Specimen']['ID']);
		var sectionDate = encodeSafeURIComponent(mobileParams['Specimen']['Section Date']);
		var genotype = encodeSafeURIComponent(mobileParams['Specimen']['Sample Name']);
		var initials = encodeSafeURIComponent(mobileParams['Specimen']['Initials']);
		var disambiguator = encodeSafeURIComponent(mobileParams['Specimen']['Disambiguator']);
		url = '/cirm/specimen.html?ID='+id+
		'&disambiguator='+disambiguator+
		'&date='+sectionDate+
		'&initials='+initials+
		'&genotype='+genotype;
	}
	if (url != null) {
		window.location = url;
	}
}

function getSpecimen(id) {
	var url = ERMREST_HOME + '/Specimen/ID=' + encodeSafeURIComponent(id);
	cirmAJAX.GET(url, 'application/x-www-form-urlencoded; charset=UTF-8', true, postGetSpecimen, {'ID': id}, null, 0);
}

function postGetSpecimen(data, textStatus, jqXHR, param) {
	if (data.length == 0) {
		alert('Specimen not found.');
		submitLogout();
		return;
	}
	mobileParams['Specimen'] = data[0];
	submitLogout();
}

function getSpecimens(id) {
	var url = ERMREST_HOME + '/Specimen';
	if (id != null) {
		url += '/ID=' + encodeSafeURIComponent(id);
	} else {
		getResearchersInitials('Specimen', specimensInitialsList)
		getResearchersInitials('Experiment', experimentsInitialsList)
	}
	cirmAJAX.GET(url, 'application/x-www-form-urlencoded; charset=UTF-8', true, postGetSpecimens, {'ID': id}, null, 0);
}

function postGetSpecimens(data, textStatus, jqXHR, param) {
	if (mobileParams != null) {
		mobileParams['Specimen'] = data[0];
	} else {
		specimensList = data;
		specimensDict = {};
		$.each(data, function(i, item) {
			specimensDict[item['ID']] = item;
		});
	}
	
	getExperiments(mobileParams == null ? null : mobileParams.Slide[slideExperimentColumn]);
}

function getExperiments(id) {
	var url = ERMREST_HOME + '/Experiment';
	if (id != null) {
		url += '/ID=' + encodeSafeURIComponent(id);
	}
	cirmAJAX.GET(url, 'application/x-www-form-urlencoded; charset=UTF-8', true, postGetExperiments, null, null, 0);
}

function postGetExperiments(data, textStatus, jqXHR, param) {
	if (mobileParams != null) {
		mobileParams['Experiment'] = data[0];
		getScans(mobileParams['Slide']['ID']);
	} else {
		experimentsList = data;
		experimentsDict = {};
		$.each(data, function(i, item) {
			experimentsDict[item['ID']] = item;
		});
		if (PAGE_URL == null) {
			pushHistoryState('drawPanels', '', '', null);
		} else {
			var state = getPageState();
			if (state['query'] == 'search' && state['keywords'] != null) {
				searchList.unshift(state['keywords']);
			}
		}
		drawPanels();
		if (PAGE_URL != null) {
			initPage();
		}
	}
}

function getUnassignedSlides() {
	var url = ERMREST_HOME + '/Slide/'+encodeSafeURIComponent(slideExperimentColumn)+'::null::';
	cirmAJAX.GET(url, 'application/x-www-form-urlencoded; charset=UTF-8', true, postGetUnassignedSlides, null, null, 0);
}

function postGetUnassignedSlides(data, textStatus, jqXHR, param) {
	unassignedSlidesList = data;
	unassignedSlidesDict = {};
	$.each(data, function(i, item) {
		unassignedSlidesDict[item['ID']] = item;
	});
	displayUnassignedSlides();
}

function getSlide(id) {
	var url = ERMREST_HOME + '/Slide/ID=' + encodeSafeURIComponent(id);
	cirmAJAX.GET(url, 'application/x-www-form-urlencoded; charset=UTF-8', true, postGetSlide, null, null, 0);
}

function postGetSlide(data, textStatus, jqXHR, param) {
	if (data.length == 0) {
		alert('Slide not found.');
		submitLogout();
		return;
	}
	mobileParams['Slide'] = data[0];
	getSpecimens(data[0]['Specimen ID']);
}

function getSpecimensSlides(view) {
	var url = ERMREST_HOME + '/Scan';
	var params = {'view': view};
	cirmAJAX.GET(url, 'application/x-www-form-urlencoded; charset=UTF-8', true, postGetSpecimensSlides, params, null, 0);
}

function postGetSpecimensSlides(data, textStatus, jqXHR, param) {
	scansDict = {};
	scansList = data;
	$.each(data, function(i, item) {
		scansDict[item['ID']] = item;
	});
	var view = param['view'];
	var url = ERMREST_HOME + '/Slide';
	if (view == 'Unassigned') {
		url += '/'+encodeSafeURIComponent(slideExperimentColumn)+'::null::';
	}
	cirmAJAX.GET(url, 'application/x-www-form-urlencoded; charset=UTF-8', true, postGetViewSlides, {'view': view}, null, 0);
}

function postGetViewSlides(data, textStatus, jqXHR, param) {
	$.each(data, function(i, item) {
		slidesDict[item['ID']] = item;
	});
	slidesList = [];
	$.each(data, function(i, item) {
		slidesList.push(item);
	});
	slidesList.sort(compareIds);
	entityStack = [];
	pushHistoryState('Slide', '', 'query=Slide&view='+encodeSafeURIComponent(param['view']), {'view': param['view']});
	appendSlides('slide');
}

function getExperimentSlides(experimentId) {
	var url = ERMREST_HOME + '/Slide/'+encodeSafeURIComponent(slideExperimentColumn)+'=' + encodeSafeURIComponent(experimentId);
	cirmAJAX.GET(url, 'application/x-www-form-urlencoded; charset=UTF-8', true, postGetExperimentSlides, {'experimentId': experimentId}, null, 0);
}

function postGetExperimentSlides(data, textStatus, jqXHR, param) {
	slidesList = data;
	slidesDict = {};
	$.each(data, function(i, item) {
		slidesDict[item['ID']] = item;
	});
	getExperimentScans(param['experimentId']);
}

function getExperimentScans(experimentId) {
	var url = ERMREST_HOME + '/Slide/'+encodeSafeURIComponent(slideExperimentColumn)+'=' + encodeSafeURIComponent(experimentId) + '/Scan';
	cirmAJAX.GET(url, 'application/x-www-form-urlencoded; charset=UTF-8', true, postGetExperimentScans, {'ID': experimentId}, null, 0);
}

function postGetExperimentScans(data, textStatus, jqXHR, param) {
	scansList = data;
	scansDict = {};
	$.each(data, function(i, item) {
		scansDict[item['ID']] = item;
	});
	pushHistoryState('Experiment', '', 'query=Experiment&ID='+encodeSafeURIComponent(param['ID']), {'ID': param['ID']});
	appendSlides('Experiment');
	selectNewSlide();
}

function getSlides(specimenId) {
	var url = ERMREST_HOME + '/Specimen/ID=' + encodeSafeURIComponent(specimenId) + '/Slide';
	cirmAJAX.GET(url, 'application/x-www-form-urlencoded; charset=UTF-8', true, postGetSlides, {'specimenId': specimenId}, null, 0);
}

function postGetSlides(data, textStatus, jqXHR, param) {
	slidesList = data;
	slidesDict = {};
	$.each(data, function(i, item) {
		slidesDict[item['ID']] = item;
	});
	getSpecimenScans(param['specimenId']);
}

function getSpecimenScans(specimenId) {
	var url = ERMREST_HOME + '/Scan/' + encodeSafeURIComponent('Slide ID') + '::regexp::' + encodeSafeURIComponent(specimenId) + '*';
	cirmAJAX.GET(url, 'application/x-www-form-urlencoded; charset=UTF-8', true, postGetSpecimenScans, {'ID': specimenId}, null, 0);
}

function postGetSpecimenScans(data, textStatus, jqXHR, param) {
	scansList = data;
	scansDict = {};
	$.each(data, function(i, item) {
		scansDict[item['ID']] = item;
	});
	pushHistoryState('Specimen', '', 'query=Specimen&ID='+encodeSafeURIComponent(param['ID']), {'ID': param['ID']});
	appendSlides('Specimen');
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
	CATALOG_HOME = HOME + CATALOG_HOME;
	WEBAUTHN_HOME = HOME + WEBAUTHN_HOME;
	PRINTER_HOME = HOME + PRINTER_HOME;
	GLOBUS_TRANSFER_HOME = HOME + GLOBUS_TRANSFER_HOME;
	ERMREST_SCHEMA_HOME = HOME + ERMREST_SCHEMA_HOME;
	SERVICE_TRANSFER_HOME = HOME + SERVICE_TRANSFER_HOME;
	if (isMobileSearch() && !MOBILE_AUTHENTICATE) {
		submitMobileLogin();
		return;
	}
	token = $.cookie(goauth_cookie);
	if (token != null) {
		submitLogin();
	} else {
		renderLoginForm();
	}
}

function renderLoginForm() {
	var uiDiv = $('#cirm');
	uiDiv.html('');
	var logoDiv = $('<div>');
	uiDiv.append(logoDiv);
	/*
	var img = $('<img>');
	logoDiv.append(img);
	img.attr({'alt': 'USC logo',
		'src': '/cirm/images/usc-primaryshieldwordmark.png',
		'width': 300,
		'height': 100
		});
	img.addClass('center');
	*/
	var h1 = $('<h1>');
	logoDiv.append(h1);
	h1.html('Microscopy Image Manager');
	h1.addClass('logo');
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
		if (USER == null || USER == undefined) {
			renderLoginForm();
			return;
		}
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
	getSpecimenSelectValues(postCheckGlobusAuthorization);
}

function postCheckGlobusAuthorization(data, textStatus, jqXHR, param) {
	var url = ERMREST_HOME + '/Specimen';
	cirmAJAX.GET(url, 'application/x-www-form-urlencoded; charset=UTF-8', true, postSubmitLogin, null, errorGlobusAuthorization, 0);
}

function errorGlobusAuthorization(jqXHR, textStatus, errorThrown) {
	if (jqXHR.status == 401) {
		alert('You are not authorized to use this application.');
		submitLogout();
	} else {
		handleError(jqXHR, textStatus, errorThrown, cirmAJAX.fetch, ERMREST_HOME + '/Specimen', 'application/json', true, null, true, postSubmitLogin, null, null,  MAX_RETRIES+1);
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
	var eastSize = 325;
	var westSize = 250;
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
	selectNewSpecimen();
	selectNewExperiment();
	if (specimenActive || experimentActive) {
		setTimeout('openAccordion()', 1);
	}
	$('#centerPanel').css('max-height', $('#centerPanel').css('height'));
}

function openAccordion() {
	$('#leftPanel').accordion( "option", "active", specimenActive ? 0 : 1 );
	specimenActive = experimentActive = false;
}

function selectNewSpecimen() {
	if (newSpecimenId != null) {
		$.each($('li', $('#SpecimenUL')), function(i, specimen) {
			if ($(specimen).attr('entityId') == newSpecimenId) {
				$(specimen).click();
				return false;
			}
		});
	}
}

function selectNewExperiment() {
	if (newExperimentId != null) {
		$.each($('li', $('#ExperimentUL')), function(i, experiment) {
			if ($(experiment).attr('entityId') == newExperimentId) {
				newExperimentId = null;
				$(experiment).click();
				return false;
			}
		});
	}
}

function selectNewSearch() {
	setTimeout('setNewSearch()', 1);
}

function setNewSearch() {
	$('#leftPanel').accordion( "option", "active", 3 );
	var newSearch = $('li', $('#SearchUL'))[0];
	$(newSearch).click();
}

function selectSearch(keywords) {
	$.each($('li', $('#SearchUL')), function(i, li) {
		if ($(li).html() == keywords) {
			$('#leftPanel').accordion( "option", "active", 3 );
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

function getEntityContent(entityList, displayName, entityName, clickFunction, createFunction, compareEntities, node) {
	var entityContent = [];
	var obj = {};
	obj['Display'] = displayName;
	obj['Name'] = entityName;
	obj['Click'] = clickFunction;
	obj['Create'] = createFunction;
	var values = [];
	var arr = [].concat(entityList);
	if (compareEntities != null) {
		arr.sort(compareEntities);
	}
	$.each(arr, function(i, item) {
		values.push(node(item));
	});
	obj['Values'] = values;
	entityContent.push(obj);
	return entityContent;
}

function initPanels() {
	initTopPanel();
	var leftPanel = $('#leftPanel');
	leftPanel.html('');
	var specimensContent = getEntityContent(specimensList, 'Specimens', 'Specimen', displaySpecimen, createSpecimen, compareSpecimens, specimenNode);
	loadLeftPanel(leftPanel, specimensContent);
	var experimentsContent = getEntityContent(experimentsList, 'Experiments', 'Experiment', displayExperiment, createExperiment, compareExperiments, experimentNode);
	loadLeftPanel(leftPanel, experimentsContent);
	var slidesContent = getEntityContent(slidesViewList, 'Slides', 'Slide', displaySpecimensSlides, null, null, entityNode);
	loadLeftPanel(leftPanel, slidesContent);
	var searchContent = getEntityContent(searchList, 'Recent Searches', 'Search', displaySearch, null, null, entityNode);
	loadLeftPanel(leftPanel, searchContent);
	var viewsContent = getEntityContent(viewsList, 'Admin', 'View', displayView, null, null, entityNode);
	loadLeftPanel(leftPanel, viewsContent);
	var active = false;
	if (newSearchKeywords != null) {
		active = 3;
	} else if (newExperimentId != null || experimentActive) {
		active = 1;
	} else if (newSpecimenId != null || specimenActive) {
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
	a.attr('href', 'javascript:displayTaskStatus("' + val + '")');
	a.html(val);
	td.append(a);
}

function getSlideIdValue(slide, td, val, index) {
	var a = $('<a>');
	a.addClass('link-style banner-text');
	a.attr('href', 'javascript:displaySlide("' + slide['ID'] + '")');
	a.html(index);
	td.append(a);
}

function getSlideSpecimenValue(slide, td, val, index) {
	var a = $('<a>');
	a.addClass('link-style banner-text');
	a.attr('href', 'javascript:selectSlideSpecimen("' + val + '")');
	a.click(function(event) {event.stopPropagation();});
	a.html(val);
	td.append(a);
}

function selectSlideSpecimen(specimenId) {
	$('#leftPanel').accordion( "option", "active", 0 );
	$.each($('li', $('#SpecimenUL')), function(i, specimen) {
		if ($(specimen).attr('entityId') == specimenId) {
			$(specimen).click();
			return false;
		}
	});
}

function selectTransfer() {
	$('#leftPanel').accordion( "option", "active", 4 );
	$.each($('li', $('#ViewUL')), function(i, li) {
		if ($(li).html() == 'Transfer') {
			$(li).click();
			return false;
		}
	});
}

function selectSlideView() {
	$('#leftPanel').accordion( "option", "active", 2 );
	$.each($('li', $('#SlideUL')), function(i, li) {
		if ($(li).html() == SLIDE_VIEW) {
			$(li).click();
			return false;
		}
	});
}

function selectSlideSearch(value) {
	$('#leftPanel').accordion( "option", "active", 3 );
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

function getSlideScansNumber(slide, td, val) {
	var no = 0;
	$.each(scansList, function(i, scan) {
		if (scan['Slide ID'] == slide['ID']) {
			no++;
		}
	});
	td.html(no);
}

function getSlideScansCount(slideId) {
	var no = 0;
	$.each(scansList, function(i, scan) {
		if (scan['Slide ID'] == slideId) {
			no++;
		}
	});
	return no;
}

function getSlideThumbnail(slide, td, val) {
	var a = $('<a>');
	a.addClass('link-style banner-text');
	a.attr('href', 'javascript:displaySlide("' + slide['ID'] + '")');
	var img = $('<img>');
	$.each(scansList, function(i, scan) {
		if (scan['Slide ID'] == slide['ID'] && scan['Thumbnail'] != null) {
			img.attr({'alt': 'Undefined',
				'title': 'Thumbnail',
				'src': scan['Thumbnail'],
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
		var hasFile = false;
		$.each(scansList, function(i, scan) {
			if (scan['Slide ID'] == slide['ID'] && scan['Original Filename'] != null) {
				hasFile = true;
				return false;
			}
		});
		if (!hasFile) {
			a.click(function(event) {event.preventDefault();});
		}
	}
}

function getFileSize(td, scan, scanFiles) {
	scanFiles['filesCount'] += 1;
	scanFiles['filesSize'] += scan['File Size'];
	td.addClass('nowrap');
	td.html(getSize('file', scan['File Size']));
}

function getFileThumbnail(td, scan) {
	var img = $('<img>');
	img.attr({'alt': 'Undefined',
		'title': 'Thumbnail',
		'src': scan['Thumbnail'] != null ? scan['Thumbnail'] : 'images/blank.jpeg',
		'width': 30,
		'height': 30
		});
	td.append(img);
}

function addSlides() {
	var li = $('.highlighted', $('#leftPanel'))[0];
	var experimentId = $(li).attr('entityId');
	var url = ERMREST_HOME + '/Slide';
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
	cirmAJAX.PUT(url, 'application/json', false, arr, true, postAddSlides, {'ID': experimentId}, null, 0);
}

function postAddSlides(data, textStatus, jqXHR, param) {
	$.each(data, function(i, item) {
		slidesList.push(item);
		slidesDict[item['ID']] = item;
	});
	pushHistoryState('Experiment', '', 'query=Experiment&ID='+encodeSafeURIComponent(param['ID']), {'ID': param['ID']});
	appendSlides('Experiment');
}

function checkUncheckAll(tableId, thId, buttons) {
	var checked = $('#' + thId).prop('checked');
	if (checked) {
		$('td', $('#' + tableId)).find('input:not(:checked)').prop('checked', true);
		$.each(buttons, function(i, buttonId) {
			if (buttonsEnableFunction[buttonId](tableId)) {
				$('#'+ buttonId).removeAttr('disabled');
				$('#'+ buttonId).removeClass('disabledButton');
			} else {
				$('#'+ buttonId).attr('disabled', 'disabled');
				$('#'+ buttonId).addClass('disabledButton');
			}
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
			if (buttonsEnableFunction[buttonId](tableId)) {
				$('#'+ buttonId).removeAttr('disabled');
				$('#'+ buttonId).removeClass('disabledButton');
			} else {
				$('#'+ buttonId).attr('disabled', 'disabled');
				$('#'+ buttonId).addClass('disabledButton');
			}
		});
		if ($('td', $('#' + tableId)).find('input:not(:checked)').length > 0) {
			$('#' + thId).prop('checked', false);
		} else {
			$('#' + thId).prop('checked', true);
		}
	}
}

function hasScans(tableId) {
	var ret = 0;
	$.each($('td', $('#' + tableId)).find('input:checked'), function(i, entry) {
		var no = 0;
		$.each(scansList, function(j, scan) {
			if (scan['Slide ID'] == $(entry).attr('slideId')) {
				no++;
			}
		});
		ret += no;
	});
	return (ret > 0);
}

function hasExperiments(tableId) {
	var ret = 0;
	$.each($('td', $('#' + tableId)).find('input:checked'), function(i, entry) {
		if (slidesDict[$(entry).attr('slideId')]['Experiment ID'] != null) {
			ret += 1;
		}
	});
	return (ret > 0);
}

function hasCheckedEntries(tableId) {
	var ret = $('td', $('#' + tableId)).find('input:checked').length;
	return (ret > 0);
}

function hasCheckedFiles(tableId) {
	return ($('td', $('#' + tableId)).find('input:checked').length > 0 && 
			selectedEndpoint != null && 
			$('#destinationDirectoryInput').val().replace(/^\s*/, "").replace(/\s*$/, "").length > 0);
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
				th.html(col);
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
				'slideId': row['ID']});
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
		$('.Experiment', table).hide();
		/*
		table.fixedHeaderTable({ 
			altClass: 'odd'
		});
		*/
		$('#selectAllUnassignedSlidesTh').unbind('click');
		$('#selectAllUnassignedSlidesTh').click(function(event) {checkUncheckAll('unassignedSlidesTable', 'selectAllUnassignedSlidesTh', ['addButton']);});
	}
	$('#cancelCreateButton').unbind('click');
	$('#cancelCreateButton').click(function(event) {appendSlides('Experiment');});
	$('#cancelCreateButton').show();
	$('#addButton').show();
	$('#addButton').attr('disabled', 'disabled');
	$('#addButton').addClass('disabledButton');
	$('#addSlidesButton').hide();
	$('#deleteExperimentButton').hide();
	$('#printSlideButton').hide();
	$('#globusTransferButton').hide();
	$('#deleteSlideButton').hide();
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
		if (item == 'Specimen') {
			p.html('Specimen Slides');
		} else if (item == 'Experiment') {
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
				th.html(col);
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
				'slideId': row['ID']});
			input.click(function(event) {checkAvailableSlides(event, 'slidesTable', 'selectAllAssignedSlidesTh', ['printSlideButton', 'globusTransferButton']);});
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
		$('.'+item, table).hide();
		/*
		table.fixedHeaderTable({ 
			altClass: 'odd'
		});
		*/
		$('#selectAllAssignedSlidesTh').unbind('click');
		$('#selectAllAssignedSlidesTh').click(function(event) {checkUncheckAll('slidesTable', 'selectAllAssignedSlidesTh', ['printSlideButton', 'globusTransferButton']);});
	}
	
	if (arr.length > 0 && item == 'Experiment') {
		$('#printSlideButton').show();
		$('#printSlideButton').attr('disabled', 'disabled');
		$('#printSlideButton').addClass('disabledButton');
	}
	$('button[context="centerPanelBottom"]').hide();
	if (item == 'Specimen') {
		$('#createSlideButton').show();
		$('#printSpecimenButton').show();
		$('#deleteSpecimenButton').show();
		if ($('tbody tr', $('#slidesTable')).length > 0) {
			$('#deleteSpecimenButton').attr('disabled', 'disabled');
			$('#deleteSpecimenButton').addClass('disabledButton');
		} else {
			$('#deleteSpecimenButton').removeAttr('disabled');
			$('#deleteSpecimenButton').removeClass('disabledButton');
		}
		if (updatedSpecimenId != null) {
			updatedSpecimenId = newSpecimenId = null;
		}
		if (newSpecimenId != null) {
			$('#createSlideButton').click();
			newSpecimenId = null;
		}
	}
	if (item == 'Experiment') {
		$('#printSpecimenButton').hide();
		$('#deleteSpecimenButton').hide();
		$('#addSlidesButton').show();
		$('#deleteExperimentButton').show();
		if (arr.length > 0) {
			$('#printSlideButton').show();
		}
	}
	if (arr.length > 0) {
		$('#globusTransferButton').show();
		$('#globusTransferButton').attr('disabled', 'disabled');
		$('#globusTransferButton').addClass('disabledButton');
		$('#deleteSlideButton').show();
		$('#deleteSlideButton').attr('disabled', 'disabled');
		$('#deleteSlideButton').addClass('disabledButton');
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
	displayEntity('Slide', item);
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
	h1.html('Microscopy Image Manager');
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
	var url = ERMREST_HOME + '/Scan';
	var params = {'keywords': keywords,
			'originalValue': originalValue};
	cirmAJAX.GET(url, 'application/x-www-form-urlencoded; charset=UTF-8', true, postGetSearchSlides, params, null, 0);
}

function postGetSearchSlides(data, textStatus, jqXHR, param) {
	scansDict = {};
	scansList = data;
	$.each(data, function(i, item) {
		scansDict[item['ID']] = item;
	});
	getSlideSearchSlides(param['keywords'], param['originalValue']);
}

function getSlideSearchSlides(keywords, originalValue) {
	var url = ERMREST_HOME + '/Slide/' + encodeSafeURIComponent('*') + '::ts::' + encodeSafeURIComponent(keywords);
	var params = {'keywords': keywords,
			'originalValue': originalValue};
	cirmAJAX.GET(url, 'application/x-www-form-urlencoded; charset=UTF-8', true, postGetSlideSearchSlides, params, null, 0);
}

function postGetSlideSearchSlides(data, textStatus, jqXHR, param) {
	slidesDict = {};
	$.each(data, function(i, item) {
		slidesDict[item['ID']] = item;
	});
	getExperimentSearchSlides(param['keywords'], param['originalValue']);
}

function getExperimentSearchSlides(keywords, originalValue) {
	var url = ERMREST_HOME + '/Experiment/' + encodeSafeURIComponent('*') + '::ts::' + encodeSafeURIComponent(keywords) + '/Slide';
	var params = {'keywords': keywords,
			'originalValue': originalValue};
	cirmAJAX.GET(url, 'application/x-www-form-urlencoded; charset=UTF-8', true, postGetExperimentSearchSlides, params, null, 0);
}

function postGetExperimentSearchSlides(data, textStatus, jqXHR, param) {
	$.each(data, function(i, item) {
		slidesDict[item['ID']] = item;
	});
	getSpecimenSearchSlides(param['keywords'], param['originalValue']);
}

function getSpecimenSearchSlides(keywords, originalValue) {
	var url = ERMREST_HOME + '/Specimen/' + encodeSafeURIComponent('*') + '::ts::' + encodeSafeURIComponent(keywords) + '/Slide';
	var params = {'keywords': keywords,
			'originalValue': originalValue};
	cirmAJAX.GET(url, 'application/x-www-form-urlencoded; charset=UTF-8', true, postGetSpecimenSearchSlides, params, null, 0);
}

function postGetSpecimenSearchSlides(data, textStatus, jqXHR, param) {
	$.each(data, function(i, item) {
		slidesDict[item['ID']] = item;
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
			buttonImage.click(function(event) {event.stopPropagation();val['Create']();});
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
			li.attr('entityId', value['entityId']);
			li.html(value['display']);
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
	var url = ERMREST_HOME + '/Slide/ID='+encodeSafeURIComponent(id)+'/Scan';
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
	var item = 'Specimen';
	if ($('.highlighted', $('#ExperimentDiv')).length > 0) {
		item = 'Experiment';
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
			'src': image['Thumbnail'] != null ? image['Thumbnail'] : 'images/blank.jpeg',
			'width': 100,
			'height': 100,
			'index': image['ID']
			});
		centerPanel.append(img);
		img.click(function(event) {displayScan($(this), image);});
		if (image['Zoomify'] != null) {
			img.dblclick(function(event) {enlargeImage($(this), image);});
		}
	});
	$('button[context="centerPanelBottom"]').hide();
	$('#printSpecimenButton').hide();
	$('#deleteSpecimenButton').hide();
	$('#centerPanelMiddle').hide();
	$('#centerPanelTop').show();
}

function enlargeImage(img, image) {
	if (cirm_mobile) {
		var label = image['Slide ID'];
		mobileParams = {};
		getSlide(label);
	} else {
		var tilesHTML = image['Zoomify'];
		window.open(
		  tilesHTML,
		  '_blank' // <- This is what makes it open in a new window.
		);
	}
}

function displayEntity(itemType, item) {
	var updateItem = null;
	var cols = null;
	if (itemType == 'Scan') {
		updateItem = 'updateScan';
		cols = scanColumns;
	} else if (itemType == 'Slide') {
		updateItem = 'updateSlide';
		cols = slideColumns;
	} else if (itemType == 'Specimen') {
		updateItem = 'updateSpecimen';
		cols = specimenColumns;
	} else if (itemType == 'Experiment') {
		updateItem = 'updateExperiment';
		cols = experimentColumns;
	}

	$('#cancelButton').hide();
	$('#saveButton').hide();
	displayItem(cols, item, itemType);
}

function displayItem(cols, item, itemType) {
	$('button', $('#rightPanelBottom')).hide();
	var editColumns = [];
	var multiValuesColumns = [];
	var selectColumns = null;
	var rightPanel = $('#rightPanelTop');
	rightPanel.html('');
	var p = $('<p>');
	p.addClass('intro');
	if (itemType == 'Specimen') {
		p.html('Specimen Attributes');
		editColumns = specimenEditColumns;
		multiValuesColumns = specimenMultiValuesColumns;
		selectColumns = specimenDropDown;
	} else if (itemType == 'Experiment') {
		p.html('Experiment Attributes');
		editColumns = experimentEditColumns;
		multiValuesColumns = experimentMultiValuesColumns;
	} else if (itemType == 'Scan') {
		p.html('Scan Attributes');
		editColumns = scanEditColumns;
		multiValuesColumns = scanMultiValuesColumns;
	} else if (itemType == 'activity') {
		p.html('Activity Attributes');
	} else if (itemType == 'Slide') {
		p.html('Slide Attributes');
		editColumns = slideEditColumns;
		multiValuesColumns = slideMultiValuesColumns;
		if (getSlideScansCount(item['ID']) == 0) {
			$('#deleteSlideButton').removeAttr('disabled');
			$('#deleteSlideButton').removeClass('disabledButton');
		} else {
			$('#deleteSlideButton').attr('disabled', 'disabled');
			$('#deleteSlideButton').addClass('disabledButton');
		}
	} else if (itemType == 'printer') {
		p.html('Printer Attributes');
	}
	rightPanel.append(p);

	$.each(cols, function(i, col) {
		var div = $('<div>');
		rightPanel.append(div);
		div.addClass('info');
		div.html(col+':');
		var div = $('<div>');
		div.addClass('attributes');
		rightPanel.append(div);
		var label = $('<label>');
		label.attr('id', makeId(col) + 'Label');
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
		if (selectColumns != null && selectColumns[col] != null && selectColumns[col]['multivalue'] != null) {
			if (item[col] != null && item[col] !== '') {
				var input = $('<input>');
				input.attr({'type': 'text',
					'id': makeId(col) + 'Input',
					'size': 30});
				input.autocomplete({
					minLength: 0,
					select: function (event, ui) {$('#' + makeId(col) + 'Input').val(ui.item.value);updateMultiSelectValue(itemType, col, true);},
					source: function(request, response) {
						response(getSuggestions(request.term, selectColumns[col]['list']));
					}
				});
				div.append(input);
				var multiValues = item[col].split(';');
				var multiTable = $('<table>');
				div.append(multiTable);
				multiTable.attr('id', makeId(col) + 'MultiTable');
				multiTable.addClass('multiValues');
				$.each(multiValues, function(i, value) {
					var tr = $('<tr>');
					tr.attr('id', makeId(col)+'multiValuesTr'+i);
					multiTable.append(tr);
					var td = $('<td>');
					tr.append(td);
					td.html(value);
					var td = $('<td>');
					tr.append(td);
					var span = $('<span>');
					td.append(span);
					span.addClass('ui-icon ui-icon-circle-minus');
					span.click(function(event) {removeMultiSelectValue(event, itemType, col, makeId(col)+'multiValuesTr'+i);});
				});
			}
			label.hide();
		} else if (selectColumns != null && selectColumns[col] != null) {
			label.hide();
			if (selectColumns[col]['autocomplete']) {
				var input = $('<input>');
				input.attr({'type': 'text',
					'id': makeId(col) + 'Input',
					'size': 30});
				input.autocomplete({
					minLength: 0,
					select: function (event, ui) {$('#' + makeId(col) + 'Input').val(ui.item.value);updateEntity(itemType, col, false);},
					change: function (event, ui) {if ($('#' + makeId(col) + 'Input').val() == '') updateEntity(itemType, col, false);},
					source: function(request, response) {
						response(getSuggestions(request.term, selectColumns[col]['list']));
					}
				});
				input.val(item[col]);
				div.append(input);
			} else if (selectColumns[col]['input']) {
				var inputValues = [''];
				if (item[col] != null) {
					inputValues = item[col].split(' ');
				}
				var inputValue = '';
				var selectedValue = '';
				if (inputValues.length == 2) {
					inputValue = inputValues[0];
					selectedValue = inputValues[1];
				} else {
					selectedValue = inputValues[0];
				}
				var inputHidden = $('<input>');
				inputHidden.attr({'type': 'hidden',
					id: makeId(col) + 'Input'
					});
				div.append(inputHidden);
				var input = $('<input>');
				input.attr({'type': 'text',
					'size': 2,
					'maxlength': 4,
					'id': makeId(col) + 'Input_Input'});
				input.keyup({ 'itemType': itemType,
					'col': col
					},
					function(event) {checkUpdateButton(event, itemType, col);});
				input.val(inputValue);
				div.append(input);
				var select = $('<select>');
				select.attr({	id: makeId(col) + 'Input_Select',
								name: makeId(col) + 'Input_Select' });
				var option = $('<option>');
				option.text('');
				option.attr('value', '');
				select.append(option);
				$.each(selectColumns[col]['list'], function(i, value) {
					var option = $('<option>');
					option.text(value);
					option.attr('value', value);
					if (value == selectedValue) {
						option.attr('selected', 'selected');
					}
					select.append(option);
				});
				select.change({	itemType: itemType,
					col: col },
					function(event) {checkSelectUpdate(event, itemType, col);});
				div.append(select);
			} else {
				var select = $('<select>');
				select.attr({	id: makeId(col) + 'Input',
								name: makeId(col) + 'Input' });
				var option = $('<option>');
				option.text('');
				option.attr('value', '');
				select.append(option);
				$.each(selectColumns[col]['list'], function(i, value) {
					var option = $('<option>');
					option.text(value);
					option.attr('value', value);
					if (value == item[col]) {
						option.attr('selected', 'selected');
					}
					select.append(option);
				});
				select.change({	itemType: itemType,
					col: col },
					function(event) {updateEntity(event.data.itemType, event.data.col, false);});
				div.append(select);
			}
		} else if (multiValuesColumns.contains(col)) {
			if (item[col] != null && item[col] !== '') {
				var multiValues = item[col].split(';');
				var multiTable = $('<table>');
				div.append(multiTable);
				multiTable.attr('id', makeId(col) + 'MultiTable');
				multiTable.addClass('multiValues');
				$.each(multiValues, function(i, value) {
					var tr = $('<tr>');
					tr.attr('id', makeId(col)+'multiValuesTr'+i);
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
					valLabel.click(function(event) {editMultiValueItem(col, makeId(col)+'multiValuesTr'+i);});
					valLabel.html(value);
					var td = $('<td>');
					tr.append(td);
					var input = $('<input>');
					input.attr({'type': 'text',
						'placeholder': 'Add a tag...',
						'size': 30});
					input.keyup(function(event) {updateMultiValue(event, itemType, col, makeId(col)+'multiValuesTr'+i);});
					td.append(input);
					input.hide();
					var td = $('<td>');
					tr.append(td);
					var span = $('<span>');
					td.append(span);
					span.addClass('ui-icon ui-icon-circle-minus');
					span.click(function(event) {removeMultiValue(event, itemType, col, makeId(col)+'multiValuesTr'+i);});
				});
			}
			var input = $('<input>');
			input.attr({'type': 'text',
				'id': makeId(col) + 'Input',
				'placeholder': 'Add a tag...',
				'size': 30});
			input.keyup(function(event) {checkMultiValueButton(event, itemType, col);});
			div.append(input);
			label.hide();
		} else {
			var input = $('<input>');
			input.hide();
			input.attr({'type': 'text',
				'id': makeId(col) + 'Input',
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
	$.each($('label', $('#'+makeId(col)+'MultiTable')), function(i, label) {
		if ($(label).html() !== '') {
			values.push($(label).html());
		}
	});
	return values;
}

function removeMultiValue(event, itemType, col, trId) {
	$('#'+trId).remove();
	var values = getMultiValue(col);
	$('#'+makeId(col) + 'Label').html(values.join(';'));
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
			$('#'+makeId(col) + 'Label').html(values.join(';'));
			updateEntity(itemType, col, true);
		}
	} else if (event.which == 27) {
		// ESCAPE character
		updateEntity(itemType, col, true);
	}
}

function checkMultiValueButton(event, itemType, col) {
	if (event.which == 13) {
		var input = $('#'+makeId(col) + 'Input');
		var value = input.val().replace(/^\s*/, "").replace(/\s*$/, "");
		if (value !== '') {
			var values = getMultiValue(col);
			values.push(value);
			$('#'+makeId(col) + 'Label').html(values.join(';'));
			updateEntity(itemType, col, true);
		}
	}
}

function checkSaveButton(event, itemType, col) {
	if (event.which == 13) {
		updateEntity(itemType, col, false);
	} else if (event.which == 27) {
		// ESCAPE character
		$('#'+makeId(col) + 'Input').hide();
		$('#'+makeId(col) + 'Label').show();
	}
}

function checkUpdateButton(event, itemType, col) {
	if (event.which == 13) {
		$('#'+makeId(col) + 'Input').val($('#'+makeId(col) + 'Input_Input').val() + ' '+ $('#'+makeId(col) + 'Input_Select').val());
		updateEntity(itemType, col, false);
	}
}

function checkSelectUpdate(event, itemType, col) {
	$('#'+makeId(col) + 'Input').val($('#'+makeId(col) + 'Input_Input').val() + ' ' + $('#'+makeId(col) + 'Input_Select').val());
	updateEntity(itemType, col, false);
}

function editMultiValueItem(col, trId) {
	$('label', $('#' + makeId(col) + 'MultiTable')).hide();
	$('span', $('#' + makeId(col) + 'MultiTable')).hide();
	$('#' + makeId(col) + 'Input').hide();
	var input = $($('input', $('#'+trId))[0]);
	var label = $($('label', $('#'+trId))[0]);
	input.val(label.html());
	input.show();
}

function editItem(col) {
	$('#' + makeId(col) + 'Input').val($('#' + makeId(col) + 'Label').html());
	$('#' + makeId(col) + 'Input').show();
	$('#' + makeId(col) + 'Label').hide();
}

function displayScan(img, image) {
	displayEntity('Scan', image);
	$('#transferButton').unbind('click');
	$('#transferButton').click(function(event) {transferImage(image);});
	$('#transferButton').show();
	$('#enlargeButton').unbind('click');
	if (image['Zoomify'] != null) {
		$('#enlargeButton').click(function(event) {enlargeImage(img, image);});
		$('#enlargeButton').removeAttr('disabled');
		$('#enlargeButton').removeClass('disabledButton');
	} else {
		$('#enlargeButton').attr('disabled', 'disabled');
		$('#enlargeButton').addClass('disabledButton');
	}
	$('#enlargeButton').show();
	$('#deleteScanButton').show();

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
	button.attr('id', 'deleteExperimentButton');
	button.attr('context', 'centerPanelBottom');
	button.html('Delete Experiment');
	button.button({icons: {secondary: 'ui-icon-alert alert_background'}}).click(function(event) {deleteExperiment();});
	button.addClass('deleteButton');

	button = $('<button>');
	panel.append(button);
	button.attr('id', 'createSlideButton');
	button.attr('context', 'centerPanelBottom');
	button.html('New Slide(s)');
	button.button({icons: {primary: 'ui-icon-newwin'}}).click(function(event) {createSlide();});

	button = $('<button>');
	panel.append(button);
	button.attr('id', 'createTermButton');
	button.attr('context', 'centerPanelBottom');
	button.html('New Term');
	button.button({icons: {primary: 'ui-icon-newwin'}}).click(function(event) {createTerm();});

	var button = $('<button>');
	panel.append(button);
	button.attr('id', 'deleteTermButton');
	button.attr('context', 'centerPanelBottom');
	button.html('Delete Term');
	button.button({icons: {secondary: 'ui-icon-alert alert_background'}}).click(function(event) {deleteTerm();});
	button.addClass('deleteButton');

	var button = $('<button>');
	panel.append(button);
	button.attr('id', 'saveTermButton');
	button.attr('context', 'centerPanelBottom');
	button.html('Create');
	button.button({icons: {secondary: 'ui-icon-newwin'}}).click(function(event) {saveTerm();});

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
	button.attr('id', 'deleteScanButton');
	button.attr('context', 'centerPanelBottom');
	button.html('Delete Scan');
	button.button({icons: {secondary: 'ui-icon-alert alert_background'}}).click(function(event) {deleteScan();});
	button.addClass('deleteButton');

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
	button.attr('id', 'deleteSlideButton');
	button.attr('context', 'centerPanelBottom');
	button.html('Delete Slide');
	button.button({icons: {secondary: 'ui-icon-alert alert_background'}}).click(function(event) {deleteSlide();});
	button.addClass('deleteButton');

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
	button.html('Get Status');
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
	button.attr('id', 'deleteSpecimenButton');
	button.html('Delete Specimen');
	button.button({icons: {secondary: 'ui-icon-alert alert_background'}}).click(function(event) {deleteSpecimen();});
	button.addClass('deleteButton');

	$('#deleteSpecimenButton').hide();

	var button = $('<button>');
	panel.append(button);
	button.attr('id', 'printSpecimenButton');
	button.html('Print Specimen');
	button.button({icons: {primary: 'ui-icon-tag'}}).click(function(event) {submitPrintSpecimen();});

	$('#printSpecimenButton').hide();
}

function editEntity(item) {
	var cols = null;
	if (item == 'Scan') {
		cols = scanEditColumns;
	} else if (item == 'Slide') {
		cols = slideEditColumns;
	} else if (item == 'Specimen') {
		cols = specimenEditColumns;
	} else if (item == 'Experiment') {
		cols = experimentEditColumns;
	}
	$.each(cols, function(i, col) {
		$('#' + makeId(col) + 'Input').val($('#' + makeId(col) + 'Label').html());
		$('#' + makeId(col) + 'Input').show();
		$('#' + makeId(col) + 'Label').hide();
	});

	$('#printSpecimenButton').hide();
	$('#deleteSpecimenButton').hide();
}

function updateEntity(item, column, isMultiValue) {
	if (item == 'Slide' && $('td', $('#slidesTable')).find('input:checked').length > 1) {
		updateEntityParameters = {
				'item': item,
				'column': column,
				'isMultiValue': isMultiValue
		};
		$('#dialog-confirm').html('Do you want to apply the update to all the selected slides?');
		$('#dialog-confirm').dialog('open');
	} else {
		proceedUpdateEntity(item, column, isMultiValue, false);
	}
}

function proceedUpdateEntity(item, column, isMultiValue, answer) {
	var cols = null;
	var editCols = null;
	if (item == 'Scan') {
		cols = scanColumns;
		editCols = scanEditColumns;
	} else if (item == 'Slide') {
		cols = slideColumns;
		editCols = slideEditColumns;
	} else if (item == 'Specimen') {
		cols = specimenColumns;
		editCols = specimenEditColumns;
	} else if (item == 'Experiment') {
		cols = experimentColumns;
		editCols = experimentEditColumns;
	}

	var url = ERMREST_HOME + '/' + item;
	var arr = [];
	if (item == 'Slide' && answer) {
		$.each($('td', $('#slidesTable')).find('input:checked'), function(i, entry) {
			var slideId = $(entry).attr('slideId');
			var obj = new Object();
			$.each(cols, function(i, col) {
				if (col == column) {
					if (!isMultiValue) {
						obj[col] = $('#' + makeId(col) + 'Input').val();
					} else {
						obj[col] = $('#' + makeId(col) + 'Label').html();
					}
					if (obj[col] == '') {
						delete obj[col];
					}
				} else {
					obj[col] = slidesDict[slideId][col];
				}
			});
			arr.push(obj);
		});
		
	} else {
		var obj = new Object();
		$.each(cols, function(i, col) {
			if (col == column && !isMultiValue) {
				obj[col] = $('#' + makeId(col) + 'Input').val();
			} else {
				obj[col] = $('#' + makeId(col) + 'Label').html();
			}
			if (obj[col] == '') {
				delete obj[col];
			}
		});
		arr.push(obj);
	}
	cirmAJAX.PUT(url, 'application/json', false, arr, true, postUpdateEntity, {'item': item}, null, 0);
}

function postUpdateEntity(data, textStatus, jqXHR, param) {
	var item = param['item'];
	var colDict = null;
	var colList = null;
	var cols = null;
	if (item == 'Scan') {
		colDict = scansDict;
		colList = scansList;
		cols = scanColumns;
	} else if (item == 'Slide') {
		colDict = slidesDict;
		colList = slidesList;
		cols = slideColumns;
	} else if (item == 'Specimen') {
		newSpecimenId = updatedSpecimenId = data[0]['ID'];
		getSpecimens(null);
		return;
		//colDict = specimensDict;
		//colList = specimensList;
		//cols = specimenColumns;
	} else if (item == 'Experiment') {
		colDict = experimentsDict;
		colList = experimentsList;
		cols = experimentColumns;
	}

	$.each(data, function(i, entity) {
		colDict[entity['ID']] = entity;
	});
	var temp = [];
	$.each(colList, function(i, col) {
		temp.push(colDict[col['ID']]);
	});
	colList = temp;
	if (item == 'Slide') {
		updateRowData(slideColumns, slideEditColumns, data);
	}
	displayEntity(item, data[0]);
	$('#printSpecimenButton').hide();
	$('#deleteSpecimenButton').hide();
	if (item == 'Scan') {
		$('#transferButton').show();
		$('#enlargeButton').show();
		$('#deleteScanButton').show();
	} else if (item == 'Specimen') {
		$('#printSpecimenButton').show();
		$('#deleteSpecimenButton').show();
		if ($('tbody tr', $('#slidesTable')).length > 0) {
			$('#deleteSpecimenButton').attr('disabled', 'disabled');
			$('#deleteSpecimenButton').addClass('disabledButton');
		} else {
			$('#deleteSpecimenButton').removeAttr('disabled');
			$('#deleteSpecimenButton').removeClass('disabledButton');
		}
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
	var czi = image['HTTP URL'];
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

function entityNode(entity) {
	return {'entityId': entity,
		'display': entity};
}

function specimenNode(specimen) {
	return {'entityId': specimen['ID'],
		'display': specimenDisplayName(specimen)};
}

function experimentNode(experiment) {
	return {'entityId': experiment['ID'],
		'display': experimentDisplayName(experiment)};
}

function specimenDisplayName(specimen) {
	return specimen['Sample Name'] + '-' + specimen['Initials'] + '-' + specimen['Section Date'];
}

function experimentDisplayName(experiment) {
	return experiment['Experiment Description'] + '-' + experiment['Initials'] + '-' + experiment['Experiment Date'];
}

function compareSpecimens(item1, item2) {
	var val1 = specimenDisplayName(item1);
	var val2 = specimenDisplayName(item2);
	return compareIgnoreCase(val1, val2);
}

function compareExperiments(item1, item2) {
	var val1 = experimentDisplayName(item1);
	var val2 = experimentDisplayName(item2);
	return compareIgnoreCase(val1, val2);
}

function compareIds(item1, item2) {
	var val1 = item1['ID'];
	var val2 = item2['ID'];
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
	$('#cancelCreateButton').click(function(event) {backupRightPanel(); appendSlides('Specimen');});
	$('#cancelCreateButton').show();
	$('#centerPanelMiddle').hide();
	$('#centerPanelTop').show();
	$('#globusTransferButton').hide();
	$('#deleteSlideButton').hide();
	$('#printSpecimenButton').hide();
	$('#deleteSpecimenButton').hide();
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
	gridDiv.height($('#centerPanel').height()*60/100);
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
		'checked': 'checked',
		'id': 'selectAllFilesTh'});
	input.click(function(event) {checkUncheckAll('filesTable', 'selectAllFilesTh', ['submitButton']);});
	th.append(input);
	//th.hide();
	$.each(filesTableColumns, function(i, col) {
		var th = $('<th>');
		if (fileClassValue[col] != null) {
			th.addClass(fileClassValue[col]);
		}
		tr.append(th);
		th.html(col);
	});
	var tfoot = $('<tfoot>');
	table1.append(tfoot);
	var tr = $('<tr>');
	tfoot.append(tr);
	var td = $('<td>');
	td.addClass('no_padding');
	tr.append(td);
	td.attr('colspan', 0);
	var tableFooterDiv = $('<div>');
	td.append(tableFooterDiv);
	tableFooterDiv.addClass('footnote');
	var tbody = $('<tbody>');
	table1.append(tbody);
	var scanFiles = {
			'filesCount': 0,
			'filesSize': 0
	}
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
		//td.hide();
		$.each(filesTableColumns, function(j, col) {
			var td = $('<td>');
			if (fileClassValue[col] != null) {
				td.addClass(fileClassValue[col]);
			}
			tr.append(td);
			if (fileDisplayValue[col] != null) {
				fileDisplayValue[col](td, filesDict[file], scanFiles);
			} else {
				td.html(filesDict[file][col]);
			}
		});
	});
	tableFooterDiv.html(scanFiles['filesCount'] + ' file(s), Total size: ' + getSize('file', scanFiles['filesSize']));
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
	
	var tr = $('<tr>');
	table.append(tr);
	var td = $('<td>');
	tr.append(td);
	td.addClass('tag');
	td.html('Deadline (minutes)');
	var td = $('<td>');
	tr.append(td);
	var input = $('<input>');
	input.attr({'id': 'transferDeadline',
		'type': 'text',
		'size': 5});
	td.append(input);
	input.val('10');
	
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
	$('#deleteSlideButton').hide();
	$('#refreshActivityButton').attr('disabled', 'disabled');
	$('#refreshActivityButton').addClass('disabledButton');
	$('#refreshActivityButton').show();
	$('#printSpecimenButton').hide();
	$('#deleteSpecimenButton').hide();
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
	if (ACTIVITY_TASK_ID != null) {
		displayTaskStatus(ACTIVITY_TASK_ID);
		ACTIVITY_TASK_ID = null;
	}
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
	if ($('.highlighted', $('#SpecimenDiv')).length > 0) {
		ret = 'Specimen';
	} else if ($('.highlighted', $('#ExperimentDiv')).length > 0) {
		ret = 'Experiment';
	} else if ($('.highlighted', $('#SearchDiv')).length > 0) {
		ret = 'search';
	}
	return ret;
}

function globusTasks(fromRefresh) {
	if (!fromRefresh) {
		$('#rightPanelTop').html('');
		$('#printSpecimenButton').hide();
		$('#deleteSpecimenButton').hide();
	}
	$('button', $('#rightPanelBottom')).hide();
	$('button[context="centerPanelBottom"]').hide();
	var currentState = history.state;
	if (currentState != null && currentState['query'] != 'transfer') {
		pushHistoryState('globus', '', 'query=globus', null);
	}
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
	$('#printSpecimenButton').hide();
	$('#deleteSpecimenButton').hide();
	var centerPanel = $('#centerPanelTop');
	centerPanel.html('<p class="intro"></p>');
	var p = $('<p>');
	p.addClass('center');
	centerPanel.append(p);
	var button = $('<button>');
	p.append(button);
	button.html('Specimen Labels Printer');
	button.button({icons: {primary: 'ui-icon-print'}}).click(function(event) {printerManaging('Specimen');});
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
		PRINTER_ADDR = SPECIMEN_PRINTER_ADDR;
		PRINTER_PORT = SPECIMEN_PRINTER_PORT;
		centerPanel.html('<p class="intro">Specimen Labels Printer</p>');
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
	$('#printSpecimenButton').hide();
	$('#deleteSpecimenButton').hide();
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
	$('#printSpecimenButton').hide();
	$('#deleteSpecimenButton').hide();
}

function updatePrinterSettings() {
	PRINTER_ADDR = $('#printerAddrInput').val();
	PRINTER_PORT = parseInt($('#printerPortInput').val());
	if (isSlidePrinter) {
		SLIDE_PRINTER_ADDR = PRINTER_ADDR;
		SLIDE_PRINTER_PORT = PRINTER_PORT;
	} else {
		SPECIMEN_PRINTER_ADDR = PRINTER_ADDR;
		SPECIMEN_PRINTER_PORT = PRINTER_PORT;
	}
	cancelPrinterSettings();
}

function cancelPrinterSettings() {
	var rightPanel = $('#rightPanelTop');
	rightPanel.html('');
	$('button', $('#rightPanelBottom')).hide();
	$('#printSpecimenButton').hide();
	$('#deleteSpecimenButton').hide();
}

function managePrinter(param) {
	var url = PRINTER_HOME + (isSlidePrinter ? 'Slide' : 'Specimen') + '/control/' + encodeSafeURIComponent(param) + '/';
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
	$.each(item, function(col, value) {
		if (value != null && !$.isPlainObject(value)) {
			cols.push(col);
			if (timestampsColumns.contains(col)) {
				item[col] = getLocaleTimestamp(item[col]);
			} else {
				item[col] = JSON.stringify(item[col]);
			}
		}
	});
	cols.sort(compareIgnoreCase);
	displayItem(cols, item, itemType);
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
	input.autocomplete({
		select: function (event, ui) {$('#experimentRI').val(ui.item.value);checkExperimentSaveButton();},
		search: function (event, ui) {checkExperimentSaveButton();},
		minLength: 0,
		source: function(request, response) {
			response(getSuggestions(request.term, experimentsInitialsList));
		}
	});

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
	input.val('0');
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
	$('#printSpecimenButton').hide();
	$('#deleteSpecimenButton').hide();
	$('#centerPanelMiddle').hide();
	$('#centerPanelTop').show();
	$('#globusTransferButton').hide();
	$('#deleteSlideButton').hide();
}

function displaySlide(id) {
	var rightPanel = $('#rightPanelTop');
	rightPanel.html('');
	var currentState = history.state;
	if (currentState != null && SCAN_HISTORY.contains(currentState['query'])) {
		pushHistoryState('Scan', '', 
				'query=Scan&Slide='+encodeSafeURIComponent(id), 
				{'Slide': id});
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
	} else {
		var index = li.html().indexOf(' ');
		termsManaging(li.html().substr(index+1));
	}
}

function displaySpecimen(ul, li) {
	$('li', $('#leftPanel')).removeClass('highlighted');
	li.addClass('highlighted');
	$('#centerPanelTop').html('');
	$('button[context="centerPanelBottom"]').hide();
	displayEntity('Specimen', specimensDict[li.attr('entityId')]);
	entityStack = [];
	getSlides(li.attr('entityId'));
}

function displayExperiment(ul, li) {
	$('li', $('#leftPanel')).removeClass('highlighted');
	li.addClass('highlighted');
	$('#centerPanelTop').html('');
	$('button[context="centerPanelBottom"]').hide();
	displayEntity('Experiment', experimentsDict[li.attr('entityId')]);
	entityStack = [];
	getExperimentSlides(li.attr('entityId'));
}

function displaySearch(ul, li) {
	$('li', $('#leftPanel')).removeClass('highlighted');
	li.addClass('highlighted');
	$('#rightPanelTop').html('');
	$('#centerPanelTop').html('');
	$('#printSpecimenButton').hide();
	$('#deleteSpecimenButton').hide();
	$('button', $('#rightPanelBottom')).hide();
	$('button[context="centerPanelBottom"]').hide();
	entityStack = [];
	getSearchSlides(getSearchExpression(li.html(), '&'), li.html());
}

function displaySpecimensSlides(ul, li) {
	$('li', $('#leftPanel')).removeClass('highlighted');
	li.addClass('highlighted');
	$('#rightPanelTop').html('');
	$('#centerPanelTop').html('');
	$('#printSpecimenButton').hide();
	$('#deleteSpecimenButton').hide();
	$('button', $('#rightPanelBottom')).hide();
	$('button[context="centerPanelBottom"]').hide();
	entityStack = [];
	getSpecimensSlides(li.html());
}

function checkSpecimenSaveButton() {
	if ($('#specimenDate').val().replace(/^\s*/, "").replace(/\s*$/, "").length > 0 &&
		$('tr', $('#geneTable')).length > 0 &&
		$('#specimenIdentifier').val().replace(/^\s*/, "").replace(/\s*$/, "").length > 0 &&
		$('#specimenRI').val().replace(/^\s*/, "").replace(/\s*$/, "").length > 0 &&
		$('#specimenDisambiguator').val().replace(/^\s*/, "").replace(/\s*$/, "").length > 0) {
		$('#createButton').removeAttr('disabled');
		$('#createButton').removeClass('disabledButton');
	} else {
		$('#createButton').attr('disabled', 'disabled');
		$('#createButton').addClass('disabledButton');
	}
}

function checkTermSaveButton() {
	if ($('#termLabel').val().replace(/^\s*/, "").replace(/\s*$/, "").length > 0 &&
		$('#termCode').val().replace(/^\s*/, "").replace(/\s*$/, "").length > 0) {
		$('#saveTermButton').removeAttr('disabled');
		$('#saveTermButton').removeClass('disabledButton');
	} else {
		$('#saveTermButton').attr('disabled', 'disabled');
		$('#saveTermButton').addClass('disabledButton');
	}
}

function getSuggestions(input, table) {
	var ret = [];
	var pattern = new RegExp('^' + input, 'i');
	$.each(table, function(i, val) {
		if (pattern.test(val)) {
			ret.push(val);
		}
	});
	return ret;
}

function createSpecimen() {
	$('li', $('#leftPanel')).removeClass('highlighted');
	$('#rightPanelTop').html('');
	$('button', $('#rightPanelBottom')).hide();
	var centerPanel = $('#centerPanelTop');
	centerPanel.html('');
	centerPanel.append(CIRM_NEW_SPECIMEN);
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
	input.attr({'id': 'specimenDate',
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
	input.change(function(event) {checkSpecimenSaveButton();});

	var tr = $('<tr>');
	table.append(tr);
	var td = $('<td>');
	tr.append(td);
	td.addClass('tag');
	td.html('Researcher Initials:');
	var td = $('<td>');
	tr.append(td);
	var input = $('<input>');
	input.attr({'id': 'specimenRI',
		'maxlength': '3',
		'type': 'text'});
	td.append(input);
	input.autocomplete({
		select: function (event, ui) {$('#specimenRI').val(ui.item.value);checkSpecimenSaveButton();},
		search: function (event, ui) {checkSpecimenSaveButton();},
		minLength: 0,
		source: function(request, response) {
			response(getSuggestions(request.term, specimensInitialsList));
		}
	});

	var tr = $('<tr>');
	table.append(tr);
	var td = $('<td>');
	tr.append(td);
	td.addClass('tag');
	td.html('Disambiguator:');
	var td = $('<td>');
	tr.append(td);
	var input = $('<input>');
	input.attr({'id': 'specimenDisambiguator',
		'maxlength': '1',
		'type': 'text'});
	td.append(input);
	input.val('0');
	input.keyup(function(event) {checkSpecimenSaveButton();});

	var tr = $('<tr>');
	table.append(tr);
	var td = $('<td>');
	tr.append(td);
	td.addClass('tag');
	td.html('Comment:');
	var td = $('<td>');
	tr.append(td);
	var input = $('<input>');
	input.attr({'id': 'specimenComment',
		'type': 'text'});
	td.append(input);

	var tr = $('<tr>');
	table.append(tr);
	var td = $('<td>');
	tr.append(td);
	td.addClass('tag');
	td.html('Specimen Identifier:');
	var td = $('<td>');
	tr.append(td);
	var select = $('<select>');
	select.attr({	id: 'specimenIdentifier',
					name: 'specimenIdentifier' });
	$.each(speciemenIdentifierList, function(i, value) {
		var option = $('<option>');
		option.text(value);
		option.attr('value', value);
		select.append(option);
	});
	select.change(function () {$('#specimenGenotype').val(genSampleName());});
	td.append(select);
	var img = $('<img>');
	td.append(img);
	img.attr({'alt': 'New Specimen Identifier',
		'src': '/cirm/images/new.jpeg',
		'width': 20,
		'height': 15
		});
	img.addClass('new');
	img.click(function(event) {newTerm('Specimen Identifier');});

	var tr = $('<tr>');
	table.append(tr);
	var td = $('<td>');
	tr.append(td);
	td.addClass('tag');
	td.html('Species:');
	var td = $('<td>');
	tr.append(td);
	var select = $('<select>');
	select.attr({	id: 'specimenSpecies',
					name: 'specimenSpecies' });
	$.each(speciesList, function(i, value) {
		var option = $('<option>');
		option.text(value);
		option.attr('value', value);
		if (value == 'Mouse') {
			option.attr('selected', 'selected');
		}
		select.append(option);
	});
	select.change(function () {$('#specimenGenotype').val(genSampleName());});
	td.append(select);
	var img = $('<img>');
	td.append(img);
	img.attr({'alt': 'New Species',
		'src': '/cirm/images/new.jpeg',
		'width': 20,
		'height': 15
		});
	img.addClass('new');
	img.click(function(event) {newTerm('Species');});

	var tr = $('<tr>');
	table.append(tr);
	var td = $('<td>');
	tr.append(td);
	td.addClass('tag');
	td.html('Tissue:');
	var td = $('<td>');
	tr.append(td);
	var select = $('<select>');
	select.attr({	id: 'specimenTissue',
					name: 'specimenTissue' });
	$.each(tissueList, function(i, value) {
		var option = $('<option>');
		option.text(value);
		option.attr('value', value);
		select.append(option);
	});
	select.change(function () {$('#specimenGenotype').val(genSampleName());});
	td.append(select);
	var img = $('<img>');
	td.append(img);
	img.attr({'alt': 'New Tissue',
		'src': '/cirm/images/new.jpeg',
		'width': 20,
		'height': 15
		});
	img.addClass('new');
	img.click(function(event) {newTerm('Tissue');});

	var tr = $('<tr>');
	table.append(tr);
	var td = $('<td>');
	tr.append(td);
	td.addClass('tag');
	td.html('Age:');
	var td = $('<td>');
	tr.append(td);
	var input = $('<input>');
	input.attr({	id: 'specimenAgeNumber',
		name: 'specimenAgeNumber', 'maxlength': 4, 'size': 2 });
	input.keyup(function () {$('#specimenGenotype').val(genSampleName());});
	td.append(input);
	var select = $('<select>');
	select.attr({	id: 'specimenAge',
					name: 'specimenAge' });
	$.each(ageList, function(i, value) {
		var option = $('<option>');
		option.text(value);
		option.attr('value', value);
		select.append(option);
	});
	select.change(function () {$('#specimenGenotype').val(genSampleName());});
	td.append(select);
	var img = $('<img>');
	td.append(img);
	img.attr({'alt': 'New Age Unit',
		'src': '/cirm/images/new.jpeg',
		'width': 20,
		'height': 15
		});
	img.addClass('new');
	img.click(function(event) {newTerm('Age');});

	var tr = $('<tr>');
	table.append(tr);
	var td = $('<td>');
	td.addClass('tag top');
	td.html('Gene:');
	tr.append(td);
	var td = $('<td>');
	tr.append(td);
	var geneValuesTable = $('<table>');
	td.append(geneValuesTable);
	var geneTr = $('<tr>');
	geneValuesTable.append(geneTr);
	var geneTd = $('<td>');
	geneTr.append(geneTd);
	
	/*
	var select = $('<select>');
	select.attr({	id: 'specimenGene',
					name: 'specimenGene' });
	$.each(geneList, function(i, value) {
		var option = $('<option>');
		option.text(value);
		option.attr('value', value);
		select.append(option);
	});
	td.append(select);
	*/
	var input = $('<input>');
	input.attr({	id: 'specimenGene',
		name: 'specimenGene' });
	geneTd.append(input);
	input.autocomplete({
		select: function (event, ui) {addGene(ui.item.value);},
		close: function (event, ui) {$('#specimenGene').val('');},
		minLength: 0,
		source: function(request, response) {
			response(getSuggestions(request.term, geneList));
		}
	});
	var img = $('<img>');
	geneTd.append(img);
	img.attr({'alt': 'New Gene',
		'src': '/cirm/images/new.jpeg',
		'width': 20,
		'height': 15
		});
	img.addClass('new');
	img.click(function(event) {newTerm('Gene');});
	var geneTr = $('<tr>');
	geneValuesTable.append(geneTr);
	var geneTd = $('<td>');
	geneTr.append(geneTd);
	var geneTable = $('<table>');
	geneTable.attr('id', 'geneTable');
	geneTable.addClass('normal');
	geneTd.append(geneTable);

	var tr = $('<tr>');
	table.append(tr);
	var td = $('<td>');
	tr.append(td);
	td.addClass('tag');
	td.html('Sample Name:');
	var td = $('<td>');
	tr.append(td);
	var input = $('<input>');
	input.attr({'id': 'specimenGenotype',
		'maxlength': '15',
		'type': 'text'});
	td.append(input);
	input.val(genSampleName());
	input.keyup(function(event) {checkSpecimenSaveButton();});

	$('button[context="centerPanelBottom"]').hide();
	$('#cancelCreateButton').unbind('click');
	$('#cancelCreateButton').click(function(event) {clear();});
	$('#cancelCreateButton').show();
	$('#createButton').unbind('click');
	$('#createButton').click(function(event) {saveSpecimen();});
	$('#createButton').show();
	$('#createButton').attr('disabled', 'disabled');
	$('#createButton').addClass('disabledButton');
	$('#printSpecimenButton').hide();
	$('#deleteSpecimenButton').hide();
	$('#centerPanelMiddle').hide();
	$('#centerPanelTop').show();
	$('#globusTransferButton').hide();
	$('#deleteSlideButton').hide();
}

function saveSpecimen() {
	var gene = [];
	$.each($('tr', $('#geneTable')), function(i, tr) {
		gene.push($($('td', $(tr))[0]).html());
	});
	gene = gene.join(';');
	var specimenDate = $('#specimenDate').val().split('-').join('');
	var url = ERMREST_HOME + '/Specimen';
	var arr = [];
	var obj = new Object();
	obj['Section Date'] = $('#specimenDate').val();
	obj['Sample Name'] = $('#specimenGenotype').val();
	obj['Initials'] = $('#specimenRI').val();
	obj['Disambiguator'] = $('#specimenDisambiguator').val();
	obj['Comment'] = $('#specimenComment').val();
	obj['Specimen Identifier'] = $('#specimenIdentifier').val();
	obj['Species'] = $('#specimenSpecies').val();
	obj['Age'] = $('#specimenAgeNumber').val().replace(/^\s*/, "").replace(/\s*$/, "") + ' ' + $('#specimenAge').val();
	obj['Tissue'] = $('#specimenTissue').val();
	obj['Gene'] = gene;
	var id = [specimenDate, $('#specimenGenotype').val(), $('#specimenRI').val(), $('#specimenDisambiguator').val()].join('-');
	obj['ID'] = id;
	arr.push(obj);
	cirmAJAX.POST(url, 'application/json', false, arr, true, postSaveSpecimen, null, null, 0);
}

function postSaveSpecimen(data, textStatus, jqXHR, param) {
	data = $.parseJSON(data);
	newSpecimenId = data[0]['ID'];
	getSpecimens(null);
}

function saveExperiment() {
	var url = ERMREST_HOME + '/Experiment';
	var arr = [];
	var obj = new Object();
	obj['Experiment Date'] = $('#experimentDate').val();
	obj['Experiment Description'] = $('#experimentDescription').val();
	obj['Initials'] = $('#experimentRI').val();
	obj['Disambiguator'] = $('#experimentDisambiguator').val();
	obj['Comment'] = $('#experimentComment').val();
	var experimentDate = $('#experimentDate').val().split('-').join('');
	var id = [experimentDate, $('#experimentDescription').val(), $('#experimentRI').val(), $('#experimentDisambiguator').val()].join('-');
	obj['ID'] = id;
	arr.push(obj);
	cirmAJAX.POST(url, 'application/json', false, arr, true, postSaveExperiment, null, null, 0);
}

function postSaveExperiment(data, textStatus, jqXHR, param) {
	data = $.parseJSON(data);
	newExperimentId = data[0]['ID'];
	getSpecimens(null);
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
	var id = $($('.highlighted', $('#SpecimenDiv'))[0]).attr('entityId');
	var url = ERMREST_HOME + '/Slide';
	var arr = [];
	for (var i=0; i < slidesCount; i++) {
		var obj = new Object();
		obj['Specimen ID'] = id;
		obj['Seq.'] = sequence_num;
		obj['Rev.'] = $('#slideRevision').val();
		obj['Comment'] = $('#slideComment').val();
		var slideRevision = '' + $('#slideRevision').val();
		while (slideRevision.length < 3) {
			slideRevision = '0' + slideRevision;
		}
		var slideSequenceNumber = '' + sequence_num++;
		while (slideSequenceNumber.length < 2) {
			slideSequenceNumber = '0' + slideSequenceNumber;
		}
		var slideId = [id, slideSequenceNumber, slideRevision].join('-');
		obj['ID'] = slideId;
		arr.push(obj);
	}
//alert(JSON.stringify(arr));
	cirmAJAX.POST(url, 'application/json', false, arr, true, postSaveSlide, null, null, 0);
}

function postSaveSlide(data, textStatus, jqXHR, param) {
	data = $.parseJSON(data);
	$.each(data, function(i, item) {
		slidesList.push(item);
		slidesDict[item['ID']] = item;
	});
	appendSlides(getSlidesType());
}

function submitTransfer() {
	$('#rightPanelTop').html('');
	$('button', $('#rightPanelBottom')).hide();
	var url = ERMREST_HOME + '/Scan/';
	var slides = [];
	$.each($('td', $('#slidesTable')).find('input:checked'), function(i, checkbox) {
		slides.push('Slide ID=' + encodeSafeURIComponent($(checkbox).attr('slideId')));
	});
	url += slides.join(';');
	cirmAJAX.GET(url, 'application/x-www-form-urlencoded; charset=UTF-8', true, postSubmitTransfer, null, null, 0);
}

function postSubmitTransfer(data, textStatus, jqXHR, param) {
	var files = [];
	filesDict = {};
	$.each(data, function(i, scan) {
		var filename = scan['Filename'];
		if (!files.contains(filename)) {
			files.push(filename);
			filesDict[filename] = scan;
		}
	});
	files.sort(compareIgnoreCase);
	pushHistoryState(null, '', '', null);
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
	var transferDeadline = parseInt($('#transferDeadline').val());
	if (isNaN(transferDeadline)) {
		alert('Invalid value for the transfer deadline: "' + $('#transferDeadline').val() + '".');
		return;
	}
	$('#submitButton').attr('disabled', 'disabled');
	$('#submitButton').addClass('disabledButton');
	var endpoint_1 = null;
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
	obj['endpoint_2'] = endpoint_2;
	if ($('#transferLabelInput').val().replace(/^\s*/, "").replace(/\s*$/, "").length > 0) {
		obj['label'] = $('#transferLabelInput').val().replace(/^\s*/, "").replace(/\s*$/, "");
	}
	obj['deadline'] = transferDeadline;
	obj['files'] = files;
	var arr = [];
	var fileNames = {};
	$.each(files, function(i, file) {
		var scan = filesDict[file];
		if (endpoint_1 == null) {
			endpoint_1 = scan['GO Endpoint'];
			obj['endpoint_1'] = endpoint_1;
		}
		if (endpoint_1 == scan['GO Endpoint']) {
			var item = {};
			item['file_from'] = scan['GO Path'];
			var fileName = scan['Original Filename'];
			if (fileNames[fileName] == null) {
				fileNames[fileName] = 0;
			} else {
				var parts = fileName.split('.czi');
				fileName = parts[0] + '_' + ++fileNames[fileName] + '.czi';
			}
			item['file_to'] = destDir + fileName;
			arr.push(item);
		}
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
		pushHistoryState('transfer', '', 'query=transfer&id='+encodeSafeURIComponent(data['task_id']), {'ID': data['task_id']});
		getTaskStatus(data['task_id']);
	} else {
		alert(data['error']);
	}
}

function displayTaskStatus(id) {
	pushHistoryState('transfer', '', 'query=transfer&id='+encodeSafeURIComponent(id), {'ID': id});
	getTaskStatus(id);
}

function submitPrintSlide() {
	var url = PRINTER_HOME + 'slide/job';
	var arr = [];
	$.each($('td', $('#slidesTable')).find('input:checked'), function(i, checkbox) {
		var slide = slidesDict[$(checkbox).attr('slideId')];
		var specimen = specimensDict[slide['Specimen ID']];
		var experiment = experimentsDict[slide[slideExperimentColumn]];
		var obj = new Object();
		obj['Rev.'] = slide['Rev.'];
		obj['Seq.'] = slide['Seq.'];
		obj['Experiment'] = slide[slideExperimentColumn];
		obj['Experiment Date'] = experiment['Experiment Date'];
		obj['Sample Name'] = specimen['Sample Name'];
		obj['Experiment Description'] = experiment['Experiment Description'];
		obj['Initials'] = experiment['Initials'];
		obj['ID'] = slide['ID'];
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

function submitPrintSpecimen() {
	var url = PRINTER_HOME + 'specimen/job';
	var arr = [];
	var specimen = specimensDict[$($('.highlighted', $('#SpecimenDiv'))[0]).attr('entityId')];
	var obj = {};
	$.each(specimenColumns, function(i, col) {
		obj[col] = specimen[col];
	});
	obj['printer_id'] = SPECIMEN_PRINTER_ADDR;
	obj['printer_port'] = SPECIMEN_PRINTER_PORT;
	arr.push(obj);
	cirmAJAX.POST(url, 'application/json', false, arr, true, postSubmitPrintSpecimen, null, null, 0);
}

function postSubmitPrintSpecimen(data, textStatus, jqXHR, param) {
	data = $.parseJSON(data)[0];
	if (data[CXI_RET] <= 0) {
		alert('An error was reported in sending the request for printing the specimen label.\nReason: '+data[CXI_MSG]);
	} else {
		alert('The request for printing the specimen label was submitted successfully.');
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
	$('#printSpecimenButton').hide();
	$('#deleteSpecimenButton').hide();
	$('button[context="centerPanelBottom"]').hide();
	$('button', $('#rightPanelBottom')).hide();
	$('#search').val('');
	$('#centerPanelMiddle').hide();
	$('#centerPanelTop').show();
}

function pushHistoryState(query, title, url, params) {
	if (query == null) {
		if (!testEqual(LAST_STATE, {})) {
			history.pushState({}, title, CIRM_HOME+'#'+url);
			LAST_STATE = {};
		}
	} else {
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
			LAST_STATE = state;
		}
	}
}

function goBack(event) {
	var state = event.state;
	if (state != null && state['query'] != null) {
		$('#welcomeLink').html('Welcome ' + state['user'] + '!');
		if (!testEqual(LAST_STATE, state)) {
			renderQuery(state);
			LAST_STATE = state;
		} else {
			history.back();
		}
	} else {
		//history.back();
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

function getPageState() {
	var state = {};
	var parts = PAGE_URL.split('&');
	$.each(parts, function(i, part) {
		var param = part.split('=');
		state[param[0]] = decodeURIComponent(param[1]);
	});
	return state;
}

function initPage() {
	var state = getPageState();
	PAGE_URL = null;
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
	} else if (query == 'Specimen') {
		selectSlideSpecimen(state['ID']);
	} else if (query == 'Experiment') {
		selectSlideExperiment(state['ID']) ;
	} else if (query == 'search') {
		selectSearch(state['keywords']);
	} else if (query == 'Scan') {
		displaySlide(state['Slide']);
	} else if (query == 'globus') {
		selectTransfer();
	} else if (query == 'transfer') {
		ACTIVITY_TASK_ID = state['ID'];
		selectTransfer();
	} else if (query == 'Slide') {
		SLIDE_VIEW = state['view'];
		selectSlideView();
	}
}

function updateRowData(columns, editColumns, data) {
	$.each(data, function(i, entity) {
		var slideId = entity['ID'];
		var tr = $($('input[slideId='+slideId+']', $('#slidesTable'))).parent().parent();
		$.each(editColumns, function(j, col) {
			var index = getColumnPosition(columns, col);
			updateRow(tr, index, entity[col]);
		});
	});
}

function getColumnPosition(table, col) {
	var ret = 0;
	$.each(table, function(i, name) {
		if (name == col) {
			ret = i+3;
			return false;
		}
	});
	return ret;
}

function updateRow(tr, index, value) {
	$('td:nth-child('+index+')', tr).html(value);
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

function getTableColumns(table) {
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

function makeId(id) {
	var val = id;
	$.each(ID_ESCAPE, function(i,c) {
		val = val.replace(new RegExp('\\' + c, 'g'), '_');
	});
	var parts = val.split(' ');
	return parts.join('_');
}

function deleteTerm() {
	var answer = confirm ('Are you sure you want to delete the selected terms?');
	if (answer) {
		var li = $($('.highlighted', $('#ViewDiv'))[0]);
		var index = li.html().indexOf(' ');
		var table = li.html().substr(index+1);
		var url = ERMREST_HOME + '/' + encodeSafeURIComponent(table) + '/';
		var arr = [];
		$.each($('td', $('#termsTable')).find('input:checked'), function(i, input) {
			arr.push('ID=' + encodeSafeURIComponent($(input).parent().next().html()))
		});
		url += arr.join(';');
		cirmAJAX.DELETE(url, true, postDeleteTerm, null, null, 0);
	}
}

function postDeleteTerm(data, textStatus, jqXHR, param) {
	$($('.highlighted', $('#ViewDiv'))[0]).click();
}

function deleteSpecimen() {
	var name = $($('.highlighted', $('#SpecimenDiv'))[0]).html();
	var answer = confirm ('Are you sure you want to delete the specimen "' + name + '"?');
	if (answer) {
		var specimen = specimensDict[$($('.highlighted', $('#SpecimenDiv'))[0]).attr('entityId')]['ID'];
		var url = ERMREST_HOME + '/Specimen/ID=' + encodeSafeURIComponent(specimen);
		cirmAJAX.DELETE(url, true, postDeleteSpecimen, {'name': name}, null, 0);
	}
}

function postDeleteSpecimen(data, textStatus, jqXHR, param) {
	alert('The specimen "' + param['name'] + '" was successfully deleted.');
	specimenActive = true;
	getSpecimens(null);
}

function deleteExperiment() {
	var name = $($('.highlighted', $('#ExperimentDiv'))[0]).html();
	var answer = confirm ('Are you sure you want to delete the experiment "' + name + '"?');
	if (answer) {
		var experiment = experimentsDict[$($('.highlighted', $('#ExperimentDiv'))[0]).attr('entityId')]['ID'];
		var url = ERMREST_HOME + '/Experiment/ID=' + encodeSafeURIComponent(experiment);
		cirmAJAX.DELETE(url, true, postDeleteExperiment, {'name': name}, null, 0);
	}
}

function postDeleteExperiment(data, textStatus, jqXHR, param) {
	alert('The experiment "' + param['name'] + '" was successfully deleted.');
	experimentActive = true;
	getSpecimens(null);
}

function deleteScan() {
	var name = $('#' + makeId('Original Filename') + 'Label').html();
	var answer = confirm ('Are you sure you want to delete the scan "' + name + '"?');
	if (answer) {
		var id = $('#IDLabel').html();
		var scan = scansDict[id];
		var url = ERMREST_HOME + '/Scan/ID=' + encodeSafeURIComponent(id);
		cirmAJAX.DELETE(url, true, postDeleteScan, {'scan': scan}, null, 0);
	}
}

function postDeleteScan(data, textStatus, jqXHR, param) {
	var answer = confirm ('Do you want to delete also the scan\'s file(s)?');
	if (answer) {
		var url = SERVICE_TRANSFER_HOME + 'submission_id';
		cirmAJAX.GET(url, 'application/json', true, activateDeleteEndpoint, param, null, MAX_RETRIES+1);
	} else {
		alert('The scan was successfully deleted.');
		history.back();
	}
}

function activateDeleteEndpoint(data, textStatus, jqXHR, param) {
	var scan = param['scan'];
	var endpoint = encodeSafeURIComponent(scan['GO Endpoint']);
	var obj = {'scan': scan,
			'submission_id': data['value']};
	var url = SERVICE_TRANSFER_HOME + 'endpoint/' + endpoint + '/autoactivate';
	cirmAJAX.POST(url, 'application/json', true, {}, true, deleteScanFiles, obj, null, 0);
}

function deleteScanFiles(data, textStatus, jqXHR, param) {
	var scan = param['scan'];
	var submission_id = param['submission_id'];
	var url = SERVICE_TRANSFER_HOME + '/delete';
	var obj = {
			  "submission_id": submission_id,
			  "endpoint": scan['GO Endpoint'], 
			  "recursive": false, 
			  "DATA_TYPE": "delete",
			  "label": "delete scan", 
			  "length": 1, 
			  "deadline": formatDateTime((new Date((new Date()).getTime() + 10*60*1000))), 
			  "ignore_missing": true, 
			  "DATA": [
			           {
			             "path": scan['GO Path'], 
			             "DATA_TYPE": "delete_item"
			           }
			         ]
			};
	cirmAJAX.POST(url, 'application/json', false, obj, true, postDeleteScanFiles, {'scan': scan}, null, 0);
}

function postDeleteScanFiles(data, textStatus, jqXHR, param) {
	alert('The scan "' + param['scan']['Original Filename'] + '" was successfully deleted.');
	history.back();
}

function deleteSlide() {
	var slide = $('#IDLabel').html();
	var answer = confirm ('Are you sure you want to delete the slide "' + slide + '"?');
	if (answer) {
		var url = ERMREST_HOME + '/Slide/ID=' + encodeSafeURIComponent(slide);
		cirmAJAX.DELETE(url, true, postDeleteSlide, {'name': slide}, null, 0);
	}
}

function postDeleteSlide(data, textStatus, jqXHR, param) {
	$('tr.highlighted', $('.fancyTable')).remove();
	$('tr.odd', $('.fancyTable')).removeClass('odd');
	$.each($('tbody tr', $('.fancyTable')), function(i, tr) {
		if (i%2 == 1) {
			$(tr).addClass('odd');
		}
	});
	$('#deleteSlideButton').attr('disabled', 'disabled');
	$('#deleteSlideButton').addClass('disabledButton');
	if ($('tbody tr', $('.fancyTable')).length == 0) {
		$('#deleteSpecimenButton').removeAttr('disabled');
		$('#deleteSpecimenButton').removeClass('disabledButton');
	}
}

function formatDateTime(s) {
	var year = s.getFullYear();
	var month = ('0' + (s.getMonth() + 1)).slice(-2);
	var day = ('0' + s.getDate()).slice(-2);
	var hour = ('0' + s.getHours()).slice(-2);
	var minutes = ('0' + s.getMinutes()).slice(-2);
	var seconds = ('0' + s.getSeconds()).slice(-2);
	var utcSign = '-';
	var delta = s.getTimezoneOffset() / 60;
	if (delta < 0) {
		utcSign = '+';
	}
	var zone = utcSign + ('00' + delta).slice(-2) + ':' + ('00' + (s.getTimezoneOffset() % 60)).slice(-2);
	var ret = 	year + '-' +
				month + '-' +
				day + ' ' +
				hour + ':' +
				minutes + ':' +
				seconds +
				zone;
	return ret;
	
}

function getSpecimenSelectValues(successCallback) {
	var count = {
		'total': 4,
		'index': 0
	};
	$.each(specimenDropDown, function(table, values) {
		var param = {};
		param['count'] = count;
		param['list'] = values['list'];
		param['dict'] = values['dict'];
		param['successCallback'] = successCallback;
		var url = ERMREST_HOME + '/' + encodeSafeURIComponent(table) + '@sort(ID)';
		cirmAJAX.GET(url, 'application/json', true, postGetSpecimenSelectValues, param, null, MAX_RETRIES+1);
	});
}

function postGetSpecimenSelectValues(data, textStatus, jqXHR, param) {
	param['list'].length = 0;
	$.each(param['dict'], function(key, obj) {
		delete param['dict'][key];
	});
	$.each(data, function(i, value) {
		param['list'].push(value['ID']);
		param['dict'][value['ID']] = value;
	});
	if (++param['count']['index'] == param['count']['total']) {
		param['successCallback']();
	}
}

function genSampleName(selectedItem) {
	var ret = '';
	var val = $('#specimenSpecies').val();
	if (val != '') {
		ret += specimenDropDown['Species']['dict'][val]['Code'];
	}
	var val = $('#specimenTissue').val();
	if (val != '') {
		ret += specimenDropDown['Tissue']['dict'][val]['Code'];
	}
	var val = $('#specimenAge').val();
	if (val != '') {
		ret += $('#specimenAgeNumber').val().replace(/^\s*/, "").replace(/\s*$/, "") + specimenDropDown['Age']['dict'][val]['Code'];
	}
	$.each($('tr', $('#geneTable')), function(i, tr) {
		ret += specimenDropDown['Gene']['dict'][$($('td', $(tr))[0]).html()]['Code'];
	});
	var val = $('#specimenIdentifier').val();
	ret += specimenDropDown['Specimen Identifier']['dict'][val]['Code'];
	
	return ret.substr(0,15);
}

function saveTerm() {
	var li = $($('.highlighted', $('#ViewDiv'))[0]);
	var index = li.html().indexOf(' ');
	var table = li.html().substr(index+1);
	var url = ERMREST_HOME + '/' + encodeSafeURIComponent(table);
	var arr = [];
	var obj = new Object();
	obj['ID'] = $('#termLabel').val();
	obj['Code'] = $('#termCode').val();
	arr.push(obj);
	cirmAJAX.POST(url, 'application/json', false, arr, true, postSaveTerm, null, null, 0);
}

function postSaveTerm(data, textStatus, jqXHR, param) {
	$($('.highlighted', $('#ViewDiv'))[0]).click();
}

function createTerm() {
	$('button[context="centerPanelBottom"]').hide();
	$('#saveTermButton').show();
	$('#saveTermButton').attr('disabled', 'disabled');
	$('#saveTermButton').addClass('disabledButton');
	var centerPanel = $('#centerPanelTop');
	centerPanel.html('');
	centerPanel.append(CIRM_NEW_TERM);
	centerPanel.show();
	var table = $('<table>');
	centerPanel.append(table);
	table.addClass('define_term');
	
	var tr = $('<tr>');
	table.append(tr);
	var td = $('<td>');
	tr.append(td);
	td.addClass('tag');
	td.html('Label:');
	var td = $('<td>');
	tr.append(td);
	var input = $('<input>');
	input.attr({'id': 'termLabel',
		'type': 'text'});
	td.append(input);
	input.keyup(function(event) {checkTermSaveButton();});

	var tr = $('<tr>');
	table.append(tr);
	var td = $('<td>');
	tr.append(td);
	td.addClass('tag');
	td.html('Code:');
	var td = $('<td>');
	tr.append(td);
	var input = $('<input>');
	input.attr({'id': 'termCode',
		'type': 'text'});
	td.append(input);
	input.keyup(function(event) {checkTermSaveButton();});
}

function termsManaging(table) {
	var url = ERMREST_HOME + '/' + encodeSafeURIComponent(table);
	cirmAJAX.GET(url, 'application/x-www-form-urlencoded; charset=UTF-8', true, postTermsManaging, {'table': table}, null, 0);
}

function postTermsManaging(data, textStatus, jqXHR, param) {
	var termList = specimenDropDown[param['table']]['list'];
	var termDict = specimenDropDown[param['table']]['dict'];
	termList.length = 0;
	$.each(termDict, function(key, value) {
		delete termDict[key];
	});
	$.each(data, function(i, term) {
		termList.push(term['ID']);
		termDict[term['ID']] = term;
	});
	$('#rightPanelTop').html('');
	$('#printSpecimenButton').hide();
	$('#deleteSpecimenButton').hide();
	var centerPanel = $('#centerPanelTop');
	centerPanel.html('');
	centerPanel.show();
	var p = $('<p>');
	p.addClass('intro');
	centerPanel.append(p);
	p.html(param['table'] + ' Terms');
	centerPanel.append($('<br>'));
	var containerDiv = $('<div>');
	centerPanel.append(containerDiv);
	containerDiv.addClass('container_div');
	var gridDiv = $('<div>');
	containerDiv.append(gridDiv);
	gridDiv.addClass('grid_div height_table_div');
	gridDiv.height($('#centerPanel').height()*90/100);
	var termsTable = $('<table>');
	gridDiv.append(termsTable);
	termsTable.attr('id', 'termsTable');
	termsTable.attr({'cellpadding': '0', 'cellspacing': '0'});
	termsTable.addClass('fancyTable center');
	var thead = $('<thead>');
	termsTable.append(thead);
	var tr = $('<tr>');
	thead.append(tr);
	var th = $('<th>');
	tr.append(th);
	var input = $('<input>');
	input.attr({'type': 'checkbox',
		'id': 'selectAllTermsTh'});
	input.click(function(event) {checkUncheckAll('termsTable', 'selectAllTermsTh', ['deleteTermButton']);});
	th.append(input);
	var th = $('<th>');
	tr.append(th);
	th.html('Label');
	var th = $('<th>');
	tr.append(th);
	th.html('Code');
	var tbody = $('<tbody>');
	termsTable.append(tbody);
	$.each(data, function(i, row) {
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
			'termId': row['ID']});
		input.click(function(event) {checkAvailableSlides(event, 'termsTable', 'selectAllTermsTh', ['deleteTermButton']);});
		td.append(input);
		var td = $('<td>');
		tr.append(td);
		td.html(row['ID']);
		var td = $('<td>');
		tr.append(td);
		td.html(row['Code']);
	});
	$('button[context="centerPanelBottom"]').hide();
	$('#createTermButton').show();
	$('#deleteTermButton').show();
	$('#deleteTermButton').attr('disabled', 'disabled');
	$('#deleteTermButton').addClass('disabledButton');
}

function getResearchersInitials(table, initialsList) {
	var url = CATALOG_HOME + '/attributegroup/' + encodeSafeURIComponent(table) + '/Initials@sort(Initials)';
	cirmAJAX.GET(url, 'application/json', true, postGetResearchersInitials, {'initialsList': initialsList}, null, MAX_RETRIES+1);
}

function postGetResearchersInitials(data, textStatus, jqXHR, param) {
	var initialsList = param['initialsList'];
	initialsList.length = 0;
	$.each(data, function(i, value) {
		initialsList.push(value['Initials']);
	});
}

function addGene(selectedItem) {
	if (selectedItem != null && specimenDropDown['Gene']['dict'][selectedItem] != null) {
		var table = $('#geneTable');
		var tr = $('<tr>');
		table.append(tr);
		var td = $('<td>');
		tr.append(td);
		td.html(selectedItem);
		var td = $('<td>');
		tr.append(td);
		var span = $('<span>');
		td.append(span);
		span.addClass('ui-icon ui-icon-circle-minus');
		span.click(function(event) {removeGeneValue(event, $(this));});
		$('#specimenGenotype').val(genSampleName(selectedItem));
		checkSpecimenSaveButton();
	}
	
}

function removeGeneValue(event, item) {
	item.parent().parent().remove();
	var selectedItem = item.parent().prev().html();
	$('#specimenGenotype').val(genSampleName(selectedItem));
	checkSpecimenSaveButton();
}

function getMultiSelectValue(col) {
	var values = [];
	$.each($('tr', $('#'+makeId(col)+'MultiTable')), function(i, tr) {
		values.push($($('td', $(tr))[0]).html());
	});
	return values;
}

function removeMultiSelectValue(event, itemType, col, trId) {
	$('#'+trId).remove();
	var values = getMultiSelectValue(col);
	$('#'+makeId(col) + 'Label').html(values.join(';'));
	updateEntity(itemType, col, true);
}

function updateMultiSelectValue(itemType, col, isMultiValue) {
	var values = getMultiSelectValue(col);
	values.push($('#' + makeId(col) + 'Input').val());
	$('#'+makeId(col) + 'Label').html(values.join(';'));
	updateEntity(itemType, col, true);
}

function newTerm(table) {
	var termTable = '+/- ' + table;
	$.each($('li', $('#ViewDiv')), function(i, li) {
		if ($(li).html() == termTable) {
			$(li).click();
			return false;
		}
	});
}
