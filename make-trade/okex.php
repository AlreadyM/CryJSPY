<?php
        $base_url = 'https://www.okex.com/api/v1/';
        $api = [
        	'kline' => 'kline.do?symbol=ltc_btc&type=1min',
        	'depth' => 'depth.do?symbol=ltc_btc&size=200'
        ];
        $url = $base_url . $api[depth];
        $url = 'https://www.okex.com/api/v1/kline.do?symbol=ltc_btc&type=1min';
        // echo $url;
        $res = file_get_contents($url);
        echo $res;
?>