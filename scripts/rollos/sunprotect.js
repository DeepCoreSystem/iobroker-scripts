
var suncalc = require('suncalc'),
    result = getObject("system.adapter.javascript.0"),
    lat = result.native.latitude,
    lon = result.native.longitude;

var fccodes = ['1','2','7'];

var debuglevel = 3;
var debugchannel = 'debug';


function dwmlog( message, level, channel) {
    if (typeof channel === 'undefined') {
        channel = debugchannel;
    }
    if ( typeof level === 'undefined')
    {
        level = debuglevel;
    }
    if ( debuglevel >= level ) {
        log (message, channel );
    }
}


/**
 * Forecast codes see https://www.wunderground.com/weather/api/d/docs?d=resources/phrase-glossary&MR=1
 */
function needsFutureSunProtect( direction, future_hour, refTime )
{
    
    var result = false;

    if (typeof refTime === 'undefined')
    {
        refTime = new Date();
    }

    data_on = "weatherunderground.0.forecast."+future_hour+"h"; 
    data_off = "weatherunderground.0.forecast."+(future_hour+1)+"h"; 

    time_on  = new Date(refTime.getFullYear(), refTime.getMonth(), refTime.getDay(), refTime.getHours()+future_hour+1, 0, 0);
    time_off = new Date(refTime.getFullYear(), refTime.getMonth(), refTime.getDay(), refTime.getHours()+future_hour+2, 0, 0);
    
    dwmlog ( "Referenz: "+refTime.toString()+ " Vorhersagezeit von: "+time_on.toString()+" bis: "+time_off.toString(),4);
    dwmlog ( "Wunderground ref:" + getState(data_on+".time").val,4);
    
    var direction_on = direction + 270;
    var direction_off = direction + 450;
    
    var sunpos_on = suncalc.getPosition(time_on, lat, lon);
    var azimuth_on = sunpos_on.azimuth * 180 / Math.PI + 180;

    var sunpos_off = suncalc.getPosition(time_off, lat, lon);
    var azimuth_off = sunpos_off.azimuth * 180 / Math.PI + 180;
    
    dwmlog ("Sonne bewegt sich zwischen "+azimuth_on.toFixed(1)+"° und "+azimuth_off.toFixed(1)+"°",4);

    if ((azimuth_on+360 >=direction_on && azimuth_on+360<= direction_off) ||
        (azimuth_off+360 >=direction_on && azimuth_off+360 <= direction_off))
    {
        dwmlog ("Sonne überstreicht relevanten Bereich",4);
        dwmlog (data_on+".fctcode: "+getState ( data_on+".fctcode").val+" Relevant:" + (fccodes.indexOf (getState ( data_on+".fctcode").val) > -1),4);
        dwmlog (data_off+".fctcode: "+getState ( data_off+".fctcode").val+" Relevant:" + (fccodes.indexOf (getState ( data_off+".fctcode").val) > -1),4);
        
        if ( fccodes.indexOf (getState ( data_on+".fctcode").val) > -1 || 
             fccodes.indexOf (getState ( data_off+".fctcode").val) > -1   )
        {
            dwmlog ("Sonnenschutz erforderlich!",3,'info');
        }
    }
    else
    {
        dwmlog ("Sonne nicht relevant",4);
    }

    return result;
}

needsFutureSunProtect ( 260,0 );
