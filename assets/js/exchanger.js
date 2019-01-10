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
	inputAmount: function() {
		var n = Number(document.getElementById('input-value').value);
		if( n !== undefined ) {
			return n;
		}
		return 0;
	},
	outputCurrency: function() {
		var select = document.getElementById('output-currency');
		return select.options[select.selectedIndex].value;
	},
	getConversionRates: function() {
		var apiURL = 'https://api.exchangeratesapi.io/latest?base=' + Exchanger.inputCurrency();
		loadJSON(apiURL, function(data) {
			Exchanger.Data[Exchanger.inputCurrency()] = data;

			Exchanger.saveData();
		}, function(xhr) {
			console.log('Error');
		});
	},
	convert: function() {
		Exchanger.getConversionRates();
		setTimeout(function() {
 			try {
				var outputAmount = Exchanger.inputAmount() * Exchanger.Data[Exchanger.inputCurrency()].rates[Exchanger.outputCurrency()];
				document.getElementById('output-value').value = outputAmount.toFixed(2);
			} catch(err) {
				console.log('ERROR: ' + err.message);
			}
		}, 500); // allow time to retrive the rates
	},
	saveData: function() {
		// save Data to localStorage for offline use
		if(hasLocalStorage()) {
			localStorage.setItem('ExchangerData', JSON.stringify(Exchanger.Data));
		}
	},
	loadData: function() {
		// load Data from localStorage
		if(hasLocalStorage()){
			if(localStorage.getItem('ExchangerData') !== null) {
				Exchanger.Data = JSON.parse(localStorage.getItem('ExchangerData'));
			}
		}
	}
}

window.onLoad = Exchanger.loadData;
