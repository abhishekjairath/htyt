const request = require('request');
const xpath = require('xpath');
const dom = require('xmldom').DOMParser;

exports.find = (query, cb) => {
	const url = "https://www.youtube.com/results?search_query=" + encodeURIComponent(query).replace(/%20/g, "+");
	request(url, function (error, response, body) {
	  if (!error && response.statusCode == 200) {
			const doc = new dom({
				errorHandler : {fatalError:cb(null)}
			}).parseFromString(body);
			
			const nodes = xpath.select("//div[contains(concat(' ', @class, ' '), ' yt-lockup-video ')]/@data-context-item-id", doc);
			return cb(nodes[0].value);
	  }
	});
}