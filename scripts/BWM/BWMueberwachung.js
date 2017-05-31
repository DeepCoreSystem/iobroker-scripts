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

var debuglevel = 4;
var debugchannel = 'info';

var AdapterId = "javascript.0";

var MovingListHTML = "";
var MovingListHTMLId = "BWMStatus.ListeBewegungHTML";
var MovingCountId = "BWMStatus.NumberMoving";

var BWMspec = [];
var bereiche = [];

// Bereichsspezifikationen
bereiche[0] = new createBereich ("Aussenbereich");
bereiche[1] = new createBereich ("Zentralbereich");
bereiche[2] = new createBereich ("Keller");
bereiche[3] = new createBereich ("Bad OG");
// bereiche[4] = new createBereich ("Bad EG");

// Spezifikationen der Bewegungsmelder mit Bereichszuordnung
// Aussenbereich
BWMspec[0] = new createBWMspec ("Aussenbereich Eingang", [0], "hm-rpc.0.GEQ0127344.1.MOTION"/*Bewegung Aussenbereich Haustür:1.MOTION*/);
BWMspec[1] = new createBWMspec ("Aussenbereich Terasse", [0], "hm-rpc.0.JEQ0128208.1.MOTION"/*Bewegung Terasse:1.MOTION*/);
BWMspec[2] = new createBWMspec ("Aussenbereich Ost",[0], "hm-rpc.0.JEQ0128202.1.MOTION"/*Bewegung Ost:1.MOTION*/);
BWMspec[3] = new createBWMspec ("Aussenbereich Nord",[0], "hm-rpc.0.LEQ0416445.1.MOTION"/*Bewegung Nord:1*/);
BWMspec[4] = new createBWMspec ("Aussenbereich West",[0], "hm-rpc.0.JEQ0128191.1.MOTION"/*Bewegung West:1.MOTION*/);

// Zentralbereich
BWMspec[5] = new createBWMspec ("Hausgang (Eingang)",[1], "hm-rpc.0.MEQ0670341.3.MOTION"/*Bewegungsmelder Hausgang EG West.MOTION*/);
BWMspec[6] = new createBWMspec ("Hausgang",[1],"hm-rpc.0.GEQ0128067.1.MOTION"/*Bewegung EG Gang:1.MOTION*/);
BWMspec[7] = new createBWMspec ("Diele OG",[1], "hm-rpc.0.GEQ0127607.1.MOTION"/*Bewegung OG Diele:1.MOTION*/);

// Keller
BWMspec[8] = new createBWMspec ("Kellertreppe",[1,2],"hm-rpc.0.GEQ0128297.1.MOTION"/*Bewegung Kellertreppe:1.MOTION*/);
BWMspec[9] = new createBWMspec ("Kellervorraum (Getränke)",[2],"hm-rpc.0.MEQ1848804.3.MOTION"/*Taster Bewegung Kellervorraum:3.MOTION*/);

// Bad OG
BWMspec[10] = new createBWMspec("Bad OG",[3],"hm-rpc.0.JEQ0128709.1.MOTION"/*Bewegung Nord Kaputt:1.MOTION*/);

// Start Code //////////////////////////////////////////////////////////////////

var MovingTimeout = null;

function GongSingle() {
     setState ("hm-rpc.0.BidCoS-RF.1.PRESS_SHORT"/*HM-RCV-50 BidCoS-RF:1.PRESS_SHORT*/,true);   
}

function createBereich ( Name ) {
    this.Name = Name;
}

/**
 * Name: Name Bewegungsmelder
 * Bereiche: Array der Bereich-Indizes, zu denen der BWM gehört
 * Id: Id des Sensors
 */
function createBWMspec ( Name, Bereiche, Id ) {
    this.Name = Name;
    this.Bereiche = Bereiche;
    this.Id = Id;
        
    // dwmlog ("creating Notification Callback ..."+this.BWMDoNotificationCallback,4);
    this.BWMOnMoving=null;

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
                 true,                                                  // force createion
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
    
    if (MovingCount>0) {
        MovingTimeout=setTimeout (BWMWatchAll,30000);
        setState("Bereiche.Gesamt.Bewegung",1);
    } else setState("Bereiche.Gesamt.Bewegung",0);
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