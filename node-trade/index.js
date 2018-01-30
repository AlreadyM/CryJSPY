const WebSocket								=	require('ws');
const pako									=	require('pako');
const base									= 	require('ccxt');
const ta									= 	require('talib');
const key									= 	require('../../tradeold/personal/key'); // usr personal file
const key_ 									=	{"huobipro":key.key.huobipro[1],"okex":key.key.okex[0]}
const excs									=	['okex'];
// const excs									=	['coingi','qryptos','yunbi','gateio','bitstamp','bithumb','bitfinex'];
// const excs 									= base.exchanges
let   sleep									= 	(ms)  => new Promise (resolve => setTimeout (resolve, ms));
let   log									= 	(msg) => new Promise (resolve => console.log(msg));
let   dosend								= 	(ws,msg) => new Promise (resolve => ws.send(msg));
	  initExchange =(excs)					=>	{
	    (async () => {
		  	for(var i = 0;i<excs.length; i++){
			  		// await sleep(100);
			  		let exc = excs[i],
			  			apikey = key_[exc] ? key_[exc].public  : '',
			  			secret = key_[exc] ? key_[exc].private : ''
			  			;
			  		exc = new base[exc]();
			  		exc.apiKey = apikey;
			  		exc.secret = secret;
			  		// log(exc.fetchOHLCV());
		  		    	try {
							let markets = await exc.loadMarkets();
				  			if (exc.hasFetchOHLCV) {
					  			console.log(exc.id+'--hasFetchOHLCV>>>'+exc.hasFetchOHLCV)
			  					new getOHLCV(exc);
			  				}
			  				// log(markets)
			  				// log(exc.id+'start')
		  		    	}catch (e){
							log(e.message)
		  		    	}
		  	}
	    })()
	  }
	const getOHLCV = function (curexc)	{
				clearInvaliable(curexc);
				let symbolstmp = curexc.markets;
				// console.log(symbolstmp)
				(async () =>{
					// console.log(1)
		  		        for (symbol in symbolstmp) {
							await sleep (101); // milliseconds
		  		        		// log(curexc.id+'--'+symbol);
	  		        		// if(symbol === 'BTC/USDT' || symbol === 'NEO/BTC' || symbol === 'POE/BTC' || symbol === 'PROPY/BTC' ){
	  		        		// if(symbol === 'BTC/USDT' || symbol === 'NEO/BTC' || 'BCX/BCH' || symbol === 'BTG/BCH' || symbol === 'CMT/BCH' || symbol === 'DASH/BCH' || symbol === 'DGD/BCH' || symbol === 'EDO/BCH'){
	  		        			// log(symbol)
		  		        		if(curexc.symbol){
		  		        			// console.log('true'+symbol +'--'+curexc.id)
		  		        			getEachOHLCV(curexc,symbol);
		  		        		}else{
		  		        			console.log(symbol +'--'+curexc.id)
		  		        		}
	  		        		// }
		  		        }
				})()
	  }
	  getEachOHLCV =(exctmp,csy) =>{
			let csymb= csy;
				setInterval(function () {
					(async ()=>{
						try {
							let timely = new Date().getTime();
							let OHLCV = await exctmp.fetchOHLCV (csymb, '1m','','',{"size":200});
							let USEING_OHLCV = groupOHLCV(getneedOHLCV(OHLCV,50,reverseOrNot(exctmp.id)));
							let boll = await getBBANDS(USEING_OHLCV.close,20,2,2,0)
							if(boll[0].length ===1){
								log('~~~~~~~~~~~~~~~~')
							}else{
								// log(new Date()+':'+exctmp.id+'__'+csymb+'__up---->'+boll[0][boll[0].length-1])
								// log(excname+'---middle---->'+boll[1][boll[1].length-6])
								// log(excname+'---down---->'+boll[2][boll[2].length-6])
							}
						}catch (e){
							// let OHLCV = '----->'+e.message + csymb;
							log(new Date()+'<-:->'+csymb+'---'+e.message);
						}
						// log(exctmp.id +'sss=='+csymb);
					})()
				},2000)
    		
	  }
	  
  	  getneedOHLCV = (OHLCV,length,reverse) =>{
	  		let OHLCVtmp = OHLCV,
	  			len = length,
	  			rever = reverse;
	  		if (rever != undefined) {
	  			OHLCVtmp = OHLCVtmp.reverse()
	  		}
	  		OHLCVtmp = OHLCVtmp.slice(OHLCV.length - len)
		  	return OHLCVtmp;
	  }
	  groupOHLCV = (OHLCV) =>{
		  	let candyTmp = OHLCV
		  		,open	= new Array()
		  		,high	= new Array()
		  		,low	= new Array()
		  		,close	= new Array()
		  		,volume	= new Array()
		  		;
		  	for(var i =0; i< candyTmp.length;i++){
		  		open.push(candyTmp[i][1])
		  		high.push(candyTmp[i][2])
		  		low.push(candyTmp[i][3])
		  		close.push(candyTmp[i][4])
		  		volume.push(candyTmp[i][5])
		  	}
		  	return  {
		  		  		"open":open,
		  		  		"high":high,
		  		  		"low":low,
		  		  		"close":close,
		  		  		"volume":volume
		  		  	}
			log(OHLCVtmp);
	  }
	  async function getBBANDS (close,TimePeriod,DevUp,DevDn,MAType) {
	  		let closetmp = close;
	  		let bolltmp=[[0],[0],[0]]
			ta.execute({
				name: "BBANDS",
				startIdx: 0,
				endIdx: closetmp.length - 1,
				inReal: closetmp,
				optInTimePeriod:TimePeriod,
				optInNbDevUp:DevUp,
				optInNbDevDn:DevDn,
				optInMAType:MAType
			},function (err,res) {
				let result = res.result;
				bolltmp = [result.outRealUpperBand,result.outRealMiddleBand,result.outRealLowerBand];
			});
			await sleep(30); // give time to run the calc boll
			return bolltmp;
	  }
	  reverseOrNot = (excname) => {
	  	if(excname === 'huobipro'){
	  		return true;
	  	}
	  }
	// init exchanges
	 // initExchange(excs);

	  clearInvaliable = (exctmp) =>{
		  	let markstmp = exctmp.markets;
		  	if(exctmp.id === 'huobipro'){
		  		delete markstmp['BT1/BTC'];
		  		delete markstmp['BT2/BTC'];
		  	}else if(exctmp.id === 'okex'){
		  		log(2)
		  		for(var symbol in markstmp){
		  			if(symbol.indexOf('USD') > 0 && symbol.indexOf('USDT') < 0){
		  				delete markstmp[symbol]
		  			}
		  		}
		  	}
		  	log(1)
		  	// return markstmp;
	  }
// const huobipro = new base.okex();
// 	  if (huobipro.hasFetchOHLCV) {
// 	      (async () => {
// 	  		// log(await huobipro.fetchBalance())
// 	  		// log(await okex.fetchBalance())
// 	  		let markets = await huobipro.loadMarkets();
// 	  		log('1111')
// 	  		log(huobipro.markets)
// 	          for (symbol in huobipro.markets) {
// 	              // await sleep (huobipro.rateLimit) // milliseconds
// 	              let OHLCV = await huobipro.fetchOHLCV (symbol, '1m')
// 	              log (new Date()+'--'+symbol) // one minute
// 	          }
// 	      }) ()
// 	  }
	  
	  




// ws 
	registerSymbol = (ws,msg)				=>	{
	  	msg = JSON.stringify(msg);
		ws.send(msg);
		log('sended_message--->'+msg);
	};
	registerSymbols = (ws,symbols,isok=false)			=>	{
		(async () =>{
			for(symbol in symbols){
				let currentSymbol = symbols[symbol].id;
				await sleep(100);
				if(currentSymbol === 'btc_usdt' || currentSymbol === 'btcusdt') {
					let msg = isok ?
						{'event':'addChannel','channel':'ok_sub_spot_'+currentSymbol+'_kline_1min'} :
						{"sub": "market.c"+currentSymbol+".kline.1min","id": currentSymbol};
					registerSymbol(ws,msg);
				}
			}
		})()
	}
	keepingPing = (ws)		=> {
		(async () => {
			let timely = 0,oldTimely = -1;
			while(true){
				await sleep(5000);
				timely === oldTimely ? ws.close() : ''
				let msg = {'ping':new Date().getTime()}
				// log(msg);
				// dosend(ws,msg)
				timely +=1;
				// log(timely);
			}
		})()
	}
const wsurl									=	{
													"huobipro":"wss://api.huobi.pro/ws",
													"okex":"wss://real.okex.com:10441/websocket"
												};
const huobipro = new base.huobipro()
const okex = new base.okex()

const ws_huobipro				=	new WebSocket(wsurl.huobipro);
      ws_huobipro.binaryType	=	"arraybuffer";
const ws_okex				=	new WebSocket(wsurl.okex);
      ws_okex.binaryType	=	"string";

// // ws huobipro

ws_huobipro.on('open', () => {
	log('++++++++')
	let msg = {"sub": "market.btcusdt.kline.1min",
					"id": "btcusdt"};

	(async () => {
		let markets = await huobipro.loadMarkets();
		registerSymbols(ws_huobipro,markets);

	})()
	keepingPing(ws_huobipro);
	// registerSymbol(ws_huobipro,msg);
});

ws_huobipro.on('message', function (data) {
	raw_data = data;
	let ua = new Uint8Array(raw_data);
	let json = pako.inflate(ua,{to:"string"});
	data = JSON.parse(json);
	log(data)
	// log('huobipro 1m kline')
	if(data["ping"]){
		log('huobi'+new Date())
			dosend(ws_huobipro,JSON.stringify({"pong":data["ping"]}))
	}
});
ws_huobipro.on('closed', () =>{
	log('ws_huobipro--->closed');
})

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