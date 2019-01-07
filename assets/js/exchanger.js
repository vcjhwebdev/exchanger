var isOnline = function() {
	return navigator.onLine;
}

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

var Today = {
	d: function() {
		return new Date();
	},
	parseString: function() {
		var year = this.d().getFullYear();
		var month = this.d().getMonth() + 1; // January is 0, so add one
		var date = this.d().getDate();

		if( month < 10 ) {
			month = '0' + month;
		}

		if( date < 10 ) {
			date = '0' + date;
		}

		return year + '-' + month + '-' + date;
	}
};

var Exchanger = {
	Data: {},
	inputCurrency: 'USD',
	outputCurrency: 'JPY',
	allCurrencies: [],
	init: function() {
		// load from localStorage
		Exchanger.loadData();
		// get the rates with USD as base
		Exchanger.getConversionRates('USD');
		// get currency codes
    setTimeout(function(){
			for(p in Exchanger.Data.USD.rates) {
				Exchanger.allCurrencies.push(p);
			}
			Exchanger.fillCache();
		}, 500);
	},
	getConversionRates: function(i) {
		// try to get a new rate if online
		if(isOnline()) {
			// no rates in cache OR cached rate is NOT from today
			if(Exchanger.Data[i] === undefined || Exchanger.Data[i].date !== Today.parseString()) {
				console.log('ONLINE: Retrieving rates for ' + i + '...');
				var apiURL = 'https://api.exchangeratesapi.io/latest?base=' + i;
				loadJSON(apiURL, function(data) {
					Exchanger.Data[i] = data;
					Exchanger.saveData();
				}, function(xhr) {
					console.log('Error');
				});
			} else {
				console.log('Cached rate is from today. NOT retreiving new rate.');
			}
		}
		// user is offline. use cache if available
		else {
			var str = 'OFFLINE: Attempting to use cached rates...'
			// check if in cache
			if(Exchanger.Data[Exchanger.inputCurrency] != undefined) {
				console.log(str + 'Using cached rate.');
			} else {
				console.log(str + 'No rate in cache, can\'t convert. :(');
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
		Exchanger.getConversionRates(i);
		// convert whatever is there
		Exchanger.convert();
	},
	outputCurrencyChange: function(o) {
		Exchanger.outputCurrency = o;
		// convert whatever is there
		Exchanger.convert();
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
		console.log('Pre-caching all(' + Exchanger.allCurrencies.length + ') currencies...')
		var i = 0;
		var delayEffect = setInterval(function(){
			if(i < Exchanger.allCurrencies.length) {
				if(isOnline()) {
					Exchanger.getConversionRates(Exchanger.allCurrencies[i]);
				} else {
					console.log('OFFLINE: Skipping ' + Exchanger.allCurrencies[i]);
				}
			} else {
				console.log('Done!');
				console.log(Object.keys(Exchanger.Data).length + ' currencies in cache.');
				clearInterval(delayEffect);
			}
			i++;
		}, 200);
	}
}

window.onload = Exchanger.init;
