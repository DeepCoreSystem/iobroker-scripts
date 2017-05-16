/*
Heizungsueberwachung
Dieses Script protokolliert die Betriebszeiten der Heizung durch
Ueberwachung der Vorlauftemperatur.
Die Betriebszeiten der Heizung pro Tag sind ein direktes Mass fuer
den Energieverbrauch.
*/

var csBetriebsstundenTagId = "Heizung.Central.Betriebsstunden.Tag";
var csBetriebsstundenGesternId = "Heizung.Central.Betriebsstunden.Gestern";
var csBetriebsstundenGesamtId = "Heizung.Central.Betriebsstunden.Gesamt";
var csBrennerAnId = "Heizung.Central.BrennerAn";

var csHzVorlaufTempId = "hmrega.0";
var csWwVorlaufTempId = "";

function createStates() {
    createState(csBetriebsstundenTagId, 0, {
          read: true, 
          write: true, 
          desc: "Betriebsstunden heute", 
          type: "number", 
    });

    createState(csBetriebsstundenGesternId, 0, {
          read: true, 
          write: true, 
          desc: "Betriebsstunden heute", 
          type: "number", 
    });

    createState(csBetriebsstundenGesamtId, 0, {
          read: true, 
          write: true, 
          desc: "Betriebsstunden seit letzter Tankfüllung", 
          type: "number", 
    });
    
    createState(csBrennerAnId, false, {
          read: true, 
          write: true, 
          desc: "Heizungsbrenner An", 
          type: "boolean", 
    });
}

var StoreMin = false;
var TempLast = getState(csWwVorlaufTempId);
var TimeLast = new Date();
var LastAlert = new Date();

function onTempChange() {
    var now = new Date();
    
    var tempCurrent = getState (csWwVorlaufTempId);
    
    var Brenner = getState(csBrennerAnId);
    var TagesBetriebsstunden = getState(csBetriebsstundenTagId);
    var Betriebsstunden = getState(csBetriebsstundenGesamtId);

    if ( TempLast < TempCurrent ) {
        if (!Brenner) {
            if ( TempCurrent > 35 ) {
                Brenner=true;
                setState( csBrennerAnId, Brenner );
            }
        }
        if (StoreMin) {
                StoreMin=false;
                TimeLast = now;
        }
    }
    
    if ( TempLast > TempCurrent ) {
        if (!StoreMin) {
            StoreMin=true;
        }
        if (Brenner) {
            // Brenner hat gerade abgeschaltet
            Brenner=false;
            setState( csBrennerAnId, Brenner );
            
            var Brennzeit = ( now.getTime()-TimeLast.getTime())/ 3600000;
            if (Brennzeit > 2) {
                Brennzeit = 0;
            }

            TagesBetriebsstunden = TagesBetriebsstunden + Brennzeit;
            Betriebsstunden = Betriebsstunden + Brennzeit;
            setState(csBetriebsstundenTagId, TagesBetriebsstunden);
            setState(csBetriebsstundenGesamtId, Betriebsstunden);
        }
    }
    
    TempLast = TempCurrent;
}

function resetBetriebsstunden() {
    var BetriebsstundenTag = getState(csBetriebsstundenTagId).val;
    setState(csBetriebsstundenGesternId,BetriebsstundenTag);
    setState(csBetriebsstundenTagId,0);
}

function AlertOnTemp() {
    var now=new Date();
    if ((now.getTime()-LastAlert.getTime())/1000 > 3600) {
        LastAlert=now;
        dwmlog ("Alarmauslösung - Heizung unter 35°C",2);
    }
}

createStates();

subscribe ({id: csWwVorlaufTempId, change: "ne"}, function(data) {
    onTempChange();
    dwmlog (JSON.stringify(data),4);
    if (data.state < 35) {
        AlertOnTemp();
    }
});

schedule ("2 0 * * *",function(){
    ResetBetriebsstunden();    
});