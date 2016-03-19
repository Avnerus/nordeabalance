var osmosis = require('osmosis');
var URL = require('url');
var fs = require('fs');

if (process.argv.length < 4) {
    console.log("USAGE: node index.js <USER ID> <PASSWORD>");
    return;
}

osmosis
.get('https://solo1.nordea.fi/nsp/login?language=en&country=fi')
.find("a")
.contains("Password")
.follow('@href')
.then(function(context, data, next) {
    var url = URL.resolve(context.doc().request.url, 'login');
    console.log("Logging in");
    var method = 'POST';
    var form = context.get('form:has(input[type="hidden"])')
    params = {
        userid: process.argv[2],
        pin1: process.argv[3][0],
        pin2: process.argv[3][1],
        pin3: process.argv[3][2],
        pin4: process.argv[3][3],
        JAVASCRIPT_DETECTED: 'true'
    };
    var nodes = form.find('input');
    for (var i = 0; i < nodes.length; i++) {
        var input = nodes[i];
        var name = input.attr('name');
        if (params[name] == undefined) {
            params[name] = input.attr('value');
        }
    }
    console.log(params);
    this.request(method, url, params, function(c) {
        console.log(c.get('td.last > font').text());
        next(c, data);
    });
})
.set({'balance': 'td.last > font'})
.data(function(result) {
    result.balance = result.balance.replace('.',',');
    result.balance = setCharAt(result.balance, result.balance.length - 4, '.');
    console.log(result);
    fs.writeFile("/home/avnerus/Dropbox/Public/balance.json", JSON.stringify(result), function(err) {
        if(err) {
            return console.log("Error writing to file", err);
        }
        console.log("Saved to file");
    });
})
.log(console.log)
.error(console.log)

function setCharAt(str,index,chr) {
        if(index > str.length-1) return str;
            return str.substr(0,index) + chr + str.substr(index+1);
}
