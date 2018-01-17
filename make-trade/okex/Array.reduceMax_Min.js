Array.prototype.ruduceMax = function (){
	return this.reduce (function (preValue, curValue) {
		return preValue > curValue ? preValue : curValue;
	});
}
Array.prototype.ruduceMin = function (){
	return this.reduce (function (preValue, curValue) {
		return preValue < curValue ? preValue : curValue;
	});
}
