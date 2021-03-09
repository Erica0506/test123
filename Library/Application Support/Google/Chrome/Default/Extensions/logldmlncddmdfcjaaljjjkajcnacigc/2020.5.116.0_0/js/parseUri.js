// parseUri 1.2.2
// (c) Steven Levithan <stevenlevithan.com>
// Modified by BeFrugal
// MIT License

var parseUriWrapper = function () {
    var multipleRetailerDomains = ["wyndhamhotels.com", "choicehotels.com", "ihg.com"];
	return {
	    CleanUrl: function (url) {
	        for (var i = 0; i < multipleRetailerDomains.length; i++) {
	            if (url.includes(multipleRetailerDomains[i]) && url.match(/^http[s]?:\/\/.*?\/([a-zA-Z-_]+).*$/) && url.match(/^http[s]?:\/\/.*?\/([a-zA-Z-_]+).*$/).length > 1) {
	                return url.match(/^http[s]?:\/\/.*?\/([a-zA-Z-_]+).*$/)[0];
                }
	        }
	        
	        var urlA = parseUriWrapper.parseUri(url).host;
	        if (urlA.slice(0, "www3.".length) == "www3.")
	            urlA = urlA.slice("www3.".length);
	        if (urlA.slice(0, "www2.".length) == "www2.")
	            urlA = urlA.slice("www2.".length);
	        if (urlA.slice(0, "www1.".length) == "www1.")
	            urlA = urlA.slice("www1.".length);
	        if (urlA.slice(0, "www.".length) == "www.")
	            urlA = urlA.slice("www.".length);
	        if (urlA.slice(0, "secure.".length) == "secure.")
	            urlA = urlA.slice("secure.".length);
	        if (urlA.slice(0, "store.".length) == "store.")
	            urlA = urlA.slice("store.".length);
	        if (urlA.slice(0, "shop.".length) == "shop.")
	            urlA = urlA.slice("shop.".length);
	        return urlA;
	    },
	    parseUri: function (str) {
			var	o   = this.options,
				m   = o.parser[o.strictMode ? "strict" : "loose"].exec(str),
				uri = {},
				i   = 14;

			while (i--) uri[o.key[i]] = m[i] || "";

			uri[o.q.name] = {};
			uri[o.key[12]].replace(o.q.parser, function ($0, $1, $2) {
				if ($1) uri[o.q.name][$1] = $2;
			});

			return uri;
		},
		
		//normalize IPv4 from http://snipplr.com/view/6915/
		normalizeIPv4 : function(ip)
		{
			if(!(/^(\d+|0x[0-9A-F]+)(\.(\d+|0x[0-9A-F]+)){0,3}$/i).test(ip))	return '';	//invalid
			var parts = ip.split(".");
			var val, dwordToIp;
			var vals = [];
			for(var i=0; i<parts.length; i++)	//for each part
			{
				val = parseInt(parts[i]);	//convert hex or octal to dword/decimal
		 
				//if this is the last part and it's a dword
				//e.g., in an IP of 1192362298 or 71.1179962 or 71.18.314
				if(i == parts.length-1 && i < 3)
				{
					//convert dword to decimal parts
					//e.g., 1179962 becomes 18.1.58
					dwordToIp = [];
					while(i < 4)
					{
						dwordToIp.unshift(val % 256);
						val = (val-dwordToIp[0]) / 256;
						i++;
					}
					vals = vals.concat(dwordToIp);
					break;
				}
				val = val % 256;
				vals.push(val);
			}
			return vals.join(".");	//valid IP address
		}				
	};
}();


parseUriWrapper.options = {
	strictMode: false,
	key: ["source","protocol","authority","userInfo","user","password","host","port","relative","path","directory","file","query","anchor"],
	q:   {
		name:   "queryKey",
		parser: /(?:^|&)([^&=]*)=?([^&]*)/g
	},
	parser: {
		strict: /^(?:([^:\/?#]+):)?(?:\/\/((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?))?((((?:[^?#\/]*\/)*)([^?#]*))(?:\?([^#]*))?(?:#(.*))?)/,
		loose:  /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/
	}
};
