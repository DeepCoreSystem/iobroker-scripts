/**
 * Watchdog für Türen und Fenster
 * 
 * Grundsätzlich:
 * - Eine Tür oder ein Fenster ist offen oder zu ...
 * - und gehört zu einem oder mehreren Bereichen
 * 
 * 
 * 
 */

var debuglevel = 1;
var debugchannel = 'info';

var AdapterId = "javascript.0";

var OpenListHTML = "";
var OpenListHTMLId = "TFStatus.ListeOffenHTML";
var OpenCountId = "TFStatus.NumberOpen";
var TFStatusEnableNotificationId = "TFStatus.EnableNotification";
var TFStatusEnableNotification_Aussen = "TFStatus.EnableNotificationAussen";
var TFStatusEnableNotification_Aussentuer = "TFStatus.EnableNotificationAussentueren";

var TFStatusEnableSurveillanceId = AdapterId+".TFStatus.EnableSurveillance";
var TFStatusEnableSurveillanceEGId = AdapterId+".TFStatus.EnableSurveillanceEG";

var tfspec = [];
var bereiche = [];

// Bereichsspezifikationen
bereiche[0] = new createBereich ("Aussenbereich");
bereiche[1] = new createBereich ("Zentralbereich");
bereiche[2] = new createBereich ("Wohnbereich OG");
bereiche[3] = new createBereich ("Schlafen OG");
bereiche[4] = new createBereich ("Bad OG");
bereiche[5] = new createBereich ("Medien OG");
bereiche[6] = new createBereich ("Jagdzimmer");
bereiche[7] = new createBereich ("Büro");
bereiche[8] = new createBereich ("Bad EG");
bereiche[9] = new createBereich ("Gästezimmer");
bereiche[10] = new createBereich ("Speicher");

// Spezifikationen der Türen Fenster mit Bereichszuordnung
// Bad OG
tfspec[0] = new createTFspec ("Fenster Bad OG (Nord)", [4], "hm-rpc.0.IEQ0204565.1.STATE"/*Fenster Badezimmer OG (Nord):1.STATE*/);

// Wohnbereich OG
tfspec[1] = new createTFspec ("Balkontür", [2], "hm-rpc.0.FEQ0080216.1.STATE"/*Balkontür:1.STATE*/);
tfspec[2] = new createTFspec ("Küchenfenster", [2], "hm-rpc.0.LEQ0920193.1.STATE"/*Fenster Küche OG:1.STATE*/);

// Büro
tfspec[3] = new createTFspec ("Bürofenster links",[7], "hm-rpc.0.FEQ0052060.1.STATE"/*Fenster EG Wohnzimmer (links):1.STATE*/);
tfspec[4] = new createTFspec ("Bürofenster Mitte",[7], "hm-rpc.0.FEQ0052087.1.STATE"/*Fenster EG Wohnzimmer (Mitte):1.STATE*/);
tfspec[5] = new createTFspec ("Bürofenster rechts", [7], "hm-rpc.0.FEQ0052031.1.STATE"/*Fenster EG Wohnzimmer (rechts):1.STATE*/);

// Zentralbereich
tfspec[6] = new createTFspec ("Haustür",                        // Name
                              [0,1],                            // Bereiche
                              "hm-rpc.0.FEQ0080454.1.STATE"/*Haustüre:1.STATE*/,
                              true,                             // löst Notification aus
                              900,                              // Notification nach x Sekunden, 0 = dynamisch
                              300,                              // Notification-Intervall nach Erstauslösung
                              TFStatusEnableNotification_Aussentuer,   // Notification-Enabler - Datapoint mit dem Notification ein/ausgeschaltet werden kann
                              null                              // Callback, default ist doNotification(i)
                             );
enableSurveillance(6);

tfspec[7] = new createTFspec ("Vorhäusl-Fenster",[1],"hm-rpc.0.HEQ0106553.1.STATE"/*Fenster Vorhäusl:1.STATE*/);
tfspec[8] = new createTFspec ("Innere Haustür",[1],"hm-rpc.0.HEQ0363077.1.STATE"/*Haustür innen:1.STATE*/, false, null, null);
tfspec[9] = new createTFspec ("Gang-Fenster",[1],"hm-rpc.0.JEQ0217258.1.STATE"/*Fenster EG Hausgang:1.STATE*/);
tfspec[10]= new createTFspec ("Tür Kellertreppe",[1],"hm-rpc.0.HEQ0362893.1.STATE"/*Tür Kellertreppe:1.STATE*/);
tfspec[11]= new createTFspec ("Kellertür Aussen",[0,1],"hm-rpc.0.MEQ0369609.1.STATE"/*Kellertreppe Aussen:1.STATE*/);
enableSurveillance(11);

tfspec[12]= new createTFspec ("Fenster Computerraum",[1],"hm-rpc.0.IEQ0058618.1.STATE"/*Fenster Computerraum.STATE*/);

// Jagdzimmer
tfspec[13]= new createTFspec ("Fenster Jagdzimmer (Front)", [6], "hm-rpc.0.HEQ0119782.1.STATE"/*Fenster EG Stüberl (Front):1.STATE*/);
tfspec[14]= new createTFspec ("Fenster Jagdzimmer (Haustür)",[6],"hm-rpc.0.HEQ0160028.1.STATE"/*Fenster EG Stüberl (Haustür):1.STATE*/);

// Gästezimmer
tfspec[15]= new createTFspec ("Fenster Gästezimmer (Links)",[9],"hm-rpc.0.FEQ0051906.1.STATE"/*Fenster EG Schlafzimmer (links):1.STATE*/);
tfspec[16]= new createTFspec ("Fenster Gästezimmer (Rechts)",[9],"hm-rpc.0.FEQ0051864.1.STATE"/*Fenster EG Schlafzimmer (rechts):1.STATE*/);

// Medien OG
tfspec[17]= new createTFspec ("Fenster Medienzimmer (Nord)",[5],"hm-rpc.0.MEQ0175031.1.STATE"/*Fenster OG Medienraum (Nord):1.STATE*/);

// Schlafen OG
tfspec[18]= new createTFspec ("Schlafzimmer-Fenster",[3],"hm-rpc.0.HEQ0159933.1.STATE"/*Fenster OG Schlafzimmer:1.STATE*/);

// Bad EG
tfspec[19]= new createTFspec ("Fenster Badezimmer EG (Nord)",[8],"hm-rpc.0.HEQ0363208.1.STATE"/*Fenster EG Badezimmer (Nord):1.STATE*/);
tfspec[20]= new createTFspec ("Fenster Badezimmer EG (Ost)",[8],"hm-rpc.0.HEQ0159828.1.STATE"/*Fenster EG Badezimmer:1.STATE*/);

// Aussenbereich
tfspec[21] = new createTFspec ("Garagentor",                    // Name
                              [0],                              // Bereiche
                              "hm-rpc.0.HEQ0105861.1.STATE"/*Garagentor:1.STATE*/,
                              true,                             // löst Notification aus
                              900,                              // Notification nach x Sekunden, 0 = dynamisch
                              300,                              // Notification-Intervall nach Erstauslösung
                              TFStatusEnableNotification_Aussen,       // Notification-Enabler - Datapoint mit dem Notification ein/ausgeschaltet werden kann
                              null                              // Callback, default ist doNotification(i)
                             );
enableSurveillance(21);

tfspec[22] = new createTFspec ("Tür Hühnerstall",                // Name
                              [0],                              // Bereiche
                              "hm-rpc.0.MEQ0314148.1.STATE"/*Tür Hehnastoi:1.STATE*/,
                              true,                             // löst Notification aus
                              900,                              // Notification nach x Sekunden, 0 = dynamisch
                              300,                              // Notification-Intervall nach Erstauslösung
                              TFStatusEnableNotification_Aussen,       // Notification-Enabler - Datapoint mit dem Notification ein/ausgeschaltet werden kann
                              null                              // Callback, default ist doNotification(i)
                             );
enableSurveillance(22);

tfspec[23]= new createTFspec ("Speicher-Zugangsklappe",[1,10],"hm-rpc.0.JEQ0016562.1.STATE"/*Speicherklappe:1.STATE*/);

//////////////// Ende Konfigurationsbereich ////////////////////////////////////

// Für Experten: Timelimit wird berechnet, evt. abhängig von Aussentemperatur //

function getLimitTime(i) {
    var NotificationAfter = 180;
    
    var temp = getState("hm-rpc.0.HEQ0237303.1.TEMPERATURE"/*Aussentemperatur Balkon:1.TEMPERATURE*/).val;
    
    if (tfspec[i].TFNotificationAfter === 0) {
        NotificationAfter = 15552000; // 180 Tage, also "ewig"
        
        if (temp < 20.0 )  NotificationAfter = 3600;
        if (temp < 15.0 )  NotificationAfter = 1800;
        if (temp < 10.0 )  NotificationAfter = 1200;
        if (temp < 5.0 )   NotificationAfter = 900;
        if (temp < 0 )     NotificationAfter = 600;
        if (temp < -5.0 )  NotificationAfter = 450;
        if (temp < -10.0 ) NotificationAfter = 300;
        
        dwmlog ("Offen-Zeitraum für "+tfspec[i].Name+" wird nach Aussentemp. "+temp+" gesetzt: "+NotificationAfter,4);
    } else {
        NotificationAfter = tfspec[i].TFNotificationAfter;
    }

    return NotificationAfter;
}

function enableSurveillance(i,EnablerId,HandlerOpen, HandlerClose) {
    if (EnablerId === undefined ) tfspec[i].SurveillanceEnablerId = TFStatusEnableSurveillanceId; else tfspec[i].SurveillanceEnablerId = EnablerId;
    if (HandlerOpen === undefined) tfspec[i].TFOnOpen = onOpenSurveillance; else tfspec[i].TFOnOpen = HandlerOpen;
    if (HandlerClose === undefined) tfspec[i].TFOnClose = null; else tfspec[i].TFOnClose = HandlerClose;
    dwmlog ("Surveillance eingeschaltet für: "+tfspec[i].Name+" TFOnOpen: "+tfspec[i].TFOnOpen,4);
}

// Callback function to determine if window Notification should be sent.
// If modified, can be set to time windows etc.
function doNotification(i) {
    var result = (getState(tfspec[i].TFNotificationEnabler).val) && (tfspec[i].TFNotification);
    
    dwmlog ("doNotification für "+tfspec[i].Name+" Ergebnis:"+result,4);
    return result;
}

// Start Code //////////////////////////////////////////////////////////////////

var OpenTimeout = null;

function GongSingle() {
     setState ("hm-rpc.0.BidCoS-RF.1.PRESS_SHORT"/*HM-RCV-50 BidCoS-RF:1.PRESS_SHORT*/,true);   
}

function createBereich ( Name ) {
    this.Name = Name;
}

/**
 * Name: Name Tür oder Fenster
 * Bereiche: Array der Bereich-Indizes, zu denen das Fenster gehört
 * SensorOffen: Id des Sensors
 * TFNotification: Notificationkonfig, soll Notification bei zu Langem Offenstehen ausgelöst werden
 */
function createTFspec ( Name, Bereiche, SensorOffen, TFNotification, TFNotificationAfter, TFNotificationInterval, TFNotificationEnabler, TFDoNotificationCallback ) {
    this.Name = Name;
    this.Bereiche = Bereiche;
    this.SensorOffen = SensorOffen;
    
    if (TFNotification === undefined) this.TFNotification=1; else this.TFNotification=TFNotification;
    if (TFNotificationInterval === undefined) this.TFNotificationInterval=300; else this.TFNotificationInterval=TFNotificationInterval;
    
    if (TFNotificationEnabler === undefined) this.TFNotificationEnabler="TFStatus.EnableNotification"; else this.TFNotificationEnabler=TFNotificationEnabler;
    if (TFDoNotificationCallback === undefined || TFDoNotificationCallback === null ) this.TFDoNotificationCallback=doNotification; else this.TFDoNotificationCallback=TFDoNotificationCallback;
    // dwmlog ("creating Notification Callback ..."+this.TFDoNotificationCallback,4);
    this.TFOnOpen=null;
    this.TFOnClose=null;
    this.SurveillanceEnablerId=null;
    
    // Notification nach TFNotificationAfter Sekunden. Eine 0 heisst dynamisch bestimmt durch die getLimitTime Funktion.
    if (TFNotificationAfter === undefined) this.TFNotificationAfter=0; else this.TFNotificationAfter=TFNotificationAfter;
    this.state = getState (SensorOffen).val;
    if (this.state) {
        this.lastOpenTime = new Date();
    } else {
        this.lastOpenTime = null;
    }

    // Speichert die Zeit für den nächsten Notification
    this.nextNotification=null;
}

function setupStates() {
    // Gesamtverschluss
    createState( "Bereiche.Gesamt.Verschluss",  // name
                 0,                                                     // initial value
                 0,
                 { 
                     type: 'number', 
                     states: ['Zu','Offen']
    		     }                     
               );    
    
    // Verschlussflag der Bereiche
    for (i=0; i<bereiche.length; i++) {
        createState( "Bereiche."+bereiche[i].Name.replace(/ /g, "_")+".Verschluss",                 // name
                     0,                                                     // initial value
                     0,
                     { 
                         type: 'number', 
                         states: ['Zu','Offen']
        		     }                     
                   );
    }
    
    // Liste der offenen Fenster
    createState( OpenListHTMLId,  // name
                 "",                                                     // initial value
                 false,                                                  // force createion
                 { 
                     type: 'string', 
    		     }                     
               );    

    createState( OpenCountId,  // name
                 0,                         // initial value
                 false,
                 { 
                     type: 'number'
    		     }                     
               );    
    createState( TFStatusEnableNotificationId,  // name
                 true,                                                     // initial value
                 false,
                 { 
                     type: 'boolean', 
                     def:  true
    		     }                     
               );    
    createState( TFStatusEnableNotification_Aussen,  // name
                 true,                                                     // initial value
                 { 
                     type: 'boolean', 
                     def:  true
    		     }                     
               );    
    createState( TFStatusEnableNotification_Aussentuer,  // name
                 true,                                                     // initial value
                 { 
                     type: 'boolean', 
                     def:  true
    		     }                     
               );
    
    createState( TFStatusEnableSurveillanceId,  // name
                true,                                                     // initial value
                false, 
                { 
                    type: 'boolean', 
                    states:['Aus','An'],
                    name: "Überwachungsfunktion: Gong bei Öffnen",
    		    }                     
    );}

function setupEvents() {
    for (i=0; i<tfspec.length; i++) {
        subscribe({id: tfspec[i].SensorOffen, change:"ne"}, function(data){
            TFEvent(data);
        });
    }
}


function TFWatchAll() {
    var bereichresult=[];
    var OpenCount = 0;
    var now = new Date();
    
    for ( i=0; i<bereiche.length; i++ ) bereichresult[i]=false;
    
    OpenListHTML = "";
    for ( i=0; i<tfspec.length; i++) {
        var tfstate = getState(tfspec[i].SensorOffen).val;
        
        // betroffene Bereiche checken
        for (j=0; j<tfspec[i].Bereiche.length; j++) {
            bereichresult[tfspec[i].Bereiche[j]] |= tfstate;
        }
        
        // wenn offen ...
        if (tfstate) {
            dwmlog ("Offen: "+tfspec[i].Name,3);
            addToOpenlist (i);
            if (tfspec[i].nextNotification === null ) {
                dwmlog ("Fenster geöffnet ... "+tfspec[i].Name,4);
                tfspec[i].lastOpenTime = now;
                if (tfspec[i].TFNotification) 
                    tfspec[i].nextNotification=new Date( now.getTime()+getLimitTime(i)*1000 );
            }
            OpenCount++;
        } else {
            tfspec[i].lastOpenTime=null;
            tfspec[i].nextNotification=null;
        }
        tfspec[i].state=tfstate;
    }
    if (getState(OpenListHTMLId).val != OpenListHTML)
        setState (OpenListHTMLId,OpenListHTML);

    dwmlog ("TF Liste:"+JSON.stringify(tfspec),4);
    setState (OpenCountId, OpenCount);
    
    // Bereiche abspeichern
    for ( i=0; i<bereiche.length; i++ ) {
        dwmlog ("Bereich "+bereiche[i].Name+":"+bereichresult[i],3);
        setState("Bereiche."+bereiche[i].Name.replace(/ /g, "_")+".Verschluss",bereichresult[i]);
    }
    
    if (OpenCount>0) OpenTimeout=setTimeout (TFWatchAll,60000); 
    
    treatOpenNotification();
}

function addToOpenlist( i ) {
    if (OpenListHTML !== "") {
        OpenListHTML+="<br/>";
    } 
    OpenListHTML += tfspec[i].Name;
}

function treatOpenNotification() {
    var Message = "Fenster oder Türe steht offen:";
    var OpenCount = 0;
    var now = new Date();

    dwmlog ("treatOpenNotification entered",4);
    for (i=0; i<tfspec.length; i++) {
        if (tfspec[i].nextNotification !== null) {
            dwmlog ("treatOpenNotification checking "+tfspec[i].Name,4);
            if ( now.getTime() > tfspec[i].nextNotification.getTime() ) {
                dwmlog ("treatOpenNotification: "+tfspec[i].Name+" ist Notificationkandidat");
                if ( tfspec[i].TFDoNotificationCallback(i) ) {
                // if ((getState(tfspec[i].TFNotificationEnabler).val) && (tfspec[i].TFNotification) ) {
                    Message+=" "+tfspec[i].Name;
                    OpenCount++;
            
                    tfspec[i].nextNotification=new Date( now.getTime()+tfspec[i].TFNotificationInterval*1000 );
                }
            }
        }    
    }
    
    // ... und Ausgabe ... 
    if (OpenCount>0) {
        dwmlog(Message,2);
        sendTo("email", {
                from:    '"Haussteuerung (IOBroker)" <infrastructure@dondl.de>',
                subject: "Warnung: Türen oder Fenster offen!",
                html:    "<h1>Warnung</h1><p>"+Message+"</p>"
        });
        setState ("sayit.0.tts.text",Message);
    }
}

function TFEvent(data) {
    dwmlog ("Event! "+JSON.stringify(data)+" ---> "+data.state.val,4);
    for (i=0; i<tfspec.length;i++){
        if (data.id == tfspec[i].SensorOffen) {
            dwmlog ("Event: TF identifiziert: "+i+" -> "+tfspec[i].Name,4);
            if (data.state.val) {
                if (tfspec[i].TFOnOpen !== null) tfspec[i].TFOnOpen(i);
            } else {
                 if (tfspec[i].TFOnClose !== null) tfspec[i].TFOnClose(i);
            }
        }
    }

    TFWatchAll();
}

function onOpenSurveillance(i) {
    dwmlog ("OnOpenSurveillance für "+tfspec[i].Name + " "+tfspec[i].SurveillanceEnablerId,4);
    
    if ( getState( tfspec[i].SurveillanceEnablerId ).val ) {
        GongSingle(); 
    }
}

function anDaemmerung () {
    setState (TFStatusEnableNotification_Aussentuer,true);
}

function ausDaemmerung () {
    setState (TFStatusEnableNotification_Aussentuer,false);
}

// Ausführung!
schedule({hour: 8, minute: 30}, function () {
    ausDaemmerung();
});

schedule({astro: "dusk"}, function () {
    anDaemmerung();
});


setupStates();
setupEvents();

TFWatchAll();