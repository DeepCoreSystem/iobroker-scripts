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
bereiche[10] = new createBereich ("Aussenbereich Scheinwerfer");

lightspec[0]  = new createLightControl ("Aussenlicht Eingang",[0],"hm-rpc.0.GEQ0132467.1.STATE"/*Aussen-Laterne:1.STATE*/,false);
lightspec[1]  = new createLightControl ("Aussenlicht Garage",[0],"hm-rpc.0.HEQ0366230.3.STATE"/*Licht Aussenbereich Einfahrt:3.STATE*/,false);
lightspec[2]  = new createLightControl ("Garagenlicht",[0],"hm-rpc.0.HEQ0366230.4.STATE"/*Licht Garage 2:4.STATE*/,false);
lightspec[3]  = new createLightControl ("Aussenstrahler (Nord)",[0,10],"hm-rpc.0.LEQ0016179.3.STATE"/*Licht Aussenbereich Nord:3.STATE*/,false);
lightspec[4]  = new createLightControl ("Aussenstrahler (Ost)",[0,10],"hm-rpc.0.IEQ0383166.1.STATE"/*Licht Aussenbereich Ost:1.STATE*/,false);
lightspec[5]  = new createLightControl ("Aussenstrahler (Süd)",[0,10],"hm-rpc.0.IEQ0383166.4.STATE"/*Licht Aussenbereich Süd:4.STATE*/,false);
lightspec[6]  = new createLightControl ("Aussenstrahler (West)",[0,10],"hm-rpc.0.LEQ0016179.4.STATE"/*Licht Aussenbereich West:4.STATE*/,false);

lightspec[7]  = new createLightControl ("Hausganglicht",[1],"hm-rpc.0.GEQ0132435.1.STATE"/*Licht EG Hausgang:1.STATE*/,false);
lightspec[8]  = new createLightControl ("Licht Diele OG",[1],"hm-rpc.0.GEQ0132540.1.STATE"/*Licht OG Diele.STATE*/,false);
lightspec[9]  = new createLightControl ("Licht Kellertreppe",[1],"hm-rpc.0.FEQ0037826.1.STATE"/*Licht Kellertreppe:1.STATE*/,false);

lightspec[10] = new createLightControl ("Sitzgruppe Wohnzimmer",[2],"hm-rpc.0.IEQ0039792.1.LEVEL"/*Licht Wohnzimmer OG:1.LEVEL*/,true);
lightspec[11] = new createLightControl ("Wohnzimmer Essbereich",[2],"hm-rpc.0.IEQ0104330.1.STATE"/*Licht Wohnzimmer OG Essbereich:1.STATE*/,false);
lightspec[12] = new createLightControl ("Wohnzimmer Vitrine",[2],"hm-rpc.0.IEQ0104330.2.STATE"/*Licht Wohnzimmer OG Essbereich:2.STATE*/,false);
lightspec[13] = new createLightControl ("Balkonlicht",[0,2],"hm-rpc.0.GEQ0132247.1.STATE"/*Licht Balkon:1.STATE*/,false);
lightspec[14] = new createLightControl ("Küchenlicht",[2],"hm-rpc.0.IEQ0541192.1.STATE"/*Licht OG Küche:1.STATE*/,false);
lightspec[15] = new createLightControl ("Küche Untersicht Kochfeld",[2],"hm-rpc.0.IEQ0025932.2.STATE"/*Küche OG - Untersichten (rechts):2.STATE*/,false);
lightspec[16] = new createLightControl ("Küche Untersicht Spüle",[2],"hm-rpc.0.IEQ0025932.1.STATE"/*Küche OG - Untersichten (links):1.STATE*/,false);

lightspec[17] = new createLightControl ("Medienraum",[5],"hm-rpc.0.IEQ0039909.1.LEVEL"/*Dimmer OG Stüberl:1.LEVEL*/,true);

lightspec[18] = new createLightControl ("Schlafzimmer Schrankwand",[3],"hm-rpc.0.IEQ0090665.1.STATE"/*Licht Schlafz OG Schiene:1.STATE*/,false);
lightspec[19] = new createLightControl ("Schlafzimmer Bett rechts",[3],"hm-rpc.0.GEQ0210167.1.LEVEL"/*Licht Schlafzimmer OG (Bett rechts):1.LEVEL*/,true);
lightspec[20] = new createLightControl ("Schlafzimmer Bett links",[3],"hm-rpc.0.GEQ0210167.2.LEVEL"/*Licht Schlafzimmer OG (Bett links):2.LEVEL*/,true);

lightspec[21] = new createLightControl ("Badezimmer OG", [4], "hm-rpc.0.LEQ1318091.1.LEVEL"/*Licht Bad OG:1.LEVEL*/,true);

lightspec[22] = new createLightControl ("Bürolicht",[7],"hm-rpc.0.HEQ0358991.1.LEVEL"/*Dimmer EG Wohnzimmer:1.LEVEL*/,true);
lightspec[23] = new createLightControl ("Büro Leselampe",[7],"hm-rpc.0.GEQ0132331.1.STATE"/*Licht EG Wohnzimmer Leselampe:1.STATE*/,false);

lightspec[24] = new createLightControl ("Licht Speicheraufgang",[6],"hm-rpc.0.LEQ0016179.1.STATE"/*Licht Speicheraufgang:1.STATE*/,false);
lightspec[25] = new createLightControl ("Licht Speichermitte",[6],"hm-rpc.0.LEQ0016179.2.STATE"/*Licht Speichermitte:2.STATE*/,false);
lightspec[26] = new createLightControl ("Licht Balkonüberbau",[6],"hm-rpc.0.IEQ0383166.2.STATE"/*Licht Balkonüberbau:2.STATE*/,false);

lightspec[27] = new createLightControl ("Badezimmer Erdgeschoss",[8],"hm-rpc.0.MEQ0709338.1.STATE"/*Licht Bad EG:1.STATE*/,false);

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
