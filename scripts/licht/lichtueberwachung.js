/**
 * Watchdog für Licht
 * 
 * - Einteilung der Beleuchtung in Bereiche mit Anlage von Bereichsvariablen für eine
 *   Dashboard Darstellung in vis
 * - Kopplung von Lampen (Master/Slave) bei Ein/Aus
 * - Automatisches Abschalten nach Zeit und "Abschaltphase"
 * 
 */

var debuglevel = 2;
var debugchannel = 'info';

var AdapterId = "javascript.0";
var LightsOnListHTML = "";
var LightsOnListHTMLId = "Beleuchtung.ListeAnHTML";
var LightsOnCountId = "Beleuchtung.AnzahlAn";
var LightsControlPhaseTriggerId = AdapterId+".Beleuchtung.ControlPhaseTrigger";
var ActivityPhaseId = AdapterId+".Activity.Phase";

var LightsAllOffTriggerId = AdapterId+".Beleuchtung.LightsAllOffTrigger";
var LightsNightModeTriggerId = AdapterId+".Beleuchtung.NightModeTrigger";
var LeaveByNightTriggerId = AdapterId+".Beleuchtung.LeaveByNightTrigger";
var LightsAllOnTriggerId = AdapterId+".Beleuchtung.LightsAllOnTrigger";
var LightsAllOn5minTriggerId = AdapterId+".Beleuchtung.LightsAllOn5minTrigger";

var TagesAbschnittId = AdapterId+".Sonnenstand.Tagesabschnitt"; /*Sonnenstand.Tagesabschnitt*/
var HelligkeitId = AdapterId+".Helligkeit.Helligkeitsstufe";

var lightspec = [];
var trigger = [];
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
enableAutoControl(0);

lightspec[1]  = new createLightControl ("Aussenlicht Garage",[0],"hm-rpc.0.HEQ0366230.3.STATE"/*Licht Aussenbereich Einfahrt:3.STATE*/,false);
enableAutoControl(1);
lightspec[2]  = new createLightControl ("Garagenlicht",[0],"hm-rpc.0.HEQ0366230.4.STATE"/*Licht Garage 2:4.STATE*/,false);
lightspec[2].ControlModeMap2 = [[3,3,2,2,2,2],[3,3,2,2,2,2]];
enableAutoControl(2);

lightspec[3]  = new createLightControl ("Aussenstrahler (Nord)",[0,10],"hm-rpc.0.LEQ0016179.3.STATE"/*Licht Aussenbereich Nord:3.STATE*/,false);
lightspec[4]  = new createLightControl ("Aussenstrahler (Ost)",[0,10],"hm-rpc.0.IEQ0383166.1.STATE"/*Licht Aussenbereich Ost:1.STATE*/,false);
lightspec[5]  = new createLightControl ("Aussenstrahler (Süd)",[0,10],"hm-rpc.0.IEQ0383166.4.STATE"/*Licht Aussenbereich Süd:4.STATE*/,false);
lightspec[6]  = new createLightControl ("Aussenstrahler (West)",[0,10],"hm-rpc.0.LEQ0016179.4.STATE"/*Licht Aussenbereich West:4.STATE*/,false);

lightspec[7]  = new createLightControl ("Hausganglicht",[1],"hm-rpc.0.GEQ0132435.1.STATE"/*Licht EG Hausgang:1.STATE*/,false);
lightspec[7].ControlModeMap2 = [[3,3,3,3,2,2],[1,1,1,1,2,2]];
enableAutoControl(7);

lightspec[8]  = new createLightControl ("Licht Diele OG",[1],"hm-rpc.0.GEQ0132540.1.STATE"/*Licht OG Diele.STATE*/,false);
enableAutoControl(8);

lightspec[9]  = new createLightControl ("Licht Kellertreppe",[1],"hm-rpc.0.FEQ0037826.1.STATE"/*Licht Kellertreppe:1.STATE*/,false);
lightspec[9].ControlModeMap2 = [[3,3,3,3,3,3],[3,3,3,3,3,3]];
enableAutoControl(9);

lightspec[10] = new createLightControl ("Sitzgruppe Wohnzimmer",[2],"hm-rpc.0.IEQ0039792.1.LEVEL"/*Licht Wohnzimmer OG:1.LEVEL*/,true);
lightspec[11] = new createLightControl ("Wohnzimmer Essbereich",[2],"hm-rpc.0.IEQ0104330.1.STATE"/*Licht Wohnzimmer OG Essbereich:1.STATE*/,false);
lightspec[12] = new createLightControl ("Wohnzimmer Vitrine",[2],"hm-rpc.0.IEQ0104330.2.STATE"/*Licht Wohnzimmer OG Essbereich:2.STATE*/,false);
lightspec[13] = new createLightControl ("Balkonlicht",[0,2],"hm-rpc.0.GEQ0132247.1.STATE"/*Licht Balkon:1.STATE*/,false);
enableAutoControl(13,false); // kein Autocoupling, TODO: Eigentlich obsolet, könnte man auch von hier kontrollieren!

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
lightspec[27].ControlModeMap2 = [[3,3,3,2,2,2],[3,3,3,2,2,2]];
enableAutoControl(27);

lightspec[28]  = new createLightControl ("Licht Hehnastoi",[0,9],"hm-rpc.0.FEQ0037826.2.STATE"/*Licht Hehnastoi.STATE*/,false);

function createBereich ( Name ) {
    this.Name = Name;
}

function createLightControl ( Name, Bereiche, Id, IsDimmer ) {
    this.Name = Name;
    this.Bereiche = Bereiche;
    this.Id = Id;
    this.IsDimmer = IsDimmer;
    
    this.ControlModeId = null;

    
    // this.AutoOffTime = 600;
    this.AutoOffCoupling = true;
    
    // Folgend ist eine Map von Activitätsphase und Helligkeit auf ControllerMode
    this.ControlModeMap2 = [[3,3,3,2,2,2],[1,1,1,2,2,2]];
}

/*
function createTrigger(ControllerIndex, Id, On, Invert, EnablingState) {
    this.ControllerIndex=ControllerIndex;
    this.Id = Id;
    this.On = On;
    this.Invert=Invert;
    if (EnablingState !== undefined) {
        this.EnablingState=EnablingState;
    } else this.EnablingState=null;
    
    // lightspec[ControllerIndex].Trigger.push(this);
}
*/

function enableAutoControl (i,doAutoCoupling) {
    var statename="Beleuchtung.Controllers."+lightspec[i].Name.replace(/ /g, "_")+".ControlMode";
    lightspec[i].ControlModeId = statename;
    dwmlog ("Auto Control enabled: "+JSON.stringify(lightspec[i]),4);
    if (doAutoCoupling === undefined) {
        
    } else {
        lightspec[i].AutoOffCoupling = doAutoCoupling;
    }
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
    
    // States für Bereiche
    for (i=0; i<bereiche.length; i++) {
        createState( "Bereiche."+bereiche[i].Name.replace(/ /g, "_")+".Beleuchtung",                 // name
                     0,                                                     // initial value
                     0,
                     { 
                         type: 'number', 
                         states: ['Aus','An']
        		     }                     
                   );
        createState( "Bereiche."+bereiche[i].Name.replace(/ /g, "_")+".LichtAutomatik",                 // name
                     0,                                                     // initial value
                     0,
                     { 
                         type: 'number', 
                         states: ['Aus','An']
        		     }                     
                   );
        createState( "Bereiche."+bereiche[i].Name.replace(/ /g, "_")+".Taster_Aus",                 // name
                     false,     // initial value
                     true,     // kein "Force-Create"
                     { 
                        type: 'boolean', 
                        role: 'button', 
                        name: "Schaltet alle registrierten Licht-Aktoren im Bereich "+bereiche[i].Name+" aus."
        		     }                     
                   );
        createState( "Bereiche."+bereiche[i].Name.replace(/ /g, "_")+".Taster_An",                 // name
                     false,     // initial value
                     true,     // kein "Force-Create"
                     { 
                        type: 'boolean', 
                        role: 'button', 
                        name: "Schaltet alle registrierten Licht-Aktoren im Bereich "+bereiche[i].Name+" EIN."
        		     }                     
                   );
        createState( "Bereiche."+bereiche[i].Name.replace(/ /g, "_")+".Taster_An_5min",                 // name
                     false,     // initial value
                     true,     // kein "Force-Create"
                     { 
                        type: 'boolean', 
                        role: 'button', 
                        name: "Schaltet alle registrierten Licht-Aktoren im Bereich "+bereiche[i].Name+" für 5min EIN."
        		     }                     
                   );
    }
    
    // Liste der eingeschalteten Beleuchtung
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

    createState( LightsControlPhaseTriggerId,  // name
                 false,
                 true,
                 { 
                     type: 'boolean',
                     role: 'button',
                     name: "Erzwingt die sofortige Synchronisierung der Controller mit Helligkeit und Aktivität."
    		     }                     
               );

    createState( LightsNightModeTriggerId,  // name
                 true,
                 false,
                 { 
                     type: 'boolean',
                     role: 'button',
                     name: "Schaltet alle Lichter bis auf den Bereich Schlafzimmer ab"
    		     }                     
               );

    createState( LeaveByNightTriggerId,  // name
                 true,
                 false,
                 { 
                     type: 'boolean',
                     role: 'button',
                     name: "Schaltet alle Lichter bis auf den Bereich Aussenbereich ab"
    		     }                     
               );
               
    createState( LightsAllOffTriggerId,  // name
                 false,
                 false,
                 { 
                     type: 'boolean',
                     role: 'button',
                     name: "Schaltet alle Lichter ab"
    		     }                     
               );
    
    createState( LightsAllOnTriggerId,  // name
                 false,
                 false,
                 { 
                     type: 'boolean',
                     role: 'button',
                     name: "Schaltet alle Lichter EIN"
    		     }                     
               );               

    createState( LightsAllOn5minTriggerId,  // name
                 false,
                 false,
                 { 
                     type: 'boolean',
                     role: 'button',
                     name: "Schaltet alle Lichter für 5min EIN"
    		     }                     
               );
    /*               
    createState( LightsControlPhaseId ,                 // name
                     5,                                                     // initial value
                     false,
                     { 
                         type: 'number', 
                         min: 0,
                         max: 5,
                         states: ['PartyMode','OnPhase1','OnPhase2','OnPhase3','AutoOnOff','AutoOff']
        		     }                     
                   );
    */
    
    for (i=0; i<lightspec.length; i++) {
        dwmlog ("Prüfe Control-State: "+lightspec[i].Name,4);

        var statename=lightspec[i].ControlModeId;
        if (statename !== null) {
            dwmlog ("Genierere Kontroll-State für Light Controller "+statename,4);

            createState( statename ,                 // name
                             2,                                                     // initial value
                             false,
                             { 
                                 type: 'number', 
                                 min: 0,
                                 max: 3,
                                 states: ['AutoDisabled','AutoOn','AutoOff','AutoOnOff']
                		     }                     
                           );

        } else {
            statename="Beleuchtung.Controllers."+lightspec[i].Name.replace(/ /g, "_")+".ControlMode";
            deleteState (statename);
        }
    }
}

/**
 * "Kontrollphase ... korreliert Helligkeiten"
 * - Nacht: Passivphase, Automatisches An- und wieder aus
 * - Frühmorgens: dito :)
 * 
 */
 /*
function calcLightsControlPhase() {
    var tagesabschnitt = getState(TagesAbschnittId).val;
    var Helligkeit = getState(HelligkeitId).val;
    
    var AktivPhase = getState(ActivityPhaseId).val;
    
    var controlphase = 5; // Default Auto-Off

    var ControlPhaseMap = [[4,4,4,5,5],[1,2,3,5,5]];
    controlphase=ControlPhaseMap[AktivPhase][Helligkeit];    

    if ( getState(LightsControlPhaseId) !== 0 || _now=="07:00") { // Keine Änderung im Partymode, Partymode wird um 07:00 zurückgesetzt.
        setState (LightsControlPhaseId,controlphase);
        dwmlog ("Licht-Kontroll-Modus für Tagesabschnitt "+tagesabschnitt+" ist "+controlphase,2);
    }
}
*/

function LightsWatchAll() {
    var bereichresult=[];
    var LightsOnCount = 0;
    var now = new Date();
    
    for ( i=0; i<bereiche.length; i++ ) bereichresult[i]=false;
    
    LightsOnListHTML = "";
    for ( i=0; i<lightspec.length; i++) {
        var lightstate = false;
        
        if (lightspec[i].IsDimmer) {
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

function findLightspec(Id) {
    for (i=0; i<lightspec.length;i++) {
        if (lightspec[i].Id==Id) return i;
    }
}


function LightEvent (data) {
    dwmlog ("LightEvent triggered: "+JSON.stringify(data),4);
    /*
    var i = findLightspec(data.id);
    var ControlMode = 0;
    if (lightspec[i].ControlModeId!==null) ControlMode = getState(lightspec[i].ControlModeId).val;
    
    if (data.state.val > 0) {
        dwmlog ("Licht AN "+i,4);
        if (ControlMode==2 || ControlMode==3) { // Auto-Off oder Auto-OnOff
            if (lightspec[i].IsDimmer) {
                lightspec[i].AutoOffTimer=setStateDelayed(lightspec[i].Id,0,lightspec[i].AutoOffTime*1000,true,function(data){dwmlog("Ausschalten nach Timeout (Dimmer)",4);});
            } else {
                lightspec[i].AutoOffTimer=setStateDelayed(lightspec[i].Id,false,lightspec[i].AutoOffTime*1000,true,function(data){dwmlog("Ausschalten nach Timeout",4);});
            }
        }
    } else {
        dwmlog ("Licht AUS "+i+" "+lightspec[i].AutoOffTimer,2);
        clearStateDelayed(data.id);
        lightspec[i].AutoOffTimer=null;
    }
    */
    
    LightsWatchAll();
}

// TODO: Verifizieren, dass die Automatische Kopplung nicht das "AutoDiabled"
//       der einzelnen Controller überschreibt.
//       Erinnerung: Das ist nicht der Partymode. Die Einzelcontroller im Partymode
//       werden auf "AutoOn" geschaltet!
function coupleControlModes() {
    var Activity = getState(ActivityPhaseId).val;
    var Helligkeit = getState(HelligkeitId).val;
    
    for (i=0; i<lightspec.length; i++) {
        if ( lightspec[i].ControlModeId!==null) {
            if (lightspec[i].AutoOffCoupling) { // nur, wenn Auto-Modus für den Controller nicht abgeschaltet ist.
                var cm = lightspec[i].ControlModeMap2[Activity][Helligkeit];
                dwmlog ("coupleControlModes: ControlMode für "+lightspec[i].Name+" ist: "+cm,4);
                setState(lightspec[i].ControlModeId,cm);
            }
        }
    }
}

function abschaltenBereich(i) {
    var DelayCounter = 0;
    dwmlog ("Bereich abschalten: "+bereiche[i].Name,4);
    for (j=0; j<lightspec.length; j++) {
        for (k=0; k<lightspec[j].Bereiche.length; k++) {
            if (lightspec[j].Bereiche[k] == i) {
                dwmlog ("Bereichsabschaltung - schalte ab: "+lightspec[j].Name,4);
                if (getState(lightspec[j].Id).val) {
                    if (lightspec[j].IsDimmer) 
                        setStateDelayed(lightspec[j].Id,0,DelayCounter*100);
                    else
                        setStateDelayed(lightspec[j].Id,false,DelayCounter*100);
                    DelayCounter++;
                }
                break;
            }
        }
    }
}

function abschaltenBereiche( barray ) {
    var DelayCounter = 0;
    for (ii=0; ii<barray.length;ii++) {
        i=barray[ii];
        dwmlog ("Bereich abschalten: "+bereiche[i].Name,2);
        for (j=0; j<lightspec.length; j++) {
            for (k=0; k<lightspec[j].Bereiche.length; k++) {
                if (lightspec[j].Bereiche[k] == i) {
                    dwmlog ("Bereichsabschaltung - schalte ab: "+lightspec[j].Name,2);
                    if (getState(lightspec[j].Id).val) {
                        if (lightspec[j].IsDimmer) 
                            setStateDelayed(lightspec[j].Id,0,DelayCounter*100);
                        else
                            setStateDelayed(lightspec[j].Id,false,DelayCounter*100);
                        DelayCounter++;
                    }
                    break;
                }
            }
        }
    }
}

function abschaltenAlle() {
    var DelayCounter=0;
    for (j=0; j<lightspec.length; j++) {
        if (getState(lightspec[j].Id).val) {
            if (lightspec[j].IsDimmer) 
                setStateDelayed(lightspec[j].Id,0,DelayCounter*100);
            else
                setStateDelayed(lightspec[j].Id,false,DelayCounter*100);
            DelayCounter++;
        }
    }
}

function anschaltenBereich(i,sekunden) {
    var DelayCounter = 0;
    if (sekunden === undefined) sekunden = 0;
    if (sekunden != 0 ) DelayCounter = 1;
    
    dwmlog ("Bereich einschalten: "+bereiche[i].Name,4);
    for (j=0; j<lightspec.length; j++) {
        for (k=0; k<lightspec[j].Bereiche.length; k++) {
            if (lightspec[j].Bereiche[k] == i) {
                dwmlog ("Bereichseinschaltung - schalte ein: "+lightspec[j].Name,4);
                // if (! getState(lightspec[j].Id).val) {
                    if (sekunden!=0) {
                        if (lightspec[j].IsDimmer)
                            setStateDelayed(lightspec[j].Id.replace("LEVEL","ON_TIME"),sekunden,(DelayCounter*100)-50);
                        else
                            setStateDelayed(lightspec[j].Id.replace("STATE","ON_TIME"),sekunden,(DelayCounter*100)-50);
                    }
                    if (lightspec[j].IsDimmer) {
                        dwmlog (lightspec[j].Name+" ist Dimmer ...",4);
                        setStateDelayed(lightspec[j].Id,75,DelayCounter*100);
                    }
                    else
                        setStateDelayed(lightspec[j].Id,true,DelayCounter*100);
                    DelayCounter++;
                // }
                break;
            }
        }
    }
}

function anschaltenBereiche( barray, sekunden ) {
    var DelayCounter = 0;
    if (sekunden === undefined) sekunden = 0;
    if (sekunden != 0 ) DelayCounter = 1;
    
    for (ii=0; ii<barray.length;ii++) {
        i=barray[ii];
        dwmlog ("Bereich einschalten: "+bereiche[i].Name,4);
        for (j=0; j<lightspec.length; j++) {
            for (k=0; k<lightspec[j].Bereiche.length; k++) {
                if (lightspec[j].Bereiche[k] == i) {
                    dwmlog ("Bereichseinschaltung - schalte ab: "+lightspec[j].Name,4);
                    // if (! getState(lightspec[j].Id).val) {
                        if (sekunden!=0) {
                            if (lightspec[j].IsDimmer)
                                setStateDelayed(lightspec[j].Id.replace("LEVEL","ON_TIME"),sekunden,(DelayCounter*100)-50);
                            else
                                setStateDelayed(lightspec[j].Id.replace("STATE","ON_TIME"),sekunden,(DelayCounter*100)-50);
                        }
                        if (lightspec[j].IsDimmer) 
                            setStateDelayed(lightspec[j].Id,75,DelayCounter*100);
                        else
                            setStateDelayed(lightspec[j].Id,true,DelayCounter*100);
                        DelayCounter++;
                    // }
                    break;
                }
            }
        }
    }
}

function anschaltenAlle(sekunden) {
    dwmlog ("Alle Lichter für "+sekunden+" anschalten",1);
    var DelayCounter = 0;
    if (sekunden === undefined) sekunden = 0;
    if (sekunden != 0 ) DelayCounter = 1;
    
    for (j=0; j<lightspec.length; j++) {
        // if (! getState(lightspec[j].Id).val) {
            if (sekunden!=0) {
                if (lightspec[j].IsDimmer)
                    setStateDelayed(lightspec[j].Id.replace("LEVEL","ON_TIME"),sekunden,(DelayCounter*100)-50);
                else
                    setStateDelayed(lightspec[j].Id.replace("STATE","ON_TIME"),sekunden,(DelayCounter*100)-50);
            }
            if (lightspec[j].IsDimmer) 
                setStateDelayed(lightspec[j].Id,100,DelayCounter*100);
            else
                setStateDelayed(lightspec[j].Id,true,DelayCounter*100);
            DelayCounter++;
        // }
    }
}

function findBereich(data) {
    var Compare="";
    var result = -1;
    
    dwmlog ("Findbereich erhielt: "+JSON.stringify(data),4);
    
    for (i=0; i<bereiche.length; i++) {
        Compare = AdapterId+".Bereiche."+bereiche[i].Name.replace(/ /g, "_")+".";
        dwmlog ("Vergleich: "+data.id+" mit "+Compare,4);
        if (data.id.indexOf(Compare)!==-1) {
            result = i;
            break;
        }
    }
    dwmlog ("Findebereich Ergebnis: "+result,4);
    return result;
}

/********************* Spezialfunktionen :) ***********************************/

function setupEvents() {
    subscribe ({id: HelligkeitId, change:"ne"}, function(data){ coupleControlModes(); });
    subscribe ({id: ActivityPhaseId, change:"ne"}, function(data){ coupleControlModes(); });
    subscribe ({id: LightsControlPhaseTriggerId, val:true}, function(data){ 
        coupleControlModes(); 
    });    
    
    // Bereichsschaltungen ... 
    for (i=0; i<bereiche.length; i++) {
        subscribe ({id: AdapterId+".Bereiche."+bereiche[i].Name.replace(/ /g, "_")+".Taster_Aus", val:true},function(data){
            var Index = findBereich(data);
            if (Index!=-1) abschaltenBereich(Index);
        });
        subscribe ({id: AdapterId+".Bereiche."+bereiche[i].Name.replace(/ /g, "_")+".Taster_An", val:true},function(data){
            var Index = findBereich(data);
            if (Index!=-1) anschaltenBereich(Index);
        });
        subscribe ({id: AdapterId+".Bereiche."+bereiche[i].Name.replace(/ /g, "_")+".Taster_An_5min", val:true},function(data){
            var Index = findBereich(data);
            if (Index!=-1) anschaltenBereich(Index,300);
        });
    }

    subscribe ({id: LightsNightModeTriggerId, val:true },function(data){
        dwmlog ("NightMode Trigger ausgelöst",4);
        abschaltenBereiche([0,1,2,4,5,6,7,8,9]);
    });

    subscribe ({id: LightsAllOffTriggerId, val:true},function(data){
        dwmlog ("LightsAllOff Trigger ausgelöst",4);
        abschaltenAlle();
    });

    subscribe ({id: LightsAllOnTriggerId, val:true},function(data){
        anschaltenAlle();
    });

    subscribe ({id: LeaveByNightTriggerId, val:true},function(data){
        abschaltenBereiche([1,2,3,4,5,6,7,8,9,10]);
    });
    
    subscribe ({id: LightsAllOnTriggerId, val:true},function(data){
        anschaltenAlle(300);
    });    
  
    // subscribe ({id: LightsControlPhaseId, change:"ne"}, function(data){ coupleControlModes(); });
    for (i=0; i<lightspec.length; i++) {
        subscribe({id: lightspec[i].Id, change:"ne"}, function(data){
            LightEvent(data);
        });
    }
}

/******************************************************************************/

// Licht Hausgang
// subscribe ({id: "hm-rpc.0.GEQ0128067.1.MOTION"/*Bewegung EG Gang:1.MOTION*/, val:true}, function(data) { handleOnEvent(7,data); });
// subscribe ({id: "hm-rpc.0.MEQ0670341.3.MOTION"/*Bewegungsmelder Hausgang EG West.MOTION*/, val:true}, function(data) { handleOnEvent(7,data); });


// Licht Diele OG
// subscribe ({id: "hm-rpc.0.GEQ0127607.1.MOTION"/*Bewegung OG Diele:1.MOTION*/, val:true}, function(data) { handleOnEvent(8,data); });


createStates();
setupEvents();

// calcLightsControlPhase();
coupleControlModes();
LightsWatchAll();

