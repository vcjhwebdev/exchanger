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
		// if online, get rates
		var apiURL = 'https://api.exchangeratesapi.io/latest?base=' + Exchanger.inputCurrency();
		loadJSON(apiURL, function(data) {
			Exchanger.Data[Exchanger.inputCurrency()] = data;
		}, function(xhr) {
			console.log('Error');
		});
		// else try to use cached rate
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
				console.log('ERROR: ' + err.message);
			}
		}, 500); // allow time to retrive the rates
	},
	saveData: function() {
		// save Data to localStorage for offline use
	},
	loadData: function() {
		// load Data from localStorage
	}
}
