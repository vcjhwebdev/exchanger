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
	xhr.open("GET", path, true);
	xhr.send();
}


var Exchanger = {
	inputCurrency: "USD",
	outputCurrency: "JPY",
	conversionRates: {},
	init: function() {
		// get conversion rates when loaded
		Exchanger.getConversionRates();
	},
	getConversionRates: function() {
		var online = navigator.onLine;
		if(online) {
			var apiURL = 'https://api.exchangeratesapi.io/latest?base=' + Exchanger.inputCurrency;
			loadJSON(apiURL, function(data) {
				Exchanger.conversionRates = data;
			}, function(xhr) {
				console.log("Error");
			});
		} else {
			console.log("Reconnect to the internet to get an updated rate.\nAttempting to use cached rates...");
		}
	},
	convert: function() {
		setTimeout(function() {
			var i = document.getElementById("input-value").value;
			console.log("Input value: " + i);
			// clear the output value
			document.getElementById("output-value").value = "";

			try {
				i = Number(i);
				o = i * Exchanger.conversionRates.rates[Exchanger.outputCurrency];
				document.getElementById("output-value").value = o.toFixed(2);
				console.log("Updating output value to: " + o);
			} catch(err) {
				console.log("Error");
			}
		}, 500);
	},
	inputCurrencyChange: function(i) {
		Exchanger.inputCurrency = i;
		console.log("New input currency: " + Exchanger.inputCurrency);
		// get rates with the new base currency
		console.log("Getting the rates with the new base currency...");
		Exchanger.getConversionRates();
		// convert whatever is there
		console.log("Re-converting existing input with new currency...");
		Exchanger.convert();
	},
	outputCurrencyChange: function(o) {
		Exchanger.outputCurrency = o;
		console.log("New output currency: " + Exchanger.outputCurrency);
		// convert whatever is there
		console.log("Re-converting existing input with new currency...");
		console.log(Exchanger.conversionRates);
		Exchanger.convert();
	}
}

window.onload = Exchanger.init;