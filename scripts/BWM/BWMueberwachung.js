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

var MovingListHTML = "";
var MovingListHTMLId = "BWMStatus.ListeOffenHTML";
var MovingCountId = "BWMStatus.NumberMoving";
var BWMStatusEnableNotificationId = "BWMStatus.EnableNotification";
var BWMStatusEnableNotification_Aussen = "BWMStatus.EnableNotificationAussen";

// var BWMStatusEnableSurveillanceId = AdapterId+".BWMStatus.EnableSurveillance";
// var BWMStatusEnableSurveillanceEGId = AdapterId+".BWMStatus.EnableSurveillanceEG";

var BWMspec = [];
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
BWMspec[0] = new createBWMspec ("Fenster Bad OG (Nord)", [4], "hm-rpc.0.IEQ0204565.1.STATE"/*Fenster Badezimmer OG (Nord):1.STATE*/);

// Wohnbereich OG
BWMspec[1] = new createBWMspec ("Balkontür", [2], "hm-rpc.0.FEQ0080216.1.STATE"/*Balkontür:1.STATE*/);
BWMspec[2] = new createBWMspec ("Küchenfenster", [2], "hm-rpc.0.LEQ0920193.1.STATE"/*Fenster Küche OG:1.STATE*/);

// Büro
BWMspec[3] = new createBWMspec ("Bürofenster links",[7], "hm-rpc.0.FEQ0052060.1.STATE"/*Fenster EG Wohnzimmer (links):1.STATE*/);
BWMspec[4] = new createBWMspec ("Bürofenster Mitte",[7], "hm-rpc.0.FEQ0052087.1.STATE"/*Fenster EG Wohnzimmer (Mitte):1.STATE*/);
BWMspec[5] = new createBWMspec ("Bürofenster rechts", [7], "hm-rpc.0.FEQ0052031.1.STATE"/*Fenster EG Wohnzimmer (rechts):1.STATE*/);

// Zentralbereich
BWMspec[6] = new createBWMspec ("Haustür",                        // Name
                              [0,1],                            // Bereiche
                              "hm-rpc.0.FEQ0080454.1.STATE"/*Haustüre:1.STATE*/,
                              true,                             // löst Notification aus
                              900,                              // Notification nach x Sekunden, 0 = dynamisch
                              300,                              // Notification-Intervall nach Erstauslösung
                              BWMStatusEnableNotification_Aussentuer,   // Notification-Enabler - Datapoint mit dem Notification ein/ausgeschaltet werden kann
                              null                              // Callback, default ist doNotification(i)
                             );
enableSurveillance(6);

BWMspec[7] = new createBWMspec ("Vorhäusl-Fenster",[1],"hm-rpc.0.HEQ0106553.1.STATE"/*Fenster Vorhäusl:1.STATE*/);
BWMspec[8] = new createBWMspec ("Innere Haustür",[1],"hm-rpc.0.HEQ0363077.1.STATE"/*Haustür innen:1.STATE*/, false, null, null);
BWMspec[9] = new createBWMspec ("Gang-Fenster",[1],"hm-rpc.0.JEQ0217258.1.STATE"/*Fenster EG Hausgang:1.STATE*/);
BWMspec[10]= new createBWMspec ("Tür Kellertreppe",[1],"hm-rpc.0.HEQ0362893.1.STATE"/*Tür Kellertreppe:1.STATE*/);
BWMspec[11]= new createBWMspec ("Kellertür Aussen",[0,1],"hm-rpc.0.MEQ0369609.1.STATE"/*Kellertreppe Aussen:1.STATE*/);
enableSurveillance(11);

BWMspec[12]= new createBWMspec ("Fenster Computerraum",[1],"hm-rpc.0.IEQ0058618.1.STATE"/*Fenster Computerraum.STATE*/);

// Jagdzimmer
BWMspec[13]= new createBWMspec ("Fenster Jagdzimmer (Front)", [6], "hm-rpc.0.HEQ0119782.1.STATE"/*Fenster EG Stüberl (Front):1.STATE*/);
BWMspec[14]= new createBWMspec ("Fenster Jagdzimmer (Haustür)",[6],"hm-rpc.0.HEQ0160028.1.STATE"/*Fenster EG Stüberl (Haustür):1.STATE*/);

// Gästezimmer
BWMspec[15]= new createBWMspec ("Fenster Gästezimmer (Links)",[9],"hm-rpc.0.FEQ0051906.1.STATE"/*Fenster EG Schlafzimmer (links):1.STATE*/);
BWMspec[16]= new createBWMspec ("Fenster Gästezimmer (Rechts)",[9],"hm-rpc.0.FEQ0051864.1.STATE"/*Fenster EG Schlafzimmer (rechts):1.STATE*/);

// Medien OG
BWMspec[17]= new createBWMspec ("Fenster Medienzimmer (Nord)",[5],"hm-rpc.0.MEQ0175031.1.STATE"/*Fenster OG Medienraum (Nord):1.STATE*/);

// Schlafen OG
BWMspec[18]= new createBWMspec ("Schlafzimmer-Fenster",[3],"hm-rpc.0.HEQ0159933.1.STATE"/*Fenster OG Schlafzimmer:1.STATE*/);

// Bad EG
BWMspec[19]= new createBWMspec ("Fenster Badezimmer EG (Nord)",[8],"hm-rpc.0.HEQ0363208.1.STATE"/*Fenster EG Badezimmer (Nord):1.STATE*/);
BWMspec[20]= new createBWMspec ("Fenster Badezimmer EG (Ost)",[8],"hm-rpc.0.HEQ0159828.1.STATE"/*Fenster EG Badezimmer:1.STATE*/);

// Aussenbereich
BWMspec[21] = new createBWMspec ("Garagentor",                    // Name
                              [0],                              // Bereiche
                              "hm-rpc.0.HEQ0105861.1.STATE"/*Garagentor:1.STATE*/,
                              true,                             // löst Notification aus
                              900,                              // Notification nach x Sekunden, 0 = dynamisch
                              300,                              // Notification-Intervall nach Erstauslösung
                              BWMStatusEnableNotification_Aussen,       // Notification-Enabler - Datapoint mit dem Notification ein/ausgeschaltet werden kann
                              null                              // Callback, default ist doNotification(i)
                             );
enableSurveillance(21);

BWMspec[22] = new createBWMspec ("Tür Hühnerstall",                // Name
                              [0],                              // Bereiche
                              "hm-rpc.0.MEQ0314148.1.STATE"/*Tür Hehnastoi:1.STATE*/,
                              true,                             // löst Notification aus
                              900,                              // Notification nach x Sekunden, 0 = dynamisch
                              300,                              // Notification-Intervall nach Erstauslösung
                              BWMStatusEnableNotification_Aussen,       // Notification-Enabler - Datapoint mit dem Notification ein/ausgeschaltet werden kann
                              null                              // Callback, default ist doNotification(i)
                             );
enableSurveillance(22);

BWMspec[23]= new createBWMspec ("Speicher-Zugangsklappe",[1,10],"hm-rpc.0.JEQ0016562.1.STATE"/*Speicherklappe:1.STATE*/);

//////////////// Ende Konfigurationsbereich ////////////////////////////////////


function enableSurveillance(i,EnablerId,HandlerMoving, HandlerClose) {
    if (EnablerId === undefined ) BWMspec[i].SurveillanceEnablerId = BWMStatusEnableSurveillanceId; else BWMspec[i].SurveillanceEnablerId = EnablerId;
    if (HandlerMoving === undefined) BWMspec[i].BWMOnMoving = onMovingSurveillance; else BWMspec[i].BWMOnMoving = HandlerMoving;
    if (HandlerClose === undefined) BWMspec[i].BWMOnClose = null; else BWMspec[i].BWMOnClose = HandlerClose;
    dwmlog ("Surveillance eingeschaltet für: "+BWMspec[i].Name+" BWMOnMoving: "+BWMspec[i].BWMOnMoving,4);
}

// Callback function to determine if window Notification should be sent.
// If modified, can be set to time windows etc.
function doNotification(i) {
    var result = (getState(BWMspec[i].BWMNotificationEnabler).val) && (BWMspec[i].BWMNotification);
    
    dwmlog ("doNotification für "+BWMspec[i].Name+" Ergebnis:"+result,4);
    return result;
}

// Start Code //////////////////////////////////////////////////////////////////

var MovingTimeout = null;

function GongSingle() {
     setState ("hm-rpc.0.BidCoS-RF.1.PRESS_SHORT"/*HM-RCV-50 BidCoS-RF:1.PRESS_SHORT*/,true);   
}

function createBereich ( Name ) {
    this.Name = Name;
}

/**
 * Name: Name Tür oder Fenster
 * Bereiche: Array der Bereich-Indizes, zu denen das Fenster gehört
 * Id: Id des Sensors
 * BWMNotification: Notificationkonfig, soll Notification bei zu Langem Offenstehen ausgelöst werden
 */
function createBWMspec ( Name, Bereiche, Id ) {
    this.Name = Name;
    this.Bereiche = Bereiche;
    this.Id = Id;
        
    // dwmlog ("creating Notification Callback ..."+this.BWMDoNotificationCallback,4);
    this.BWMOnMoving=null;
    this.SurveillanceEnablerId=null;
    
    this.state = getState (Id).val;
    if (this.state) {
        this.lastMovingTime = new Date();
    } else {
        this.lastMovingTime = null;
    }
}

function setupStates() {
    // GesamtBewegung
    createState( "Bereiche.Gesamt.Bewegung",  // name
                 0,                                                     // initial value
                 0,
                 { 
                     type: 'number', 
                     states: ['Keine Bewegung','Bewegung']
    		     }                     
               );    
    
    // Bewegungflag der Bereiche
    for (i=0; i<bereiche.length; i++) {
        createState( "Bereiche."+bereiche[i].Name.replace(/ /g, "_")+".Bewegung",                 // name
                     0,                                                     // initial value
                     0,
                     { 
                         type: 'number', 
                         states: ['Keine Bewegung','Bewegung']
        		     }                     
                   );
    }
    
    // Liste der Bewegungsmelder mit Movement
    createState( MovingListHTMLId,  // name
                 "",                                                     // initial value
                 false,                                                  // force createion
                 { 
                     type: 'string', 
    		     }                     
               );    

    createState( MovingCountId,  // name
                 0,                         // initial value
                 false,
                 { 
                     type: 'number'
    		     }                     
               );    
}

function setupEvents() {
    for (i=0; i<BWMspec.length; i++) {
        subscribe({id: BWMspec[i].Id, change:"ne"}, function(data){
            BWMEvent(data);
        });
    }
}


function BWMWatchAll() {
    var bereichresult=[];
    var MovingCount = 0;
    var now = new Date();
    
    for ( i=0; i<bereiche.length; i++ ) bereichresult[i]=false;
    
    MovingListHTML = "";
    for ( i=0; i<BWMspec.length; i++) {
        var BWMstate = getState(BWMspec[i].Id).val;
        
        // betroffene Bereiche checken
        for (j=0; j<BWMspec[i].Bereiche.length; j++) {
            bereichresult[BWMspec[i].Bereiche[j]] |= BWMstate;
        }
        
        // wenn Bewegung ...
        if (BWMstate) {
            dwmlog ("Bewegung: "+BWMspec[i].Name,3);
            addToMovinglist (i);
            if (BWMspec[i].nextNotification === null ) {
                dwmlog ("Bewegung erkannt ... "+BWMspec[i].Name,4);
                BWMspec[i].lastMovingTime = now;
            }
            MovingCount++;
        } else {
            BWMspec[i].lastMovingTime=null;
        }
        BWMspec[i].state=BWMstate;
    }
    if (getState(MovingListHTMLId).val != MovingListHTML)
        setState (MovingListHTMLId,MovingListHTML);

    dwmlog ("BWM Liste:"+JSON.stringify(BWMspec),4);
    setState (MovingCountId, MovingCount);
    
    // Bereiche abspeichern
    for ( i=0; i<bereiche.length; i++ ) {
        dwmlog ("Bereich "+bereiche[i].Name+":"+bereichresult[i],3);
        setState("Bereiche."+bereiche[i].Name.replace(/ /g, "_")+".Bewegung",bereichresult[i]);
    }
    
    if (MovingCount>0) MovingTimeout=setTimeout (BWMWatchAll,30000);     
}

function addToMovinglist( i ) {
    if (MovingListHTML !== "") {
        MovingListHTML+="<br/>";
    } 
    MovingListHTML += BWMspec[i].Name;
}

function BWMEvent(data) {
    dwmlog ("BWM Event! "+JSON.stringify(data)+" ---> "+data.state.val,4);
    for (i=0; i<BWMspec.length;i++){
        if (data.id == BWMspec[i].Id) {
            dwmlog ("Event: BWM identifiziert: "+i+" -> "+BWMspec[i].Name,4);
            if (data.state.val) {
                if (BWMspec[i].BWMOnMoving !== null) BWMspec[i].BWMOnMoving(i);
            } else {
                 // if (BWMspec[i].BWMOnClose !== null) BWMspec[i].BWMOnClose(i);
            }
        }
    }

    BWMWatchAll();
}

setupStates();
setupEvents();

BWMWatchAll();