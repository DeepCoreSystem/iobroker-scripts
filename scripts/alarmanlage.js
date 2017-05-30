
var AdapterId = "javascript.0";

var AlarmZonen = [];

AlarmZonen[0]=new createAlarmZone("Innensicherung",null,null);

function createAlarmZone( Name, onEngaged, onDisengaged ) {
    this.Name = Name;
    
    this.AlarmZoneEngageId = "Alarmzonen."+this.Name.replace(/ /g, "_")+".Engage";
    this.AlarmZoneDisengageId = "Alarmzonen."+this.Name.replace(/ /g, "_")+".Disengage";
    this.AlarmZoneEnableId  = "Alarmzonen."+this.Name.replace(/ /g, "_")+".Enabler";
    this.AlarmZoneStateId   = "Alarmzonen."+this.Name.replace(/ /g, "_")+".Status";
    
    this.AlarmZoneTriggerDelay = 15;
    this.AlarmZoneEngageDelay  = 300;
    
    this.SecCodeSHAId       = null;
    this.SecCodeSHA         = null;
    
    // Handler
    this.onAlarmZoneEngaged = null;
    this.onAlarmZoneDisengaged = null;
    
    this.onAlarmZoneEnabled = null;
    this.onAlarmZoneDisabled = null;
    
    this.onAlarmZoneTriggered = null;

    // return this;
}

function createStates() {
    for (var i = 0; i<AlarmZonen.length; i++) {
        createState( AlarmZonen[i].AlarmZoneEngageId,                 // name
                     false,    // initial value
                     true,     // kein "Force-Create"
                     { 
                        type: 'boolean', 
                        role: 'button', 
                        name: "Schaltet die Alarmzone "+AlarmZonen[i].Name+" scharf."
        		     }                     
                   );
        createState( AlarmZonen[i].AlarmZoneDisengageId,                 // name
                     false,    // initial value
                     true,     // kein "Force-Create"
                     { 
                        type: 'boolean', 
                        role: 'button', 
                        name: "Setzt die Alarmzone "+AlarmZonen[i].Name+" zurück."
        		     }                     
                   );
        createState( AlarmZonen[i].AlarmZoneEnableId,                 // name
                     false,    // initial value
                     true,     // kein "Force-Create"
                     { 
                        type: 'number', 
                        states: ['Aus','Scharf'],
                        name: "Schaltet die Alarmzone ein und aus. Geschaltet über Engage und Disengage."
        		     }                     
                   );
        createState( AlarmZonen[i].AlarmZoneStateId,                 // name
                     false,    // initial value
                     true,     // kein "Force-Create"
                     { 
                        type: 'number', 
                        states: ['Off','Engaged'],
                        name: "Schaltet die Alarmzone ein und aus."
        		     }                     
                   );
    }
}

// Default handler (sehr einfache Mail-Benachrichtigung)
function onAlarmDefault(i) {
    if ( getState(AlarmZone[i].AlarmZoneEnableId).val ) {
        sendTo("email", {
                from:    '"Haussteuerung (IOBroker)" <infrastructure@dondl.de>',
                subject: "ALARM: Alarmzone "+AlarmZone[i].Name+" ausgelöst!",
                html:    "<h1>Alarm</h1><p>Alarmzone "+AlarmZone[i].Name+" ausgelöst!</p>"
        });
    }
}

function createSubscribes() {
    for (i=0; i<AlarmZonen.length; i++) {
        // Auslösung des Alarms
        subscribe({id: AlarmZonen[i].AlarmZoneEngageId, val:true}, function(data) {
            dwmlog ("Alarmzone ausgelöst: "+JSON.stringify(data),4);    
        });       
    }
}

createStates();
createSubscribes();
