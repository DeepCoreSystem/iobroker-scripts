// helligkeit.js
// Bestimmt eine Helligkeit in Stufen von 0 bis 3
//
// 0 - Finsternis: Bewegen ohne Licht ist nicht mehr möglich
// 1 - Dunkel - Lesen oder feine Arbeiten ist ohne Licht unmöglich
// 2 - Dämmrig - Lesen wird schwierig
// 3 - Hell - Alles ist hell

var ID_Sensor = "hm-rpc.0.JEQ0128191.1.BRIGHTNESS"; /*Bewegung West:1.BRIGHTNESS*/
var ID_Helligkeit = 'Helligkeit.Helligkeitsstufe';

var Level_0 = 50;
var Level_1 = 130;
var Level_2 = 160;

var debuglevel = 4;
var debugchannel = 'info';


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


function Helligkeit() {
    var Wert = getState( ID_Sensor ).val;    
    var Result = 0;
    
    if (Wert > Level_2) {
        Result = 3;
    }
    else if ( Wert > Level_1 ) {
        Result = 2;
    }
    else if ( Wert > Level_0 ) {
        Result = 1;
    }

    log ("Sensorwert: "+Wert+" Helligkeit: "+Result,'info');

    setState( ID_Helligkeit, Result);
}

function InitHelligkeit()
{
createState( ID_Helligkeit,                          // name
             0,                                      // initial value
             // true,
             { min: 0, max: 4, 
			   type: 'number', 
			   states: ['Finsternis','Dunkel','Dämmrig','Hell','Sonne']
		     }
                // callback
           );

    Helligkeit();
}

subscribe({ id: ID_Sensor }, function (data){ Helligkeit(); });

// Initialieren wenn die Engine gestartet wird
InitHelligkeit();
