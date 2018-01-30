const WebSocket								=	require('ws');
const pako									=	require('pako');
const base									= 	require('ccxt');
const ta									= 	require('talib');
const key									= 	require('./personal/key'); // usr personal file
const key_ 									=	{"huobipro":key.key.huobipro[1],"okex":key.key.okex[0]}
// const excs									=	['okex'];
// const excs									=	['coingi','qryptos','yunbi','gateio','bitstamp','bithumb','bitfinex'];
const excs 									= base.exchanges
let   sleep									= 	(ms)  => new Promise (resolve => setTimeout (resolve, ms));
let   log									= 	(msg) => new Promise (resolve => console.log(msg));
let   dosend								= 	(ws,msg) => new Promise (resolve => ws.send(msg));
	  initExchange =(excs)					=>	{
	  	for(var i = 0;i<excs.length; i++){
	  		let exc = excs[i],
	  			apikey = key_[exc] ? key_[exc].public  : '',
	  			secret = key_[exc] ? key_[exc].private : ''
	  			;
	  		exc = new base[exc]();
	  		exc.apiKey = apikey;
	  		exc.secret = secret;
	  		// log(exc.fetchOHLCV());
  		    (async () => {
  		    	let markets;
  		    	try {
					markets = await exc.loadMarkets();
	  				getOHLCV(exc,markets);
  		    	}catch (e){
  		    		markets = e.message
  		    	}
				// log(markets)
  		    })()
	  	}
	  }
	  
	  async function getOHLCV (exc,symbols)		{
  			if (exc.hasFetchOHLCV) {
	  		log(exc.id+'--hasFetchOHLCV>>>'+exc.hasFetchOHLCV)

  				let marks = clearInvaliable(exc,symbols),
  					excname = exc.id;
  				while(true){
	  		        for (symbol in marks) {
			            	await sleep (10); // milliseconds
			            	let OHLCV,
			            		csymbol = symbol;
			            	// if(csymbol === 'BTC/USDT'){
			            		// log(symbol)
			            	// if(symbol.indexOf('BTC') > -1){
			            		try {
			            			let OHLCVtmp = await exc.fetchOHLCV (csymbol, '1m');
			            			// OHLCV = exc.id+'+++'+csymbol;
			            			OHLCV = OHLCVtmp;
		            				let USEING_OHLCV = groupOHLCV(getneedOHLCV(OHLCV,50,reverseOrNot(excname)));
			            			// log(USEING_OHLCV.close[USEING_OHLCV.close.length - 1]);
		            				// log(USEING_OHLCV.close);
		            				// log(ta.explain('BBANDS'));
		            				// log(USEING_OHLCV);
		            				// log(USEING_OHLCV.close[USEING_OHLCV.close.length-1]);
		            				let boll = getBBANDS(USEING_OHLCV.close,20,2,2,0)
		            				log(new Date()+':'+excname+'__'+csymbol+'__up---->'+boll[0][boll[0].length-2])
		            				// log(excname+'---middle---->'+boll[1][boll[1].length-6])
		            				// log(excname+'---down---->'+boll[2][boll[2].length-6])
			            		}catch (e){
			            			OHLCV = '----->'+e.message + csymbol;
			            		}
			            		// log(exc.id+'--'+csymbol);
			            		// log(OHLCV.length);
			            		// log(new Date()+'<-:->'+OHLCV);
			            	// }
	  		        }
  					// await sleep(10000);
  				}
  			}
	  }
	  getneedOHLCV = (OHLCV,length,reverse) =>{
	  		let OHLCVtmp ;
	  		if (reverse != undefined) {
	  			OHLCVtmp = OHLCV.reverse()
	  		}else{
	  			OHLCVtmp = OHLCV;
	  		}
	  		OHLCVtmp = OHLCVtmp.slice(OHLCV.length - length)
		  	return OHLCVtmp;
	  }
	  groupOHLCV = (OHLCV) =>{
		  	let OHLCVtmp = {}
		  		,open	= new Array()
		  		,high	= new Array()
		  		,low	= new Array()
		  		,close	= new Array()
		  		,volume	= new Array()
		  		;
		  	for(var i =0; i< OHLCV.length;i++){
		  		open.push(OHLCV[i][1])
		  		high.push(OHLCV[i][2])
		  		low.push(OHLCV[i][3])
		  		close.push(OHLCV[i][4])
		  		volume.push(OHLCV[i][5])
		  	}
		  	OHLCVtmp = {
		  		  		"open":open,
		  		  		"high":high,
		  		  		"low":low,
		  		  		"close":close,
		  		  		"volume":volume
		  		  	}
			// log(OHLCVtmp);
		  	return OHLCVtmp;
	  }
	  getBBANDS = (close,TimePeriod,DevUp,DevDn,MAType) =>{
			ta.execute({
				name: "BBANDS",
				startIdx: 0,
				endIdx: close.length - 1,
				inReal: close,
				optInTimePeriod:TimePeriod,
				optInNbDevUp:DevUp,
				optInNbDevDn:DevDn,
				optInMAType:MAType
			}, function (err,res) {
				let result = res.result;
				boll = [result.outRealUpperBand,result.outRealMiddleBand,result.outRealLowerBand]
			});
			return boll;
	  }
	  reverseOrNot = (excname) => {
	  	if(excname === 'huobipro'){
	  		return true;
	  	}
	  }
	// init exchanges
	 initExchange(excs);

	  clearInvaliable = (exc,marks) =>{
		  	let markstmp = marks;
		  	if(exc.id === 'huobipro'){
		  		delete markstmp['BT1/BTC'];
		  		delete markstmp['BT2/BTC'];
		  	}else if(exc.id === 'okex'){
		  		for(var symbol in markstmp){
		  			if(symbol.indexOf('USD') > 0 && symbol.indexOf('USDT') < 0){
		  				delete markstmp[symbol]
		  			}
		  		}
		  	}
		  	return markstmp;
	  }

	  // if (huobipro.hasFetchOHLCV) {
	  //     (async () => {
	  // 		// log(await huobipro.fetchBalance())
	  // 		// log(await okex.fetchBalance())
	  // 		log(huobipro.markets)
	  //         for (symbol in huobipro.markets) {
	  //             await sleep (huobipro.rateLimit) // milliseconds
	  //             log (await huobipro.fetchOHLCV (symbol, '1m')) // one minute
	  //         }
	  //     }) ()
	  // }
	  
	  




// ws 
// 	registerSymbol = (ws,msg)				=>	{
// 	  	msg = JSON.stringify(msg);
// 		ws.send(msg);
// 		log('sended_message--->'+msg);
// 	};
// 	registerSymbols = (ws,symbols,isok=false)			=>	{
// 		(async () =>{
// 			for(symbol in symbols){
// 				let currentSymbol = symbols[symbol].id;
// 				await sleep(100);
// 				if(currentSymbol === 'btc_usdt' || currentSymbol === 'btcusdt') {
// 					let msg = isok ?
// 						{'event':'addChannel','channel':'ok_sub_spot_'+currentSymbol+'_kline_1min'} :
// 						{"sub": "market."+currentSymbol+".kline.1min","id": currentSymbol};
// 					registerSymbol(ws,msg);
// 				}
// 			}
// 		})()
// 	}
// 	keepingPing = (ws)		=> {
// 		(async () => {
// 			let timely = 0,oldTimely = -1;
// 			while(true){
// 				await sleep(5000);
// 				timely === oldTimely ? ws.close() : ''
// 				let msg = {'ping':new Date().getTime()}
// 				// log(msg);
// 				// dosend(ws,msg)
// 				timely +=1;
// 				// log(timely);
// 			}
// 		})()
// 	}
// const wsurl									=	{
// 													"huobipro":"wss://api.huobi.pro/ws",
// 													"okex":"wss://real.okex.com:10441/websocket"
// 												};


// const ws_huobipro				=	new WebSocket(wsurl.huobipro);
//       ws_huobipro.binaryType	=	"arraybuffer";
// const ws_okex				=	new WebSocket(wsurl.okex);
//       ws_okex.binaryType	=	"string";

// // ws huobipro

// ws_huobipro.on('open', () => {
// 	let msg = {"sub": "market.btcusdt.kline.1min",
// 					"id": "btcusdt"};

// 	(async () => {
// 		let markets = await huobipro.loadMarkets();
// 		registerSymbols(ws_huobipro,markets);

// 	})()
// 	keepingPing(ws_huobipro);
// 	// registerSymbol(ws_huobipro,msg);
// });

// ws_huobipro.on('message', function (data) {
// 	raw_data = data;
// 	let ua = new Uint8Array(raw_data);
// 	let json = pako.inflate(ua,{to:"string"});
// 	data = JSON.parse(json);
// 	// log(data)
// 	// log('huobipro 1m kline')
// 	if(data["ping"]){
// 		log('huobi'+new Date())
// 			dosend(ws_huobipro,JSON.stringify({"pong":data["ping"]}))
// 	}
// });
// ws_huobipro.on('closed', () =>{
// 	log('ws_huobipro--->closed');
// })

// // ws okex

// ws_okex.on('open',() => {
// 	(async () => {
// 		let markets = await okex.loadMarkets();
// 		registerSymbols(ws_okex,markets,true);
// 	})()
// 	keepingPing(ws_okex)
// })
// ws_okex.on('message',(data) => {
// 	// log('okex--->'+data);
// 	var data = JSON.parse(data);
// 	log('okex'+new Date());
// });
// ws_okex.on('close',() =>{
// 	log('ws_okex--->closed');
// })


// 
// let symbol = 'BTC/USDT';
// if (huobipro.hasFetchOHLCV) {
//     (async () => {
// 		// log(await huobipro.fetchBalance())
// 		// log(await okex.fetchBalance())
// 		log(huobipro.markets)
//         for (symbol in huobipro.markets) {
//             await sleep (huobipro.rateLimit) // milliseconds
//             log (await huobipro.fetchOHLCV (symbol, '1m')) // one minute
//         }
//     }) ()
// }