function loadJSON(path, success, error) {
	var xhr = new XMLHttpRequest();
	xhr.onreadystatechange = function() {
		if (xhr.readyState === XMLHttpRequest.DONE) {
			if (xhr.status === 200) {
				if (success)
					success(JSON.parse(xhr.responseText));
			} else {
				if (error)
					error(xhr);
			}
		}
	};
	xhr.open('GET', path, true);
	xhr.send();
}

function hasLocalStorage() {
	var testingLS = 'testingLS';
	try {
		localStorage.setItem(testingLS, testingLS);
		localStorage.removeItem(testingLS);
		return true;
	}
	catch (e) {
		console.log('Sorry, your browser does not support Web Storage...');
		return false;
	}
}

var Exchanger = {
	Data: {},
	inputCurrency: 'USD',
	outputCurrency: 'JPY',
	allCurrencies: [],
	init: function() {
		// get conversion rates when loaded
		Exchanger.loadData();
		Exchanger.getConversionRates('USD', false);
    setTimeout(function(){
			for(p in Exchanger.Data.USD.rates) {
				Exchanger.allCurrencies.push(p);
			}
			Exchanger.fillCache();
		}, 500);
	},
	getConversionRates: function(i, silent) {
		var online = navigator.onLine;
		// try to get a new rate if online
		if(online) {
      if(!silent) {
				Exchanger.userMsg('Online: Retrieving rates for ' + i + '...');
				console.log('Retrieving ' + i);
			} else {
				console.log('Retrieving ' + i + ' silently');
			}
			var apiURL = 'https://api.exchangeratesapi.io/latest?base=' + i;
			loadJSON(apiURL, function(data) {
				Exchanger.Data[i] = data;
				Exchanger.saveData();
			}, function(xhr) {
				console.log('Error');
			});
		}
		// user is offline. use cache if available
		else {
			var str = 'Offline: Attempting to use cached rates...'
			// check if in cache
			if(Exchanger.Data[Exchanger.inputCurrency] != undefined) {
				Exchanger.userMsg(str + 'Using cached rate.');
			} else {
				Exchanger.userMsg(str + 'No rate in cache, can\'t convert. :(');
				document.getElementById('output-value').value = '';
			}
		}
	},
	convert: function() {
		setTimeout(function() {
			var i = document.getElementById('input-value').value;
 			try {
				i = Number(i);
				o = i * Exchanger.Data[Exchanger.inputCurrency].rates[Exchanger.outputCurrency];
				document.getElementById('output-value').value = o.toFixed(2);
			} catch(err) {
				console.log('Error');
			}
		}, 500);
	},
	inputCurrencyChange: function(i) {
		Exchanger.inputCurrency = i;
		// get rates with the new base currency
		Exchanger.getConversionRates(i, false);
		// convert whatever is there
		Exchanger.convert();
	},
	outputCurrencyChange: function(o) {
		Exchanger.outputCurrency = o;
		// convert whatever is there
		Exchanger.convert();
	},
	userMsg: function(msg) {
		var outputDiv = document.getElementById('info');
		var spanNode = document.createElement('P');
		var textNode = document.createTextNode(msg);
		spanNode.appendChild(textNode);
		outputDiv.insertBefore(spanNode, outputDiv.childNodes[0]);
		Exchanger.fade();
	},
	fade: function() {
		var fadeTarget = document.getElementById('info').childNodes[0];
		var counter = 1;
		setTimeout(function() {
			var fadeEffect = setInterval(function () {
				if (counter > 0) {
					counter -= 0.1
					fadeTarget.style.opacity = counter.toFixed(1);
				} else {
					clearInterval(fadeEffect);
					fadeTarget.parentNode.removeChild(fadeTarget);
				}
			}, 50);
		}, 2000);
	},
	saveData: function() {
		if (hasLocalStorage()) {
			localStorage.setItem('ExchangerData', JSON.stringify(Exchanger.Data));
		}
	},
	loadData: function() {
		if (hasLocalStorage()) {
			if(localStorage.getItem('ExchangerData') != null) {
				Exchanger.Data = JSON.parse(localStorage.getItem('ExchangerData'));
			}
		}
	},
	fillCache: function() {
		console.log(Exchanger.allCurrencies.length + ' currencies in total.');
		var i = 0;
		var delayEffect = setInterval(function(){
			if(i < Exchanger.allCurrencies.length) {
				Exchanger.getConversionRates(Exchanger.allCurrencies[i], true);
			} else {
				console.log('Done pre-caching all currencies');
				clearInterval(delayEffect);
			}
			i++;
		}, 200);
	}
}

window.onload = Exchanger.init;
