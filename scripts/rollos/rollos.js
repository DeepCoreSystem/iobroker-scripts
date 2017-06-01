var debuglevel = 4;
var debugchannel = 'info';

var rollos = [];

var rollosall = {   
                ID_Aussentemperatur: "hm-rpc.0.HEQ0237303.1.TEMPERATURE",
                ID_Feiertag: "feiertage.0.heute.boolean",    
                ID_Urlaubstag: "ical.0.events.Urlaub",
                ID_Tagesabschnitt: "javascript.0.Sonnenstand.Tagesabschnitt",
                ID_Helligkeit: "javascript.0.Helligkeit.Helligkeitsstufe"
};

rollos[0] = new createRollo("Schlafzimmer OG","hm-rpc.0.IEQ0148648.1.LEVEL","07:30","09:30");
rollos[0].ID_Rollokontrolle="Rollos.SchlafzimmerOG";
setWindow(0,"hm-rpc.0.HEQ0159933.1.STATE");
addLight(0,"hm-rpc.0.GEQ0210167.1.LEVEL");
addLight(0,"hm-rpc.0.GEQ0210167.2.LEVEL");
addLight(0,"hm-rpc.0.IEQ0090665.1.STATE");
enableInsektenschutz(0,45);

rollos[1] = new createRollo("Bad OG","hm-rpc.0.JEQ0117120.1.LEVEL","07:31","09:31");
rollos[1].ID_Rollokontrolle="Rollos.BadOG";
addLight(1,"hm-rpc.0.LEQ1318091.1.LEVEL");

rollos[2] = new createRollo ("Küche OG","hm-rpc.0.IEQ0079678.1.LEVEL","07:00");
rollos[2].ID_Rollokontrolle = "Rollos.KuecheOG";
setWindow(2,"hm-rpc.0.LEQ0920193.1.STATE");
addLight(2,"hm-rpc.0.IEQ0541192.1.STATE");

rollos[3] = new createRollo ("Medienraum OG (Nord)","hm-rpc.0.IEQ0079554.1.LEVEL","07:01");
rollos[3].ID_Rollokontrolle = "Rollos.Medienraum_Nord";
setWindow(3,"hm-rpc.0.MEQ0175031.1.STATE");
addLight(3,"hm-rpc.0.IEQ0039909.1.LEVEL");

rollos[4] = new createRollo("Medienraum OG (Ost)","hm-rpc.0.IEQ0080208.1.LEVEL","07:02");
rollos[4].ID_Rollokontrolle = "Rollos.Medienraum_Ost";
addLight(4,"hm-rpc.0.IEQ0039909.1.LEVEL");


/************* code part, change only if you know what you do ***************************/

setOpDelays();
dwmlog ("Konfiguration definiert mit "+rollos.length+" Einträgen: <br/>"+JSON.stringify(rollos),3);


function createRollo(Name, IdRollo, ZeitWerktag, ZeitFeiertag ) {
	this.Name = Name;
	
	if (ZeitWerktag === undefined) this.Oeffnungszeit_Werktag = "07:00"; else this.Oeffnungszeit_Werktag=ZeitWerktag;
	if (ZeitFeiertag === undefined) this.Oeffnungszeit_Feiertag=this.Oeffnungszeit_Werktag; else this.Oeffnungszeit_Feiertag=ZeitFeiertag;
		
	this.OpenSchedule = calcSchedule ([this.Oeffnungszeit_Werktag,this.Oeffnungszeit_Feiertag]);
	
	this.LimitAussentemperatur = 5.0;
	this.Helligkeitslevel1 = 1;
	this.Helligkeitslevel2 = 2;
	
	this.ID_Fenster = null;
	this.ID_Rollo = IdRollo;
	this.ID_RolloMotion =  this.ID_Rollo.replace(".1.LEVEL",".1.WORKING");
	
	this.ID_Licht = [];
	this.ID_Rollokontrolle = "Rollos."+this.Name.replace(/ /g, "_");
	
	this.LevelFensterOffen = 50;
	this.LevelZuSicht = 10;
	this.LevelZuTemp  = 0;
	
	this.LevelSonnenschutz = 0;
	
	this.ID_Insektenschutz = null;
	this.LevelInsektenschutz = 100;
	
	this.LichtAutomaticOffen = true;
	this.OpDelay = 0;
}

function addLight(i,LightId) {
	rollos[i].ID_Licht.push(LightId);
}

function setWindow (i,WindowId) {
	rollos[i].ID_Fenster = WindowId;
}

function enableInsektenschutz(i,Level){
	rollos[i].ID_Insektenschutz=rollos[i].ID_Rollokontrolle+".Insektenschutz";
	rollos[i].LevelInsektenschutz = Level;
}

function setOpDelays() {
	var OpDelay = 100;
	var OpDelayStep = 45000;
	
	for (var i = 0; i<rollos.length; i++) {
		if (rollos[i].OpDelay !== 0) {
			rollos[i].OpDelay = OpDelay;
			OpDelay += OpDelayStep;
		}
	}
}

function parseTime(timeStr){
    var timeobj = {hour:0, min:0};
    
    var time = timeStr.match(/(\d+)(?::(\d\d))?\s*(p?)/i);
    if (!time) {
        return NaN;
    }
    var hours = parseInt(time[1], 10);
    if (hours == 12 && !time[3]) {
        hours = 0;
    }
    else {
        hours += (hours < 12 && time[3]) ? 12 : 0;
    }
    
    timeobj.hour=hours;
    timeobj.min = parseInt(time[2], 10) || 0;

    return timeobj;    
}

function uniq(a) {
    return a.sort().filter(function(item, pos, ary) {
        return !pos || item != ary[pos - 1];
    })
}

function calcSchedule(timearr) {
    var hourarr=[];
    var minarr=[];
    var theobj=null;
    
    for (i=0; i<timearr.length; i++) {
        theobj=parseTime(timearr[i]);
        hourarr.push(theobj.hour);
        minarr.push(theobj.min);
    }
    
    theSchedule = uniq(minarr).toString()+" "+uniq(hourarr).toString()+ " * * *";
    return theSchedule;
}

function setupStates() {
    dwmlog ("setting up states for "+ rollos.length +" entries.",3);
    
    for (var i = 0; i < rollos.length; i++) {
        // set up the objects

        var ID_Rollokontrolle = rollos[i].ID_Rollokontrolle;
        createState( ID_Rollokontrolle+".Rolloautomatik",                   // name
                     2,                                                     // initial value
                     // true,
                     { 
                         min: 0, 
                         max: 1, 
                         type: 'number', 
                         states: ['Aus','Zeitweise Aus','Automatikbetrieb','Automatik mit Sonnenschutz']
        		     }
                     // callback
                   );

        createState( ID_Rollokontrolle+".Grundzustand",                     // name
                     0,                                                     // initial value
                     // true,
                     { 
                         min: 0, 
                         max: 1, 
                         type: 'number', 
                         states: ['Geschlossen','Geöffnet']
        		     }
                     // callback
                   );

        createState (ID_Rollokontrolle+'.Öffnungsgrad',0,{unit: "%"} )
		
		if (rollos[i].ID_Insektenschutz !== null) {
			createState (rollos[i].ID_Insektenschutz,false,{ type: "boolean"} );
		}
    } // for loop ...
}

function setupAllQueue() {
    subscribe({id: rollosall.ID_Helligkeit, change:"ne"}, function(data){
        RolloAllOp();
    });

    subscribe({id: rollosall.ID_Tagesabschnitt, val:4, change:"ne"}, function(data){
        RolloAllOp();
    });
    subscribe({id: rollosall.ID_Tagesabschnitt, val:7, change:"ne"}, function(data){
        RolloAllOp();
    });
    subscribe({id: rollosall.ID_Tagesabschnitt, val:8, change:"ne"}, function(data){
        RolloAllOp();
    });

}

function setupWindows(){
    for (var i = 0; i < rollos.length; i++) {
        if (rollos[i].ID_Fenster != null) { 
            subscribe({ id:rollos[i].ID_Fenster, change:"ne" }, function(data){
                for (var j = 0; j<rollos.length; j++) {
                    if ( rollos[j].ID_Fenster == data.id) {
                        brake_1_in1(j);
                    }
                }
            });
        }
    }
}

function setupLights() {
    dwmlog("entering setupLights",4);
    for (var i = 0; i < rollos.length; i++) {
        for (var j=0; j< rollos[i].ID_Licht.length; j++) {
            dwmlog (rollos[i].Name+": Licht ID subscribing: "+rollos[i].ID_Licht[j],4);    
            subscribe({"id": rollos[i].ID_Licht[j], "change":"ne"}, function(data) {
                for (var k=0; k<rollos.length; k++) {
                    dwmlog("Licht, outer Loop",4);
                    for (var l=0; l<rollos[k].ID_Licht.length; l++) {
                        dwmlog("Licht, inner Loop",4);
                        if ( rollos[k].ID_Licht[l] == data.id) {
                            dwmlog(rollos[k].Name+": Licht ausgelöst mit Id: "+rollos[k].ID_Licht[l]+" bei Licht Index "+l,4);
                            brake_1_in1(k);
                        }
                    }
                }    
            });
            dwmlog (rollos[i].Name+": Licht ID subscribed: "+rollos[i].ID_Licht[j],3);    
        }
    }
}

function setupSchedules() {
    for (var i = 0; i < rollos.length; i++) {
        if (i==0) {
            dwmlog ("setupSchedules für Index: "+i+" auf "+rollos[i].OpenSchedule,4);        
            schedule(rollos[i].OpenSchedule, function() { RolloOp(0); });
        } else if (i==1) {
            dwmlog ("setupSchedules für Index: "+i,4);        
            schedule(rollos[i].OpenSchedule, function(){ RolloOp(1); } );
        } else if (i==2) {
            dwmlog ("setupSchedules für Index: "+i,4);        
            schedule(rollos[i].OpenSchedule, function(){ RolloOp(2); } );
        } else if (i==3) {
            dwmlog ("setupSchedules für Index: "+i,4);        
            schedule(rollos[i].OpenSchedule, function(){ RolloOp(3); } );
        } else if (i==4) {
            dwmlog ("setupSchedules für Index: "+i,4);        
            schedule(rollos[i].OpenSchedule, function(){ RolloOp(4); } );
        } else if (i==5) {
           dwmlog ("setupSchedules für Index: "+i,4);        
            schedule(rollos[i].OpenSchedule, function(){ RolloOp(5); } );
        } else if (i==6) {
           dwmlog ("setupSchedules für Index: "+i,4);        
            schedule(rollos[i].OpenSchedule, function(){ RolloOp(6); } );
        } else if (i==7) {
            dwmlog ("setupSchedules für Index: "+i,4);        
            schedule(rollos[i].OpenSchedule, function(){ RolloOp(7); } );
        } else if (i==8) {
            dwmlog ("setupSchedules für Index: "+i,4);        
            schedule(rollos[i].OpenSchedule, function(){ RolloOp(8); } );
        } else if (i==9) {
            dwmlog ("setupSchedules für Index: "+i,4);        
            schedule(rollos[i].OpenSchedule, function(){ RolloOp(9); } );
        }
	}
}

function RolloAllOp() {
    for ( var i = 0; i<rollos.length; i++) {
        dwmlog ("RolloAllOp: Auslösen RolloOp mit Index: "+i,4);
        setTimeout( RolloOp, rollos[i].OpDelay,i);
    }
}

function setupTempAuto() {
    for ( var i = 0; i<rollos.length; i++) {
        subscribe({id: rollos[i].ID_RolloMotion, val:false }, function(data) {
            dwmlog ("Rollo "+data.name+" stopped motion.",4);
            for (var j = 0; j<rollos.length; j++) {
                if ( rollos[j].ID_RolloMotion == data.id) {
                    setTimeout ( checkTempAuto, 15000, j );	
                }
            }
        });	
    }
}

// helper function - convert a date to a string hh:mm
function getTimeAsStr( theDate ) {
    var result = ("0" + (theDate.getHours()).toString(10)).slice(-2) + ':' +
                 ("0" + (theDate.getMinutes()).toString(10)).slice(-2);
    return result;
}

// Force Variablen


function brake_1_in1(i) {
  dwmlog("brake_1_in1) aufgerufen mit Index "+i,4);
  clearTimeout(brake_1[i].pop());
  brake_1[i].push(setTimeout(function() {
    RolloOp(i);
  }, 5000));
}


// Sonnenschutzfunktion - bestimmt ob die Sonnenschutz-Funktion aktiviert wird.
// Sonderbedingung:
// Die Funktion kennt die Richtung des Fensters. Es gibt z.B. den Fall eines Fensters nach Osten, das morgens geöffnet und dann gleich
// wieder geschlossen würde. Das soll - genau wie bei Fenstern in Westrichtung am Abend - verhindert werden.

function Sonnenschutz() {
    return false;
}

function LichtAn(i){
    dwmlog (rollos[i].Name+": Licht: Überprüfe "+rollos[i].ID_Licht.length+" Einträge",3);
    result = false;
    for (var j = 0; j < rollos[i].ID_Licht.length; j++ ) {
        result = result || ( getState( rollos[i].ID_Licht[j]).val != 0 ); // nicth !== kann 0 oder "false" sein. 
    }

    return result;
}

// Grundzustand bestimmen ...
function RolloZustand(i, now, tagesabschnitt, freier_tag, helligkeit, current, licht) {
    // solls auf oder zu gehen? Dazu checken wir erst mal die Uhrzeit ...
    var result = 0; // 0 = zu; 1=auf    
    
    if ( freier_tag ) {
        var opentime = rollos[i].Oeffnungszeit_Feiertag;
    } else {
        var opentime = rollos[i].Oeffnungszeit_Werktag;
    }

    dwmlog (rollos[i].Name+": RolloZustand -> opentime = "+opentime,3);
        
    if ( now >= opentime )
    {
        if ( tagesabschnitt>3 && tagesabschnitt<7){ 
            result = 1;
        }
        if ( tagesabschnitt==7 || tagesabschnitt==8){ // Goldene oder blaue Stunde ...
            if ( helligkeit >= rollos[i].Helligkeitslevel2 ) {
                result = 1;
            }
            if ( (helligkeit == rollos[i].Helligkeitslevel2) && licht ) {
                result = 0;
            }
            if ( helligkeit <= rollos[i].Helligkeitslevel1 ) {
                result = 0;
            }            
            if ( current == 0 )
            {
                result = 0;
            }
        }
    }
    
    dwmlog (rollos[i].Name+": Rollozustand Result: "+result,3);

    return result;
}

function bestimmeLevel ( i,
                         RolloGrundzustand, 
                         Aussentemperatur, 
                         FensterOffen, 
                         Sonnenschutz, 
                         Unwetterwarnung, 
                         Insektenschutz ) {
    
    var ResultLevel = 0;
    
    dwmlog (rollos[i].Name+": bestimmeLevel aufgerufen mit "+RolloGrundzustand+"; "+Aussentemperatur+"°C; Offen: "+FensterOffen,3);
    
    
    if ( RolloGrundzustand == 0 ) { // Grundzustand ZU     
        if ( FensterOffen ) { // wenn Fenster geöffnet
            ResultLevel = rollos[i].LevelFensterOffen;
        }
        else {
            if ( Aussentemperatur < rollos[i].LimitAussentemperatur ) {
                ResultLevel = rollos[i].LevelZuTemp;
            } else {
                ResultLevel = rollos[i].LevelZuSicht;
            }
        }
    }
    else { // Grundzustand offen
        ResultLevel = 100;
    }
    
    // TODO: Hier könnte man einfügen, dass unter einer bestimmten Innentemperatur
    //       das Rollo komplett geschlossen wird und auch da bleibt.

    if (Unwetterwarnung)
    {
        ResultLevel = 0;
    }
    
    if (Insektenschutz) {
        if (ResultLevel < rollos[i].LevelInsektenschutz) {
            Resultlevel = rollos[i].LevelInsektenschutz;
        }
    }

    dwmlog (rollos[i].Name+": Rollo-Behanghöhe bestimmt: "+ResultLevel,3);
    return ResultLevel;
}

function RolloOp( i ) {
    dwmlog ("RolloOp mit Index aufgerufen: "+i,3);
    var _now = new Date();
    var now = getTimeAsStr(_now);
    var tagesabschnitt = getState(rollosall.ID_Tagesabschnitt).val;
    var freier_tag = getState(rollosall.ID_Feiertag).val || getState (rollosall.ID_Urlaubstag).val || (_now.getDay()==0) || (_now.getDay()==6);
    var helligkeit = getState(rollosall.ID_Helligkeit).val;
    var current    = getState(rollos[i].ID_Rollokontrolle+".Grundzustand").val;
    var licht      = LichtAn(i);
    
    
    dwmlog (rollos[i].Name+": RolloOp aufgerufen um "+now+" Tagesabschnitt: "+tagesabschnitt+" Freier Tag: "+freier_tag+" Helligkeit: "+helligkeit+" Aktuell: "+current+" Licht: "+licht,3);
    
    var Zustand = RolloZustand( i, now, tagesabschnitt, freier_tag, helligkeit, current, licht );
    
    // Bestimme den Level - auf welche Prozentzahl soll gefahren werden?
    
    var Aussentemp = rollos[i].LimitAussentemperatur+1.0;    
    if (rollos[i].ID_Aussentemperatur != 0) {
        Aussentemp = getState(rollosall.ID_Aussentemperatur).val;
    }
    
    var fenster = false;
    if (rollos[i].ID_Fenster != null){
        fenster = getState(rollos[i].ID_Fenster).val;
    }
    
	// Sonnenschutz abchecken??
	
    var Insektenschutz = false;
    if ( rollos[i].ID_Insektenschutz !== null) {
        Insektenschutz = getState(rollos[i].ID_Insektenschutz).val;
    }
    
    var LevelSoll=bestimmeLevel (i, Zustand, Aussentemp, fenster, sonne, false, Insektenschutz);
    
    // Jetzt muss "nur" noch sinnvoll gefahren werden .... 
    var Auto = getState(rollos[i].ID_Rollokontrolle+".Rolloautomatik").val;
    var LevelIst = getState(rollos[i].ID_Rollo).val;


    dwmlog ("Soll: "+LevelSoll+" Ist: "+LevelIst+" Differenz: "+Math.abs(LevelSoll-LevelIst),3);
    
    // noch ein paar checks ...  
    // ... lass es wie's ist, wenn Abweichung weniger als 5%
    if ( Math.abs(LevelSoll-LevelIst)<5 ) {
		LevelSoll = LevelIst;
	}
	
	// ... lass es wie's ist, wenn das Rollo eh schon zu ist.
	// verhindert hin- und herfahren bei Abfallen der Aussentemperatur.
	if ( LevelIst<=(rollos[i].LevelZuSicht) && LevelSoll<=(rollos[i].LevelZuSicht) ) {
		LevelSoll=LevelIst;
	}

    if ( Auto == 1 ){ // Temporär Manuell
        if ( getState(rollos[i].ID_Rollokontrolle+".Grundzustand").val!=Zustand ){ // Wenn sich der Hauptzustand ändert, dann zurück zu Auto
            Auto = 2;
            setState(rollos[i].ID_Rollokontrolle+".Rolloautomatik",Auto);            
        }
    }
    
    if ( Auto >= 2 ){
        if ( LevelIst != LevelSoll ){        
            dwmlog (rollos[i].Name+": Rollo auf Level: "+LevelSoll,3);
            setState (rollos[i].ID_Rollo,LevelSoll);
        }
    }

    setState(rollos[i].ID_Rollokontrolle+".Grundzustand",Zustand);
    setState(rollos[i].ID_Rollokontrolle+".Öffnungsgrad",LevelSoll);
}

function checkTempAuto(i){
	var ist = getState(rollos[i].ID_Rollo).val;
	var soll  = getState(rollos[i].ID_Rollokontrolle+".Öffnungsgrad").val;
	
    if ( ist != soll) {
        dwmlog(rollos[i].Name+" Rollokontrolle auf temp. Automatik geschaltet: Soll "+soll+" Ist: "+ist,3);
        setState(rollos[i].ID_Rollokontrolle+".Rolloautomatik",1);
    }

    if ( ist == 100 && rollos[i].LichtAutomaticOffen ) {
        dwmlog ( "Rollo offen, schalte Raumbeleuchtung ab",3);
        for ( var j = 0; j<rollos[i].ID_Licht.length; j++) {
            if ( getState(rollos[i].ID_Licht[j]).val > 0 ) {
                setTimeout ( function (_lightID) {
                    setState ( _lightID, 0 );
                }, j*500, rollos[i].ID_Licht[j] );
            }
        }
    }
}

/*
function TestRolloFunctions() {
    var testresult = true;
    
    testresult = testresult && ( RolloZustand ("04:33", 3, false, 1, false ) == 0 );
    testresult = testresult && ( RolloZustand ("09:30", 5, false, 3, false ) == 0 );
     
    return testresult;

}
*/

/***********************************************************************
 * Execution starts here :)
 * ********************************************************************/

// Timeout Variablen
var brake_1 = new Array(rollos.length);
for (var i = 0; i < rollos.length; i++) {
    brake_1[i] = [];
}

// set up the objects
setupStates();

// subscriptions fuer alle Rollos (Helligkeit, Tagesabschnitt)
setupAllQueue();

// subscriptions für Licht
setupLights();

// subscriptions für Fenster
setupWindows();

// subscriptions für Rollladen-Bewegung
setupTempAuto();

// schedules
setupSchedules();

RolloAllOp();

dwmlog ("rollo.js - ended",3);
