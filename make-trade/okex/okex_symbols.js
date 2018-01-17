var symbols = [
				'btc', // base crypto
	'bch','eth', // base crypto

	'ltc',
	'etc',
	'neo',
	"1st",
	"act",
	"avt",
	"bcd",
	"bnt",
	"btg",
	"cmt",
	"ctr",
	"cvc",
	"dash",
	"dgd",
	"edo",
	"eos",
	"gas",
	"gnt",
	"hsr",
	"iota",
	"link",
	"lrc",
	"ltc",
	"mana",
	"mco",
	"nuls",
	"omg",
	"pay",
	"pro",
	"qtum",
	"salt",
	"san",
	"sngls",
	"snm",
	"snt",
	"storj",
	"vee",
	"wtc",
	"xuc",
	"zec",
	"zrx"
];
function renderChannel(symbs) {
	var arr = [];
	for(var i=0;i<symbs.length-1;i++){
		var curSymbol = symbs[i].toLowerCase();
			arr.push(curSymbol+'_usdt');
			arr.push(curSymbol+'_btc');
			arr.push(curSymbol+'_eth');
			arr.push(curSymbol+'_bch');
	}
	return arr;
}