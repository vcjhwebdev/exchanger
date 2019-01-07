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

function isOnline() {
	return navigator.onLine;
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
	inputCurrency: function() {
		var select = document.getElementById('input-currency');
		return select.options[select.selectedIndex].value;
	},
	outputCurrency: function() {
		var select = document.getElementById('output-currency');
		return select.options[select.selectedIndex].value;
	},
	getConversionRates: function() {
		// try to get a new rate if online
		if(isOnline()) {
			console.log('ONLINE: Retrieving rates for ' + Exchanger.inputCurrency() + '...');
			var apiURL = 'https://api.exchangeratesapi.io/latest?base=' + Exchanger.inputCurrency();
			loadJSON(apiURL, function(data) {
				Exchanger.Data[Exchanger.inputCurrency()] = data;
			}, function(xhr) {
				console.log('Error');
			});
		}
		// user is offline. use cache if available
		else {
			var str = 'OFFLINE: Attempting to use cached rates...'
			// check if in cache
			if(Exchanger.Data[Exchanger.inputCurrency()] != undefined) {
				console.log(str + 'Using cached rate.');
			} else {
				console.log(str + 'No rate in cache, can\'t convert. :(');
				document.getElementById('output-value').value = '';
			}
		}
	},
	convert: function() {
		Exchanger.getConversionRates();
		setTimeout(function() {
			var inputAmount = document.getElementById('input-value').value;
 			try {
				inputAmount = Number(inputAmount);
				var outputAmount = inputAmount * Exchanger.Data[Exchanger.inputCurrency()].rates[Exchanger.outputCurrency()];
				document.getElementById('output-value').value = outputAmount.toFixed(2);
			} catch(err) {
				console.log('Error');
			}
		}, 500); // allow time to retrive the rates
	}
}
