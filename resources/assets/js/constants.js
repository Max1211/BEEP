/*
 * Bee Monitor
 * Author: Pim van Gennip (pim@iconize.nl)
 *
 */
var LANG 					= [];
var API_URL           	    = (document.URL.indexOf('beep.test') > -1) ? 'https://beep.test/api/' : (document.URL.indexOf('test.beep.nl') > -1) ? 'https://test.beep.nl/api/' : 'https://api.beep.nl/api/';
//var API_URL 				= 'https://api.beep.nl/api/';
var CONNECTION_FREQ_REMOTE  = ((60)*1000);

var COLORS = 
{
	orange:    {r:245, g:166, b: 35},
	red:       {r:208, g:  2, b: 27},
	yellow:    {r:248, g:231, b: 28},
	darkblue:  {r: 24, g: 64, b:111},
	lightblue: {r:120, g:178, b:246},
	lightgreen:{r:126, g:211, b: 33},
	darkgreen: {r: 65, g:117, b:  5},
	purple:    {r:189, g: 16, b:224},
	pink:      {r:237, g: 79, b:126},
	lightgrey: {r:200, g:200, b:200},
	lightgrey1:{r:220, g:220, b:220},
	lightgrey2:{r:230, g:230, b:230},
	darkgrey:  {r:100, g:100, b:100},
	darkergrey:{r:50,  g:50,  b:50},
}

var WEATHER = ['icon','precipIntensity','precipProbability','precipType','temperature','apparentTemperature','dewPoint','humidity','pressure','windSpeed','windGust','windBearing','cloudCover','uvIndex','visibility','ozone']; // weather indicators
var SENSORS = ['t','h','p','l','bc_i','bc_o','weight_kg_corrected','weight_kg','t_i','t_0','t_1','t_2','t_3','t_4','t_5','t_6','t_7','t_8','t_9']; // not actuators
var SOUND   = ['s_fan_4','s_fan_6','s_fan_9','s_fly_a','s_tot','s_bin']; // all sound releated sensors
var DEBUG   = ['bv','rssi','snr']; // all debugging info sensors

var SENSOR_COLOR = {
	t      	:COLORS.pink,   // Measured Temperature (degrees Celsius) (displayed in main screen at temp icon)
	h      	:COLORS.darkblue,  // Measured Humidity (RH% 0_100) (displayed in main screen at humi icon)
	l      	:COLORS.yellow,   // Measured Light measurement value (lux) (displayed in main screen at sun icon)
	p 		:COLORS.darkgreen,
	bv 		:COLORS.darkergrey,
	s_fan_4 :COLORS.pink,
	s_fan_6 :COLORS.pink,
	s_fan_9 :COLORS.pink,
	s_fly_a :COLORS.pink,
	s_tot 	:COLORS.pink,
	bc_i	:COLORS.purple,
	bc_o	:COLORS.purple,
	weight_kg			:COLORS.orange,
	weight_kg_corrected	:COLORS.darkgrey,
	t_i     :COLORS.red,
	t_0     :COLORS.red,
	t_1     :COLORS.red,
	t_2     :COLORS.red,
	t_3     :COLORS.red,
	t_4     :COLORS.red,
	t_5     :COLORS.red,
	t_6     :COLORS.red,
	t_7     :COLORS.red,
	t_8     :COLORS.red,
	t_9     :COLORS.red,
	rssi 	:COLORS.lightgrey,
	snr 	:COLORS.lightgrey1,
	lat 	:COLORS.lightgrey2, 
	lon 	:COLORS.lightgrey2,
	's_bin098_146Hz': COLORS.darkgreen,
	's_bin146_195Hz': COLORS.lightgreen,
	's_bin195_244Hz': COLORS.lightblue,
	's_bin244_293Hz': COLORS.darkblue,
	's_bin293_342Hz': COLORS.purple,
	's_bin342_391Hz': COLORS.pink,
	's_bin391_439Hz': COLORS.red,
	's_bin439_488Hz': COLORS.orange,
	's_bin488_537Hz': COLORS.yellow,
	's_bin537_586Hz': COLORS.lightgrey2,
	's_bin_71_122' : COLORS.darkgreen,
	's_bin_122_173': COLORS.lightgreen,
	's_bin_173_224': COLORS.lightblue,
	's_bin_224_276': COLORS.darkblue,
	's_bin_276_327': COLORS.purple,
	's_bin_327_378': COLORS.pink,
	's_bin_378_429': COLORS.red,
	's_bin_429_480': COLORS.orange,
	's_bin_532_583': COLORS.yellow,
	'icon': COLORS.pink,
	'precipIntensity': COLORS.darkblue,
	'precipProbability': COLORS.darkblue,
	'precipType': COLORS.darkblue,
	'temperature': COLORS.red,
	'apparentTemperature': COLORS.pink,
	'dewPoint': COLORS.pink,
	'humidity': COLORS.lightblue,
	'pressure': COLORS.lightgreen,
	'windSpeed': COLORS.lightgrey,
	'windGust': COLORS.lightblue,
	'windBearing': COLORS.lightblue,
	'cloudCover': COLORS.lightgrey1,
	'uvIndex': COLORS.pink,
	'visibility': COLORS.lightgrey2,
	'ozone': COLORS.lightgrey,
}

var SENSOR_NAMES =
{
	t      	: 't',   
	h      	: 'h', 
	l      	: 'l',  
	p 		: 'p',
	bv 		: 'bv',
	s_fan_4 : 's_fan_4',
	s_fan_6 : 's_fan_6',
	s_fan_9 : 's_fan_9',
	s_fly_a : 's_fly_a',
	s_tot 	: 's_tot',
	bc_i	: 'bc_i',
	bc_o	: 'bc_o',
	weight_kg			: 'weight_kg',
	weight_kg_corrected	: 'weight_kg_corrected',
	t_i		: 't_i',
	t_0		: 't_0',
	t_1		: 't_1',
	t_2		: 't_2',
	t_3		: 't_3',
	t_4		: 't_4',
	t_5		: 't_5',
	t_6		: 't_6',
	t_7		: 't_7',
	t_8		: 't_8',
	t_9		: 't_9',
	rssi	: 'rssi',
	snr 	: 'snr', 
	lat 	: 'lat', 
	lon 	: 'lon', 
	's_bin098_146Hz': '098_146Hz',
	's_bin146_195Hz': '146_195Hz',
	's_bin195_244Hz': '195_244Hz',
	's_bin244_293Hz': '244_293Hz',
	's_bin293_342Hz': '293_342Hz',
	's_bin342_391Hz': '342_391Hz',
	's_bin391_439Hz': '391_439Hz',
	's_bin439_488Hz': '439_488Hz',
	's_bin488_537Hz': '488_537Hz',
	's_bin537_586Hz': '537_586Hz',
	's_bin_71_122' :'71_122', 
	's_bin_122_173':'122_173',
	's_bin_173_224':'173_224',
	's_bin_224_276':'224_276',
	's_bin_276_327':'276_327',
	's_bin_327_378':'327_378',
	's_bin_378_429':'378_429',
	's_bin_429_480':'429_480',
	's_bin_532_583':'532_583',
	'icon': 'icon',
	'precipIntensity': 'precipIntensity',
	'precipProbability': 'precipProbability',
	'precipType': 'precipType',
	'temperature': 'temperature',
	'apparentTemperature': 'apparentTemperature',
	'dewPoint': 'dewPoint',
	'humidity': 'humidity',
	'pressure': 'pressure',
	'windSpeed': 'windSpeed',
	'windGust': 'windGust',
	'windBearing': 'windBearing',
	'cloudCover': 'cloudCover',
	'uvIndex': 'uvIndex',
	'visibility': 'visibility',
	'ozone': 'ozone'
};

var SENSOR_MIN =
{
	t      	: 0,   
	h      	: 0, 
	l      	: 0,  
	p 		: 0,
	bv 		: 0,
	s_fan_4 : 0,
	s_fan_6 : 0,
	s_fan_9 : 0,
	s_fly_a : 0,
	s_tot 	: 0,
	bc_i	: 0,
	bc_o	: 0,
	weight_kg			: 0,
	weight_kg_corrected	: 0,
	t_i		: 0,
	t_0		: 0,
	t_1		: 0,
	t_2		: 0,
	t_3		: 0,
	t_4		: 0,
	t_5		: 0,
	t_6		: 0,
	t_7		: 0,
	t_8		: 0,
	t_9		: 0,
	rssi	: -200,
	snr 	: -20, 
	lat 	: 0, 
	lon 	: 0, 
};

var SENSOR_LOW =
{
	t      	: 0,   
	t_0     : 0,   
	t_1     : 0,   
	t_2     : 0,   
	t_3     : 0,   
	t_4     : 0,   
	t_5     : 0,   
	t_6     : 0,   
	t_7     : 0,   
	t_8     : 0,   
	t_9     : 0,   
	h      	: 40, 
	l      	: 0,  
	p 		: 1013,
	bv 		: 3.0,
	s_fan_4 : 0,
	s_fan_6 : 0,
	s_fan_9 : 0,
	s_fly_a : 0,
	s_tot 	: 0,
	bc_i	: 0,
	bc_o	: 0,
	weight_kg			: 1,
	weight_kg_corrected	: 1,
	t_i		: 34,
	rssi	: -120,
	snr 	: -10, 
	lat 	: 0, 
	lon 	: 0, 
};

var SENSOR_HIGH =
{
	t      	: 30,   
	t_0     : 30,   
	t_1     : 30,   
	t_2     : 30,   
	t_3     : 30,   
	t_4     : 30,   
	t_5     : 30,   
	t_6     : 30,   
	t_7     : 30,   
	t_8     : 30,   
	t_9     : 30,   
	h      	: 90, 
	l      	: 10000,  
	p 		: 1100,
	bv 		: 3.5,
	s_fan_4 : 5,
	s_fan_6 : 5,
	s_fan_9 : 5,
	s_fly_a : 5,
	s_tot 	: 20,
	bc_i	: 5000,
	bc_o	: 5000,
	weight_kg			: 100,
	weight_kg_corrected	: 100,
	t_i		: 37,
	rssi	: -50,
	snr 	: 15, 
	lat 	: 180, 
	lon 	: 180, 
};

var SENSOR_MAX =
{
	t      	: 50,   
	h      	: 100, 
	l      	: 100000,  
	p 		: 1200,
	bv 		: 4,
	s_fan_4 : 10,
	s_fan_6 : 10,
	s_fan_9 : 10,
	s_fly_a : 10,
	s_tot 	: 50,
	bc_i	: 50000,
	bc_o	: 50000,
	weight_kg			: 125,
	weight_kg_corrected	: 125,
	t_i		: 50,
	t_0		: 50,
	t_1		: 50,
	t_2		: 50,
	t_3		: 50,
	t_4		: 50,
	t_5		: 50,
	t_6		: 50,
	t_7		: 50,
	t_8		: 50,
	t_9		: 50,
	rssi	: -40,
	snr 	: 20, 
	lat 	: 180, 
	lon 	: 180, 
};

var SENSOR_UNITS =
{
	t      	: '°C',   
	h      	: '%RH', 
	l      	: 'lux',   
	p 		: 'mbar',
	bv 		: 'V',
	s_fan_4 : '',
	s_fan_6 : '',
	s_fan_9 : '',
	s_fly_a : '',
	s_tot 	: '',
	bc_i	: '#',
	bc_o	: '#',
	weight_kg			: 'kg',
	weight_kg_corrected	: 'kg',
	t_i		: '°C',
	t_0		: '°C',
	t_1		: '°C',
	t_2		: '°C',
	t_3		: '°C',
	t_4		: '°C',
	t_5		: '°C',
	t_6		: '°C',
	t_7		: '°C',
	t_8		: '°C',
	t_9		: '°C',
	rssi	: 'dBm',
	snr 	: 'dB',
	lat 	: '°', 
	lon 	: '°', 
	's_bin098_146Hz': '',
	's_bin146_195Hz': '',
	's_bin195_244Hz': '',
	's_bin244_293Hz': '',
	's_bin293_342Hz': '',
	's_bin342_391Hz': '',
	's_bin391_439Hz': '',
	's_bin439_488Hz': '',
	's_bin488_537Hz': '',
	's_bin537_586Hz': '',
	'icon':'',
	'precipIntensity':'mm/h',
	'precipProbability':'mm/h',
	'precipType':'',
	'temperature':'°C',
	'apparentTemperature':'°C',
	'dewPoint':'°C',
	'humidity':'x100%RH',
	'pressure':'hPa',
	'windSpeed':'m/s',
	'windGust':'m/s',
	'windBearing':'°',
	'cloudCover':'x100%',
	'uvIndex':'',
	'visibility':'km',
	'ozone':'DU',
}