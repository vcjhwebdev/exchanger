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
	init: function() {
		// get conversion rates when loaded
		Exchanger.getConversionRates();
	},
	getConversionRates: function() {
		var online = navigator.onLine;
		// try to get a new rate if online
		if(online) {
			console.log("user is online, retrieving rates...");
			var apiURL = 'https://api.exchangeratesapi.io/latest?base=' + Exchanger.inputCurrency;
			loadJSON(apiURL, function(data) {
				BaseRate[Exchanger.inputCurrency] = data;
			}, function(xhr) {
				console.log("Error");
			});
		}
		// user is offline. use cache if available
		else {
			console.log("User is offline.\nAttempting to use cached rates...");
			// check if in cache
			if(BaseRate[Exchanger.inputCurrency] != undefined) {
				console.log("Rate found in cache. Using cached rate.");
			} else {
				console.log("No rate in cache, can't convert. :(");
			}
		}
	},
	convert: function() {
		setTimeout(function() {
			var i = document.getElementById("input-value").value;

			try {
				i = Number(i);
				o = i * BaseRate[Exchanger.inputCurrency].rates[Exchanger.outputCurrency];
				document.getElementById("output-value").value = o.toFixed(2);
			} catch(err) {
				console.log("Error");
			}
		}, 500);
	},
	inputCurrencyChange: function(i) {
		Exchanger.inputCurrency = i;
		// get rates with the new base currency
		Exchanger.getConversionRates();
		// convert whatever is there
		Exchanger.convert();
	},
	outputCurrencyChange: function(o) {
		Exchanger.outputCurrency = o;
		// convert whatever is there
		Exchanger.convert();
	}
}

var BaseRate = {
	save: function() {
		if (typeof(Storage) !== "undefined") {
			localStorage.setItem("BaseRate", JSON.stringify(BaseRate));
		} else {
			console.log("Sorry, your browser does not support Web Storage...");
		}
	},
	load: function() {
		if (typeof(Storage) !== "undefined") {
			if(localStorage.getItem("BaseRate") != null) {
				BaseRate = JSON.parse(localStorage.getItem("BaseRate"));
			}
		} else {
			console.log("Sorry, your browser does not support Web Storage...");
		}
	}
}

window.onload = Exchanger.init;