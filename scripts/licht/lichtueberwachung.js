/**
 * Watchdog für Licht
 * 
 * - Einteilung der Beleuchtung in Bereiche mit Anlage von Bereichsvariablen für eine
 *   Dashboard Darstellung in vis
 * - Kopplung von Lampen (Master/Slave) bei Ein/Aus
 * - Automatisches Abschalten nach Zeit und "Abschaltphase"
 * 
 */

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

var LightsOnListHTML = "";
var LightsOnListHTMLId = "Beleuchtung.ListeAnHTML";
var LightsOnCountId = "Beleuchtung.AnzahlAn";
var LightsControlPhaseId = "javascript.0.Beleuchtung.ControlPhase";

var lightspec = [];
var bereiche = [];

// Bereichsspezifikationen
bereiche[0] = new createBereich ("Aussenbereich");
bereiche[1] = new createBereich ("Zentralbereich");
bereiche[2] = new createBereich ("Wohnbereich OG");
bereiche[3] = new createBereich ("Schlafen OG");
bereiche[4] = new createBereich ("Bad OG");
bereiche[5] = new createBereich ("Medien OG");
bereiche[6] = new createBereich ("Speicher");
bereiche[7] = new createBereich ("Büro");
bereiche[8] = new createBereich ("Bad EG");
bereiche[9] = new createBereich ("Keller");

lightspec[0]  = new createLightControl ("Testlicht",[0],"javascript.0.testlight",false);

function createBereich ( Name ) {
    this.Name = Name;
}

function createLightControl ( Name, Bereiche, Id, IsDimmer ) {
    this.Name = Name;
    this.Bereiche = Bereiche;
    this.Id = Id;
    this.IsDimmer = IsDimmer;
    
    // this.SlaveList = [];
    // this.AutoOffModeId = null;
    // this.AutoOffTime = 300;
    // this.AutoOffEnableId = null;
}

function createStates() {
    // Gesamtverschluss
    createState( "Bereiche.Gesamt.Beleuchtung",  // name
                 0,                                                     // initial value
                 0,
                 { 
                     type: 'number', 
                     states: ['Aus','An']
    		     }                     
               );    
    
    // Verschlussflag der Bereiche
    for (i=0; i<bereiche.length; i++) {
        createState( "Bereiche."+bereiche[i].Name.replace(/ /g, "_")+".Beleuchtung",                 // name
                     0,                                                     // initial value
                     0,
                     { 
                         type: 'number', 
                         states: ['Aus','An']
        		     }                     
                   );
    }
    
    // Liste der offenen Fenster
    createState( LightsOnListHTMLId,  // name
                 "",                                                     // initial value
                 false,                                                  // force createion
                 { 
                     type: 'string', 
    		     }                     
               );    

    createState( LightsOnCountId,  // name
                 0,                                                     // initial value
                 { 
                     type: 'number', 
    		     }                     
               );
               
    createState( LightsControlPhaseId ,                 // name
                     0,                                                     // initial value
                     0,
                     { 
                         type: 'number', 
                         min: 0,
                         max: 3,
                         states: ['OnPhase','OnPhase2','OnPhase3','AutoOff','PartyMode']
        		     }                     
                   );
         
}

function LightsWatchAll() {
    var bereichresult=[];
    var LightsOnCount = 0;
    var now = new Date();
    
    for ( i=0; i<bereiche.length; i++ ) bereichresult[i]=false;
    
    LightsOnListHTML = "";
    for ( i=0; i<lightspec.length; i++) {
        var lightstate = false;
        
        if (lightspec[i].isDimmer) {
            lightstate = getState(lightspec[i].Id).val>0;
        } else {
            lightstate = getState(lightspec[i].Id).val;
        }
        
        // betroffene Bereiche checken
        for (j=0; j<lightspec[i].Bereiche.length; j++) {
            bereichresult[lightspec[i].Bereiche[j]] |= lightstate;
        }
        
        // wenn an ...
        if (lightstate) {
            dwmlog ("Eingeschaltet: "+lightspec[i].Name,3);
            addToOnlist (i);
            LightsOnCount++;
        }
        lightspec[i].state=lightstate;
        setState (LightsOnListHTMLId,LightsOnListHTML);
    }
    dwmlog ("Beleuchtung Liste:"+JSON.stringify(lightspec),4);
    setState (LightsOnCountId,LightsOnCount);
    
    // Bereiche abspeichern
    for ( i=0; i<bereiche.length; i++ ) {
        dwmlog ("Bereich "+bereiche[i].Name+":"+bereichresult[i],3);
        if (bereichresult[i]) 
            setState("Bereiche."+bereiche[i].Name.replace(/ /g, "_")+".Beleuchtung",1);
        else
            setState("Bereiche."+bereiche[i].Name.replace(/ /g, "_")+".Beleuchtung",0);
    }
}

function addToOnlist( i ) {
    if (LightsOnListHTML !== "") {
        LightsOnListHTML+="<br/>";
    } 
    LightsOnListHTML += lightspec[i].Name;
}

function LightEvent (data) {
    dwmlog ("LightEvent triggered: "+JSON.stringify(data),4);
    LightsWatchAll();
}


function setupEvents() {
    for (i=0; i<lightspec.length; i++) {
        subscribe({id: lightspec[i].Id, change:"ne"}, function(data){
            LightEvent(data);
        });
    }
}

createStates();
setupEvents();

LightsWatchAll();
