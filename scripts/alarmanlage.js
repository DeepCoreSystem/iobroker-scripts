var debuglevel = 4;
var debugchannel = 'info';

var AdapterId = "javascript.0";

var AlarmZonen = [];
var forceCreateStates = false;

var EventListId = "Ereignisse.Text";
function pushEvent(Kat, Text) {
    if (EventListId === undefined || EventListId === null ) return;
    var theText = Kat+" - "+Text;
    // dwmlog ("Eventlist - adding "+theText,4);
    setState (EventListId,theText);
}


AlarmZonen[0]=new createAlarmZone("Innensicherung",onAlarmEinbruch,onAlarmEinbruchOff);
// AlarmZonen[0].onAlarmZoneDisengaged=checkSHAonDisengage;
AlarmZonen[1]=new createAlarmZone("Aussensicherung 1",onAlarmEinbruch,onAlarmEinbruchOff);
AlarmZonen[2]=new createAlarmZone("Aussensicherung 2",onAlarmEinbruch,onAlarmEinbruchOff);


function createAlarmZone( Name, onZoneAlarm, onZoneAlarmOff ) {
    this.Name = Name;
    
    this.AlarmZoneEngageId = "Alarmzonen."+this.Name.replace(/ /g, "_")+".Engage";
    this.AlarmZoneDisengageId = "Alarmzonen."+this.Name.replace(/ /g, "_")+".Disengage";
    
    this.AlarmZoneEnableId  = "Alarmzonen."+this.Name.replace(/ /g, "_")+".Enabler";
    this.AlarmZoneStateId   = "Alarmzonen."+this.Name.replace(/ /g, "_")+".Status";

    this.AlarmZoneTriggerId = "Alarmzonen."+this.Name.replace(/ /g, "_")+".Trigger";

    
    this.AlarmZoneTriggerDelay = 15;
    this.AlarmZoneEngageDelay  = 5;
    
    this.SecCodeSHAId       = "javascript.0.SecNumber.State";
    this.SecCodeSHAArray    = ["d5eda1170a360a0fde62644760ceeb934e76db8e8f8802ebb9c9366237d77632"];
    
    // Handler
    this.onAlarmZoneAlarm = onZoneAlarm;
    this.onAlarmZoneOff   = onZoneAlarmOff;
    
    this.onAlarmZoneEngaged    = null;
    this.onAlarmZoneDisengaged = null;

    this.onAlarmZoneEnabled = null;
    this.onAlarmZoneDisabled = null;
    
    this.onAlarmZoneTriggered = null;
    
    this.AlarmTimeout = null;
    
    this.AlarmNumOfRepeats = 1;
    this.AlarmRepeatTime   = 0;
    
    // return this;
}

function createStates() {
    for (var i = 0; i<AlarmZonen.length; i++) {
        createState( AlarmZonen[i].AlarmZoneEngageId,                 // name
                     false,    // initial value
                     forceCreateStates,     // kein "Force-Create"
                     { 
                        type: 'boolean', 
                        role: 'button', 
                        name: "Schaltet die Alarmzone "+AlarmZonen[i].Name+" scharf."
        		     }                     
                   );
        createState( AlarmZonen[i].AlarmZoneDisengageId,                 // name
                     false,    // initial value
                     forceCreateStates,     // kein "Force-Create"
                     { 
                        type: 'boolean', 
                        role: 'button', 
                        name: "Setzt die Alarmzone "+AlarmZonen[i].Name+" zurück."
        		     }                     
                   );
        createState( AlarmZonen[i].AlarmZoneTriggerId,                 // name
                     false,    // initial value
                     forceCreateStates,     // kein "Force-Create"
                     { 
                        type: 'boolean', 
                        role: 'button', 
                        name: "Löst die Alarmzone "+AlarmZonen[i].Name+" aus."
        		     }                     
                   );
        createState( AlarmZonen[i].AlarmZoneEnableId,                 // name
                     0,    // initial value
                     forceCreateStates,     // kein "Force-Create"
                     { 
                        type: 'number', 
                        states: ['Aus','Engaging','Scharf'],
                        name: "Schaltet die Alarmzone ein und aus. Geschaltet über Engage und Disengage."
        		     }                     
                   );
        createState( AlarmZonen[i].AlarmZoneStateId,                 // name
                     0,    // initial value
                     forceCreateStates,     // kein "Force-Create"
                     { 
                        type: 'number', 
                        states: ['Off','Triggered','ALARM'],
                        name: "Schaltet die Alarmzone ein und aus."
        		     }                     
                   );
    }
}


// Default handler (sehr einfache Mail-Benachrichtigung)
function onAlarmDefault(i) {
    if ( getState(AlarmZonen[i].AlarmZoneEnableId).val == 2) {
        sendTo("email", {
                from:    '"Haussteuerung (IOBroker)" <infrastructure@dondl.de>',
                subject: "ALARM: Alarmzone "+AlarmZone[i].Name+" ausgelöst!",
                html:    "<h1>Alarm</h1><p>Alarmzone "+AlarmZone[i].Name+" ausgelöst!</p>"
        });
    }
}

function onAlarmEinbruch(i) {
    dwmlog ("Einbruchsalarm ausgelöst, Maßnahmen für Zone "+i,2);    
    if ( getState(AlarmZonen[i].AlarmZoneEnableId).val == 2) {
        dwmlog ("Einbruchsalarm, Maßnahmen starten ...",4);

        // setState("hm-rpc.0.BidCoS-RF.4.PRESS_SHORT"/*HM-RCV-50 BidCoS-RF:4.PRESS_SHORT*/,true);
    }    
}

function onAlarmEinbruchOff(i) {
    dwmlog ("EinbruchsAlarm - Maßnahmen werden beendet",2);    

    // setStateDelayed("hm-rpc.0.HEQ0104946.2.STATE"/*Gong EG:2.STATE*/,false,100);
    // setStateDelayed("hm-rpc.0.GEQ0303423.2.STATE"/*Gong OG:2.STATE*/,false,200);
    // setStateDelayed("hm-rpc.0.HEQ0104946.1.STATE"/*Gong EG:1.STATE*/,false,300);
    // setStateDelayed("hm-rpc.0.GEQ0303423.1.STATE"/*Gong OG:1.STATE*/,false,400);
}

function checkSHAonDisengage(i){
    dwmlog ("checkSHAonDisengage: Verifiziere ..."+i,4);

    var theSHA = getState(AlarmZonen[i].SecCodeSHAId).val;
    var result = false;
    
    for (var j=0; j<AlarmZonen[i].SecCodeSHAArray.length; j++) {
        if ( AlarmZonen[i].SecCodeSHAArray[j] == theSHA ) {
            result = true;
            dwmlog ("checkSHAonDisengage: SHA index "+j+" stimmt überein!",2);
            pushEvent("INFO","Code "+j+" erkannt für Abschaltung der Alarmzone "+AlarmZonen[i].Name);
            break;
        } 
    }
    
    if (!result) {
        dwmlog ("checkSHAonDisengage: Keine Übereinstimmung gefunden!",4);
        pushEvent("WARNUNG","Fehleingabe des Codes!");
    }
    
    return result;
}

function createSubscribes() {
    for ( var i=0; i<AlarmZonen.length; i++ ) {
        // Auslöse-Kette bei Trigger des Alarms
        subscribe({id: AdapterId+"."+AlarmZonen[i].AlarmZoneTriggerId, val:true}, function(data) {
            for (var i=0; i<AlarmZonen.length; i++) {
                if (data.id == AdapterId+"."+AlarmZonen[i].AlarmZoneTriggerId ) {
                    break;
                }
            }
            if ( getState(AlarmZonen[i].AlarmZoneEnableId).val == 2) {
                dwmlog ("Alarmzone Auslösung evaluieren: "+AlarmZonen[i].Name,4);
                var doit = true;
                if ( AlarmZonen[i].onAlarmZoneTriggered !== null) doit = AlarmZonen[i].onAlarmZoneTriggered(i);
                if (doit) {
                    dwmlog ("Alarmzone Auslösung Timer prüfen: "+AlarmZonen[i].Name+" -> "+AlarmZonen[i].AlarmTimeout,4);
                    if (AlarmZonen[i].AlarmTimeout === null) {
                        dwmlog ("Alarmzone Auslösung Timer gestartet: "+AlarmZonen[i].Name,4);
						
                        if (var Current = getState(AlarmZonen[i].AlarmZoneStateId).val != 2) {
							// verzögerte Auslösung, triggered state
							setState(AlarmZonen[i].AlarmZoneStateId,1);
							AlarmZonen[i].AlarmTimeout = setTimeout (function(i) {
									if ( getState(AlarmZonen[i].AlarmZoneEnableId).val == 2) {
										dwmlog ("Alarmzone ausgelöst: "+AlarmZonen[i].Name,4);
										setState(AlarmZonen[i].AlarmZoneStateId,2);
										AlarmZonen[i].AlarmTimeout === null;
									} else {
										setState(AlarmZonen[i].AlarmZoneStateId,0);
										AlarmZonen[i].AlarmTimeout === null;
									}
								},AlarmZonen[i].AlarmZoneTriggerDelay*1000,i);
						} else 
						if (Current == 2) {
							// direkt Durchreichen, wenn Alarm schon gesetzt ist
							setState(AlarmZonen[i].AlarmZoneStateId,2);	
						}
						
                    }
                }
            }
        });
        
        // Engage
        // Hier soll ein Timeout gewartet werden, bis der Enabler wirklich auf AN geht.
        // So können sich z.B. Bewegungsmelder nach Verlassen der Wohnung erst einmal "beruhigen".
        subscribe({id: AdapterId+"."+AlarmZonen[i].AlarmZoneEngageId, val:true}, function(data) {
            for (var i=0; i<AlarmZonen.length; i++) {
                if (data.id == AdapterId+"."+AlarmZonen[i].AlarmZoneEngageId ) {
                    break;
                }
            }
            var doit = true;
            if (AlarmZonen[i].onAlarmZoneEngaged !== null) doit = AlarmZonen[i].onAlarmZoneEngaged(i);
            if (doit) {
                if (AlarmZonen[i].AlarmZoneEngageDelay>0) {
                    setState(AlarmZonen[i].AlarmZoneEnableId,1);
                    setStateDelayed(AlarmZonen[i].AlarmZoneEnableId,2,AlarmZonen[i].AlarmZoneEngageDelay*1000);
                } else setState(AlarmZonen[i].AlarmZoneEnableId,2);
            }
        });

        // Disengage
        // Hier soll ein Timeout gewartet werden, bis der Enabler wirklich auf AN geht.
        // So können sich z.B. Bewegungsmelder nach Verlassen der Wohnung erst einmal "beruhigen".
        subscribe({id: AdapterId+"."+AlarmZonen[i].AlarmZoneDisengageId, val:true}, function(data) {
            for (var i=0; i<AlarmZonen.length; i++) {
                if (data.id == AdapterId+"."+AlarmZonen[i].AlarmZoneDisengageId ) {
                    break;
                }
            }
            var doit = true;
            dwmlog ("Disengage: "+i,4);
            if (AlarmZonen[i].onAlarmZoneDisengaged !== null) {
                doit = AlarmZonen[i].onAlarmZoneDisengaged(i);
            }
            if (doit) {
                clearStateDelayed(AlarmZonen[i].AlarmZoneEnableId);
                setState(AlarmZonen[i].AlarmZoneEnableId,0);
            }
        });
        
        // DoIt - Alarm!
        subscribe({id: AdapterId+"."+AlarmZonen[i].AlarmZoneStateId, val:2}, function(data) {
            for (var i=0; i<AlarmZonen.length; i++) {
                if (data.id == AdapterId+"."+AlarmZonen[i].AlarmZoneStateId ) {
                    break;
                }
            }
            pushEvent("ALARM",AlarmZonen[i].Name+" wurde ausgelöst.");
            
            if (AlarmZonen[i].onAlarmZoneAlarm !== null ) AlarmZonen[i].onAlarmZoneAlarm(i);
        });
        
        // Stop the Alarm
        subscribe({id: AdapterId+"."+AlarmZonen[i].AlarmZoneStateId, val:0, change:"ne" }, function(data) {
            dwmlog("Hui Hui Hui stops: "+JSON.stringify(data),2);
            for (var i=0; i<AlarmZonen.length; i++) {
                if (data.id == AdapterId+"."+AlarmZonen[i].AlarmZoneStateId ) {
                    break;
                }
            }            
            if (data.oldState.val==2) {
                if (AlarmZonen[i].onAlarmZoneOff !== null ) 
                    AlarmZonen[i].onAlarmZoneOff(i);
                pushEvent("WARNUNG",AlarmZonen[i].Name+" wurde nach Auslösung zurückgesetzt.");
            }
        });
        
        subscribe ({id: AdapterId+"."+AlarmZonen[i].AlarmZoneEnableId, val:0, change:"ne"},function(data){
            for (var i=0; i<AlarmZonen.length; i++) {
                if (data.id == AdapterId+"."+AlarmZonen[i].AlarmZoneEnableId ) {
                    break;
                }
            }            
            if (getState(AlarmZonen[i].AlarmZoneStateId).val != 0) {
                setState (AlarmZonen[i].AlarmZoneStateId,0);
                if (AlarmZonen[i].AlarmTimeout !== null) {
                    clearTimeout(AlarmZonen[i].AlarmTimeout);
                    AlarmZonen[i].AlarmTimeout=null;
                }
                pushEvent("WARNUNG",AlarmZonen[i].Name+" wurde nach Auslösung unscharf gestellt.");
            } else pushEvent("INFO",AlarmZonen[i].Name+" wurde unscharf gestellt.");
        });

        subscribe ({id: AdapterId+"."+AlarmZonen[i].AlarmZoneEnableId, val:2, change:"ne"},function(data){
            for (var i=0; i<AlarmZonen.length; i++) {
                if (data.id == AdapterId+"."+AlarmZonen[i].AlarmZoneEnableId ) {
                    break;
                }
            }            
            pushEvent("INFO",AlarmZonen[i].Name+" wurde scharfgestellt.");
        });

    } // for all AlarmZonen
}

createStates();
createSubscribes();
