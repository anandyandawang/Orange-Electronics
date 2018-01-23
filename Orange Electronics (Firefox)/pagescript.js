var allText;
var numberOfCommas = 0;
var allTextArray;
var slideIndex = 0;
var searchItem;
var addedItems = "";
var notifierDiv = document.createElement("div");
notifierDiv.id = "notifier"

var textFile = new XMLHttpRequest();
textFile.onreadystatechange = function() {
	if (textFile.readyState == 4 && textFile.status == 200) {
		allText = textFile.responseText;
		// find number of commas
		for (var i = 0; i < allText.length; i++) {
			if (allText.charAt(i) == ",") {
				numberOfCommas++;
			} 
		}
		// uses number of commas to determine number of rows in the 2-D array
		allTextArray = new Array(numberOfCommas / 6);
		// 2-D array is made at this point, where an array is being put into an array
		for (var i = 0; i < allTextArray.length; i++) {
			allTextArray[i] = new Array(7);
			var allTextLines = allText.split("\n");
			allTextArray[i] = allTextLines[i].split(",");
		}
	}
};
textFile.open("GET", "inventory.csv", true);
textFile.send();

// event delegation for images (individual listeners for each is extremely buggy)
document.body.addEventListener("click", imageHandler);

function determineFooterHeight() { // does not run
	var h = document.body.clientHeight;
	var hPixels = "" + h + "px";
	document.getElementById("footer").style.top = hPixels;
}

function imageHandler(e) {
	if (e.target.className == "cartadd") {
		// finding item quantity
		for (var i = 0; i < parseInt(document.getElementById(e.target.name).value); i++) {
			addedItems += e.target.name + " ";
		}
		// write into container where the quantity textfield is
		if (document.getElementById(e.target.name).value > 0) {
			notifierDiv.innerHTML = document.getElementById(e.target.name).value + " item(s) were added!";
		} else {
			notifierDiv.innerHTML = "Value must be over 0!"
		}
		document.getElementById(e.target.name).parentElement.appendChild(notifierDiv);
	
	} else if (e.target.className == "cartremove") {
		var allItemsClear = false;
		while (allItemsClear == false) {
			// if an occurence of itemId is found in addedItems
			if (addedItems.indexOf(e.target.name) != -1) {
				// replace all values of the occurence with ""
				var i = addedItems.indexOf(e.target.name);
				while (allItemsClear == false) {
					if (addedItems.charAt(i) == " ") {
						addedItems = setChar(addedItems, "", i);
						break;
					} else {
						addedItems = setChar(addedItems, "", i);
					}
				}
			} else {
				allItemsClear = true;
			}
		}
		changeToCart();
	} else if (e.target.id == "home") {
		changeToHome();
	} else if (e.target.id == "category") {
		changeToCategoryCompany(2);
	} else if (e.target.id == "company") {
		changeToCategoryCompany(3);
	} else if (e.target.id == "about") {
		changeToAbout();
	}
}

function setChar(string, character, index) {
	return string.substr(0, index) + character + string.substr(index + 1);
}

function addImage(imgName, srcName, width, height, itemId, isElement) {
	var img = document.createElement("img");
	img.src = imgName;
	img.style.width = width;
	img.style.height = height;
	if (imgName == "images/cartadd.png") {
		img.className = "cartadd";
		// passing the id of textfield to the name of each individual cart image for use in imageHandler
		img.name = itemId;
	} else if (imgName == "images/cartremove.png") {
		img.className = "cartremove";
		img.name = itemId;
	}
	if (isElement) {
		srcName.appendChild(img);
	} else {
		document.getElementById(srcName).appendChild(img);
	}
}

function addTextField(srcName, isQuantity, quantity, itemId, isElement) {
	var field = document.createElement("input");
	field.type = "text";
	if (isQuantity) {
		field.id = itemId;
		field.defaultValue = quantity;
	}
	if (isElement) {
		srcName.appendChild(field);
	} else {
		document.getElementById(srcName).appendChild(field);
	}
	return field;
}

function addButton(txtName, srcName, isElement) {
	var btn = document.createElement("button");
	var txt = document.createTextNode(txtName);
	btn.appendChild(txt);
	if (isElement) {
		srcName.appendChild(btn);
	} else {
		document.getElementById(srcName).appendChild(btn);
	}
	return btn;
}

function addRow(table, itemInfo, quantity, cartImage, isCartRemove, isCheckout) {
	var row = table.insertRow(table.rows.length);
	var cell = new Array(4);
	for (var i = 0; i < cell.length; i++) {
		cell[i] = row.insertCell(i);
		row.appendChild(cell[i]);
	}
	if (!isCheckout) {
		addImage(itemInfo[6], cell[0], "200px", "200px", itemInfo[0], true);
		cell[1].innerHTML = "Item ID: " + itemInfo[0] + "<br> Name: " + itemInfo[1] + "<br> Category: " + itemInfo[2] + "<br> Company: " + itemInfo[3] + "<br> Description: " + itemInfo[4] + "<br> Price: " + itemInfo[5];
		cell[2].innerHTML = "Quantity: <br>";
		addTextField(cell[2], true, quantity, itemInfo[0], true);
		if (isCartRemove) {
			cell[2].innerHTML += "<br>";
			// calculating difference between present .value and old .value, and using this difference to add / remove items from addedItems
			addButton("Change Quantity", cell[2], true).onclick = function() {
				var difference = document.getElementById(itemInfo[0]).value - document.getElementById(itemInfo[0]).defaultValue;
				if (difference > 0) {
					for (var i = 0; i < difference; i++) {
						addedItems += itemInfo[0] + " ";
					}
				} else if (difference < 0) {
					for (var i = 0; i < Math.abs(difference); i++) {
						var index = addedItems.indexOf(itemInfo[0]);
						for (var j = 0; j < ++itemInfo[0].length; j++) {
							addedItems = setChar(addedItems, "", index);
						}	
					}
					
				}
				changeToCart();
			};
		}
		addImage(cartImage, cell[3], "200px", "200px", itemInfo[0], true);
	} else {
		cell[0].innerHTML = quantity;
		cell[0].style.textAlign = "center"
		cell[1].innerHTML = itemInfo[5];
		cell[1].style.textAlign = "right";
		cell[2].innerHTML = itemInfo[1];
		if (itemInfo.length == 7) {
			var price = setChar(itemInfo[5], "", 0);
			cell[3].innerHTML = (price * quantity).toFixed(2);
			cell[3].style.textAlign = "right";
		} else {
			// if length of array is 8, the extra column is used for the cell titles
			cell[3].innerHTML = itemInfo[7];
		}
	}
	table.appendChild(row);
	document.getElementById("content").appendChild(table);
}

function addRowTotal (table, label, total) {
	var row = table.insertRow(table.rows.length);
	var cell = new Array(2);
	for (var i = 0; i < cell.length; i++) {
		cell[i] = row.insertCell(i);
		row.appendChild(cell[i]);
	}
	cell[0].colSpan = "3";
	cell[0].innerHTML = label;
	cell[0].style.textAlign = "right";
	cell[1].innerHTML = total;
	cell[1].style.textAlign = "right";
	table.appendChild(row);
	document.getElementById("content").appendChild(table);
}

function enterKeyDown(e) {
	if (e.keyCode === 13) {
		search();
	}
	return false;
}

function search() {
	document.getElementById("content").innerHTML = "<h2> Search Results:";
	var searchTable = document.createElement("table");
	var searchInput = document.getElementById("searchQuery").value.toLowerCase();
	var searchInputArray = searchInput.split(" ");
	var k = 0;
	var numberOfResults = 0;
	for (var i = 0; i < allTextArray.length; i++) {
		for (var j = 0; j < allTextArray[i].length; j++) {
			// searches for searchInputArray[k] in allTextArray until an occurence is found
			if (searchInput != "" && allTextArray[i][j].toLowerCase().indexOf(searchInputArray[k]) != -1) {
				// adds 1 to search for the next word listed in searchInputArray
				k++;
				// if the value of k is equal to the length of searchInputArray, there are no more words to be searched for in allTextArray[i]
				if (k == searchInputArray.length) {
					numberOfResults++;
					addRow(searchTable, allTextArray[i], "1", "images/cartadd.png");
					// k is set to 0 to search for the first word in the next row of allTextArray
					k = 0;
					// i is increased by 1 to search in the next row of allTextArray
					i++;
					// j is set to -1 because an increment of 1 is made when the loop iterates
					j = -1;
				} else {
					// j is set to -1 to search for the next word in the same row
					j = -1;
				}
			// if searchInputArray[k] was found atleast once for any value of k but was not found for the current value of k, then allTextArray[i] does not contain all of the strings found in searchInputArray
			} else if (k != 0 && j == allTextArray[i].length - 1) {
				k = 0;
				i++;
				j = -1;
			}
		}
	}
	if (numberOfResults == 0) {
		document.getElementById("content").innerHTML = "<h3> No results were found.";
	}
	determineFooterHeight();
}

function changeToHome() {
	document.getElementById("content").innerHTML = "";
	document.getElementById("content").innerHTML += "<h1> Welcome to Orange Electronics";
	var roboDiv = document.createElement("div");
	roboDiv.style.textAlign = "center";
	addImage("images/robotorange.png", roboDiv, "1000px", "670px", "", true);
	document.getElementById("content").appendChild(roboDiv);
	determineFooterHeight();
}

function changeToCategoryCompany(identifier) {
	document.getElementById("content").innerHTML = "";
	var allCategoriesCompanies = new Array;
	// organizing all of the possible categories/companies into an array that is alphabetically sorted
	for (var i = 0; i < allTextArray.length; i++) {
		allCategoriesCompanies[i] = allTextArray[i][identifier];
	}
	allCategoriesCompanies.sort();
	// removing duplicate categories/companies
	var allCategoriesCompaniesFiltered = allCategoriesCompanies.filter(function(currentValue, pos) {
		// finding position of first occurence and comparing with the current position
		if (allCategoriesCompanies.indexOf(currentValue) == pos) {
			return currentValue;
		}
	});
	// displaying all items
	var categoryCompanyTable = new Array(allCategoriesCompaniesFiltered.length);
	for (var i = 0; i < allCategoriesCompaniesFiltered.length; i++) {
		categoryCompanyTable[i] = document.createElement("table");
		document.getElementById("content").innerHTML += "<b><u><h2>" + allCategoriesCompaniesFiltered[i];
		for (var j = 0; j < allTextArray.length; j++) {
			if (allCategoriesCompaniesFiltered[i] == allTextArray[j][identifier]) {
				addRow(categoryCompanyTable[i], allTextArray[j], "1", "images/cartadd.png");
			}
		}
		document.getElementById("content").innerHTML += "<br><br>";
	}
	determineFooterHeight();
}

function changeToAbout() {
	document.getElementById("content").innerHTML = "<h2> About Us";
	document.getElementById("content").innerHTML += "<hr><br>";
	var textDiv = document.createElement("div");
	textDiv.style.width = "80%";
	textDiv.style.backgroundColor = "#FAB133";
	textDiv.style.cssFloat = "left";
	textDiv.innerHTML += "<h3><u> What is Orange Electronics?</u></h3>";
	textDiv.innerHTML += "<p> Orange Electronics is an electronics store that sells a variety of products to fit the needs of everyday uses of technology.</p>";
	textDiv.innerHTML += "<h3><u> What is your price match guarantee?</u></h3>";
	textDiv.innerHTML += "<p> At Orange Electronics, our prices are set to what is fair to both us and for the customers. If a competitor sells a product lower than ours, we'll match it and give you a 10% discount on content of that!</p>";
	textDiv.innerHTML += "<h3><u> How can we contact you?</u></h3>";
	textDiv.innerHTML += "<p> You can contact us through our e-mail at orangelectronicstore@gmail.com or by calling customer services at 555-555-5555.</p>";
	textDiv.innerHTML += "<h3><u> Where can we find you?</u></h3>";
	textDiv.innerHTML += "<p> You can find us at our location in 1650 Midland Avenue Toronto, ON M1P 3C2 where you can talk to us personally while having the opportunity to look around our inventory.</p>";
	textDiv.innerHTML += "<p> In our store, our support staff is trained to provide customers with the service that they deserve, so that they can be a happy orange after visiting our store. We have all the electronics that you are looking for, whether it is the new smartwatch, smartphone, microwave or even a refrigerator. We guarantee our customers that our products will be 100% statisfactory because all of our proucts have been inspected by professionals and officials to ensure that our products meet the quality standards.";
	textDiv.innerHTML += "If you have any questions, please contact us at 'orangelectronicstore@gmail.com'.";
	textDiv.innerHTML += "<br><br> If you want to sign up for our newsletter or for special offers, please fill in the following form.";
	textDiv.innerHTML += "<br><br> First Name:";
	addTextField(textDiv, false, "", "", true);
	textDiv.innerHTML += "<br> Last Name:";
	addTextField(textDiv, false, "", "", true);
	textDiv.innerHTML += "<br> E-mail:";
	addTextField(textDiv, false, "", "", true);
	textDiv.innerHTML += "<br> Phone Number:";
	addTextField(textDiv, false, "", "", true);
	textDiv.innerHTML += "<br>"
	addButton("Submit", textDiv, true).onclick = function() {
		alert("Thank you! We will contact you soon.");
	};
	document.getElementById("content").appendChild(textDiv);
	var imageDiv = document.createElement("div");
	imageDiv.style.width = "20%";
	imageDiv.style.textAlign = "center";
	imageDiv.style.cssFloat = "right";
	addImage("images/happy.jpg", imageDiv, false, "378px", "534px", true);
	document.getElementById("content").appendChild(imageDiv);
	determineFooterHeight();
}
function changeToCart() {
	document.getElementById("content").innerHTML = "<h2> Cart";
	var addedItemsArray = addedItems.split(" ");
	var addedItemsArrayCorrected = new Array (addedItemsArray.length - 1);
	addedItemsArray.sort();
	// first value in array is ""
	for (var i = 0; i < addedItemsArrayCorrected.length; i++) {
		addedItemsArrayCorrected[i] = addedItemsArray[i + 1];
	}
	var previousValue = addedItemsArrayCorrected[0];
	var quantityCounter = 0;
	var quantityValues = "";
	var addedItemsArrayFiltered = addedItemsArrayCorrected.filter(function(currentValue, pos) {
		if (previousValue != currentValue) {
			quantityValues += "" + quantityCounter + " ";
			// makes up for loss of first value to be compared with itself
			quantityCounter = 1;
			if (addedItemsArrayCorrected.length == pos + 1) {
				quantityValues += "" + quantityCounter + " ";
			}
		} else {
			quantityCounter++;
			if (addedItemsArrayCorrected.length == pos + 1) {
				quantityValues += "" + quantityCounter + " ";
			}
		}
		previousValue = currentValue;
		if (addedItemsArrayCorrected.indexOf(currentValue) == pos) {
			return currentValue;
		}
	});
	var cartTable = document.createElement("table");
	var quantityValuesArray = quantityValues.split(" ");
	var totalItems = 0;
	var totalPrice = 0;
	for (var i = 0; i < addedItemsArrayFiltered.length; i++) {
		for (var j = 0; j < allTextArray.length; j++) {
			if (allTextArray[j][0] == addedItemsArrayFiltered[i]) {
				totalItems += parseInt(quantityValuesArray[i]);
				// gets rid of dollar sign for usage as int
				var price;
				if (allTextArray[j][5].charAt(0) == "$") {
					price = allTextArray[j][5].substr(1, allTextArray[j][5].length);
				} else {
					price = allTextArray[j][5];
				}
				totalPrice += price * quantityValuesArray[i];
				addRow(cartTable, allTextArray[j], quantityValuesArray[i], "images/cartremove.png", true);
			}
		}
	}
	if (addedItems.length != 0) {
		var totalItemsDiv = document.createElement("div");
		totalItemsDiv.innerHTML = "<br><br><h3> Number of Items In Cart: " + totalItems + "<br>";
		document.getElementById("content").appendChild(totalItemsDiv);
		var totalPriceDiv = document.createElement("div");
		totalPriceDiv.innerHTML = "<h3> Subtotal: $" + totalPrice.toFixed(2) + "<br>";
		document.getElementById("content").appendChild(totalPriceDiv);
		// acts as changeToCheckout (is made in this function because all neccessary variables are present)
		addButton("Checkout", "content").onclick = function() {
			document.getElementById("content").innerHTML = "<h2> Cart Summary";
			var checkoutTable = document.createElement("table");
			var cellTitles = ["", "Name", "", "", "", "Price Per Unit ($)", "", "Net Price ($)"];
			addRow(checkoutTable, cellTitles, "Quantity", "", false, true);
			for (var i = 0; i < addedItemsArrayFiltered.length; i++) {
				for (var j = 0; j < allTextArray.length; j++) {
					if (allTextArray[j][0] == addedItemsArrayFiltered[i]) {
						addRow(checkoutTable, allTextArray[j], quantityValuesArray[i], "", false, true);
					}
				}
			}
			addRowTotal(checkoutTable, "Subtotal", totalPrice.toFixed(2));
			addRowTotal(checkoutTable, "HST", (totalPrice * 0.13).toFixed(2));
			addRowTotal(checkoutTable, "Total", (totalPrice + (totalPrice * 0.13)).toFixed(2));
			addButton("Set Up Payment", "content").onclick = function() {
				document.getElementById("content").innerHTML = "<h2> Shipping and Payment";
				var paymentDiv = document.createElement("div");
				paymentDiv.align = "center";
				paymentDiv.id = "payment";
				paymentDiv.innerHTML = "<u> Shipping Adress:";
				paymentDiv.innerHTML += "<br> Name: ";
				addTextField(paymentDiv, false, "", "", true);
				paymentDiv.innerHTML += "<br> Adress: ";
				addTextField(paymentDiv, false, "", "", true);
				paymentDiv.innerHTML += "<br> City: ";
				addTextField(paymentDiv, false, "", "", true);
				paymentDiv.innerHTML += "<br> Postal Code: ";
				addTextField(paymentDiv, false, "", "", true);
				paymentDiv.innerHTML += "<br>";
				paymentDiv.align = "center";
				paymentDiv.innerHTML += "<br><u> Payment Information: ";
				paymentDiv.innerHTML += "<br> Card Number: ";
				addTextField(paymentDiv, false, "", "", true);
				paymentDiv.innerHTML += "<br> Expiry: ";
				var m = addTextField(paymentDiv, false, "", "", true);
				m.size = "2"
				m.placeholder = "MM";
				var y = addTextField(paymentDiv, false, "", "", true);
				y.size = "4"
				y.placeholder = "YYYY";
				y.style.marginLeft = "5px";
				paymentDiv.innerHTML += "<br> Security Code: ";
				addTextField(paymentDiv, false, "", "", true);
				paymentDiv.innerHTML += "<br><br>";
				addButton("Submit", paymentDiv, true).onclick = function() {
					var textFields = paymentDiv.getElementsByTagName("input");
					var allEmptyFields = true;
					for (var i = 0; i < textFields.length; i++) {
						if (textFields[i].value == "") {
							allEmptyFields = false;
						}
					}				
					if (allEmptyFields) {
						alert("Thank you for shopping at Orange Electronics!");
						addedItems = "";
						changeToCart();
					} else {
						alert("There are incomplete fields!");
					}
				};
				document.getElementById("content").appendChild(paymentDiv);
				
			};
		};
	} else {
		document.getElementById("content").innerHTML = "<h3> There are no items in your cart.";
	}
	determineFooterHeight();
}