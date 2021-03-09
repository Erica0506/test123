var BfrlTool = BfrlTool || {};
BfrlTool._RetailerList = function () {
	var digestRetailerIDs = [];
	var digestRestaurantIDs = [];
	var retailerUrlLookMap = new Map();
	var restaurantUrlMap = new Map();
	var searchInjectionBlacklistRetailerIds = [];
	var failures = [];
	return {
		Failures: failures,
		RetailerMap: retailerUrlLookMap,
		DigestReport: function () {
			var position = 0;
			var positionArray = [];

			var queryApi = function () {
				let stringRetailerIDs = positionArray.join(",");
				BfrlTool.BrowserStorage.UserToken.then(function (userToken) {
					shoptoolbar.FetchJson("https://tbwsjs.befrugal.com/wssimple.asmx/GetBatchedRetailerInfo", {
						method: "POST",
						headers: {
							'Content-Type': 'application/x-www-form-urlencoded'
						},
						body: shoptoolbar.Format("retailerids={0}&UserToken={1}&toolbarversion={2}", stringRetailerIDs, userToken, shoptoolbar.GetToolbarVersion())
					}).then((json) => {
						for (let r = 0; r < json.length; r++) {
							if (json[r] && json[r].RetailerID) {
								let retailerId = json[r].RetailerID;
								let dbrow = BfrlTool._RetailerList._GetRetailerById(retailerId);
								if (dbrow) {
									console.log(retailerId + "," + dbrow.Domain + "," + dbrow.Rule + "," + !!json[r].CashbackRate);
								}
								else {
									failures.push(retailerId);
								}
							}
							else {
								console.error("ERROR in string - ", stringRetailerIDs);
							}
						}
					});
				});
				positionArray = [];
			};

			while (position < digestRetailerIDs.length) {
				positionArray.push(digestRetailerIDs[position]);

				if (position % 100 === 0 && position > 0) {
					queryApi();
                }
				position++;
			}
			if (positionArray.length > 0) {
				queryApi();
            }
		},
		_AddRetailer: function (url, properties, retailerID) {
			digestRetailerIDs.push(retailerID);

			if (!retailerUrlLookMap.has(url)) {
				//The URL in the properties from the digest may have HTTP and not HTTPS. Replace HTTP with HTTPS
				if ("URL" in properties) {
					let newProperties = [Object.assign({}, properties)];
					properties.URL = properties.URL.replace(/https?\:\/\//i, "");
					newProperties.push(properties);
					properties = newProperties;
				}

				retailerUrlLookMap.set(url, properties);
			}
			else if (properties && properties.URL) {
				//Append the new properties of the matching url key to the existing url key as an array.
				//Detecting the value of the matching url key as an array should be easier to filter out which retailer matches
				//the full URL appropriately when getting the retailer.
				let existingProperties = retailerUrlLookMap.get(url);
				if (!Array.isArray(existingProperties)) {
				    if (!existingProperties.URL) {
				        existingProperties.URL = existingProperties.Domain;
				    }
					existingProperties = [existingProperties];
				}

				//The URL in the properties from the digest may have HTTP and not HTTPS. Replace HTTP with HTTPS
				existingProperties.push(Object.assign({}, properties));
				properties.URL = properties.URL.replace(/https?\:\/\//i, "");
				existingProperties.push(properties);
				existingProperties.sort((left, right) => {
					return left.URL.length - right.URL.length || left.URL.localeCompare(right.URL);
				});
				retailerUrlLookMap.set(url, existingProperties);
			}
		},
		_GetRetailer: function (url) {
			var retailer = retailerUrlLookMap.get(url);
			if (retailer != null) {
				return retailer;
			}
			else
				return BfrlTool._RetailerList._GetRestaurant(url);
		},
		_GetRetailerById: function (retailerID) {
			let digestFound = [...retailerUrlLookMap.entries()].filter(s => {
				if (Array.isArray(s[1])) {
					for (let q = 0; q < s[1].length; q++) {
						if (s[1][q].RetailerID === retailerID) return true;
					}
					return false;
				}
				else {
					return s[1].RetailerID == retailerID;
				}
			});
			if (digestFound) {
				if (digestFound[0] && digestFound[0][1]) {
					if (Array.isArray(digestFound[0][1])) {
						for (let q = 0; q < digestFound[0][1].length; q++) {
							if (digestFound[0][1][q].RetailerID === retailerID)
								return digestFound[0][1][q];
						}
                    }
					else return digestFound[0][1];
				}
				else return null;
		    }
		    else return null;
		},
		_AddRestaurant: function (url, properties, retailerID) {
			digestRestaurantIDs.push(retailerID);
			restaurantUrlMap.set(url, properties);
		},
		_GetRestaurant: function(url) {
			var restaurant = restaurantUrlMap.get(url);
			if (restaurant != null)
				return restaurant;
			return null;
		},
		_IsEmpty: function () {
			return (retailerUrlLookMap.size === 0);
		},
		_MapRetailerList: function (retailerList) {
			digestRetailerIDs = [];
			retailerUrlLookMap.clear();
			for (var i = 0; i < retailerList.length; i++) {
				BfrlTool._RetailerList._AddRetailer(retailerList[i].Domain, retailerList[i], retailerList[i].RetailerID);
			}
		},
		_MapRestaurantList: function (restaurantList) {
			digestRestaurantIDs = [];
			restaurantUrlMap.clear();
			for (var i = 0; i < restaurantList.length; i++) {
				BfrlTool._RetailerList._AddRestaurant(restaurantList[i].Domain, restaurantList[i], restaurantList[i].RetailerID);
			}
		},
		_MapSearchInjectionBlackList: function(blacklist){
			searchInjectionBlacklistRetailerIds = blacklist;
		},
		_IsSearchInjectBlacklisted: function (retailerID) {
			return (searchInjectionBlacklistRetailerIds.indexOf(retailerID) >= 0);
		},
		_Retailers: retailerUrlLookMap,
		_Restaurants: restaurantUrlMap,
		_ContainsRetailer: function (retailerID) {
			return (digestRetailerIDs.indexOf(retailerID) >= 0);
		},
		_ContainsRestaurant: function (retailerID) {
			return (digestRestaurantIDs.indexOf(retailerID) >= 0);
		}
	};
}();
