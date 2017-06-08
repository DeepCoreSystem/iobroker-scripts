//..........Anwesenheitssimulation AWS Version 0.80
//..........Datum: 28.12.2015
//..........Autor: Looxer01
//..........Forum ioBroker
//..........http://forum.iobroker.com/posting.php?mode=post&f=21&sid=b3b2a31dae55081fedaf0ad9c8d74acd
//
//..........Änderungshistorie
//..........Version 0.10 Initial 28.12.2015
//..........Version 0.11 29.12.2015 Einstellungen um Astrozeiten erweitert (noch ohne Funktion)
//.........,Version 0.12 29.12.2015 EVENT Deaktivierung von AWS hinzugefügt: Schreiben Log und loeschen Schedules
//...............................................Aktivierung von AWS hihzugüfügt: Schreiben Log bei Aktivierung
//..........Version 0.13 29.12.2015 das Schreiben des externen Logs optional gemacht - unter Einstellungen auswaehlbar
//..........Version 0.20 29.12.2015 Astrozeit Funktion hinzugefügt. Astrozeit wird je IDGruppe auf true/false gesetzt und overruled die variablen zeit1von,zeit2von,zeit3von,zeit4von,zeit5von
//..........Version 0.30 29.12.2015 Umarbeitung zur Verkürzung des Scripts
//..........Version 0.31 30.12.2015 Fehlerbeseitigung in IDGruppen3 und 4 - einige Code Hygiene Massnahmen
//..................................Umbenennung der IDGruppen mit führend "ID" / Startverzögerungseinstellungen hinzugefügt
//..........Version 0.32 30.12.2015 umgestellt auf setStateDelayed / Startverzögerungsfunktion hinzugefügt.
//..........Version 0.33 31.12.2015 Fehler mit EVAL Funktion gefixt / Fehler mit Startverzoegerung und Einschaltzeiten gefixt
//..................................Funktion Anzahl von Geraete Teilnehmer zur Geraete ID bestimmung hinzugefügt
//..........Version 0.40 01.01.2016 Log-Pfad variablel gemacht // Log-File Format umgearbeitet und Headerline hinzugefügt fuer externes Log. Internes Log ueberarbeitet
//..........Version 0.41 02.01.2016 Funktionen von Baetz zum TimeInRange Check hinzugefuegt. Keine Globale Funktion mehr notwendig. -- Kommentarte ueberarbeitet
//..........Version 0.42 02.01.2015 Herkunftsnachweis für IsTimeInRange Funktion hinzugefuegt
//..................................Fehler zur zufaelligen Geraete Findung behoben. Das letzte Geraet wurde nie ausgewaehlt // Fehler im log "Gearaet wurde nicht eingeschaltet wurde gelogged auch wenn es eingeschaltet wurde"
//..........Version 0.43 03.01.2015 Wenn AWS auf inaktiv gesetzt wird, dann werden alle teilnehmenden Geraete ausgeschaltet -  Dokumentation der Variablen / variablen deklaration nachgeholt fuer zwei Faelle
//..........Version 0.44 04.01.2015 Addieren der Einschaltverzoegerung zur Ausschaltzeit fuer die Ausschaltzeitberechnung // Fixed Fehler doppelte Schaltung fuer STATE geraete
//..........Version 0.45 04.01.2015 weiterer Fehler zur Berechnung der Ausschaltzeit korrigiert
//..........Version 0.50 04.01.2015 Beseitigung unnötiges Coding // Ueberpruefung ob Geraet existiert hinzugefuegt - LogMeldung falls nicht hinzugefuegt. - kein Javascript restart mehr, wenn geraet nicht existiert
//..........Version 0.60 04.01.2015 Ausschalten der Teilnehmer bei Deaktivierung optimiert. Ausschaltung optional gemacht / Astrozeit ueberarbeitet
//..................................Astrozeit auch fuer die bis Zeit hinzugefuegt. Damit lassen sich Schaltungen bis zum Sonnenaufgang umsetzen / weitere Codeoptimierungen
//..........Version 0.61 05.01.2015 Beim  Ausschalten Verzoegerung zwischen Schaltvorgange eingebaut  / Codeiptimierung bei den Gruppen Schedules / Fehler bei der  GrpZufAnz und StartDelay beseitigt fuer Gruppen 2-5
//..........Version 0.65 06.01.2015 Reaktion bei bereits eigneschalteten Lampen variabel gemacht / Codeoptimierungen / ID fuer AWS-Aktiv ist jetzt variabel
//..........Version 0.70 26.01.2015 SetStateDelayed ist jetzt in javascript gefixt ab JS version 1.1.2 - Das Loeschen von Ein/Auschaltplanungen wird jetzt mit dem neuen Befehl clearStateDelayed gemacht
//..................................Vorläufig wurde das Merken der letzten Aktion geloescht, da es keine Verwendung im Moment hat
//..........Version 0.75 27.01.2015 Fehler beim Loeschen von Ein/Auschaltplanungen behoben - Es wurde nicht geloescht, wenn Verbraucher eingeschaltet bleiben sollen
//..........Version 0.80 28.04.2016 Fehler mit der Astrozeit, wenn die BisZeit < ist als die Astrozeit(von) beseitigt


//.......... DWMBRANCH
//...........Version 0.81 DWM 		Umgestellt auf Konstruktoren, viel weniger Code. Alle Astrozeiten unterstützt.


//// Das Script wird aktiviert, wenn das Flag "Anwesenheitssteuerung gesetzt wird"
// HIER Einstellungen vornehmen............................................................................................

var logflag = true;     // wenn auf true dann wird das logging in Datei /opt/iobroker/iobroker-data/AWSLog.csv eingeschaltet bei false vice versa
var ausflag = false;    // Wenn AWS deaktiviert wird, dann werden alle Teilnehmer ausgeschaltet

var listGrp = [];
var listDev = [];

listGrp[0] = new createGroup ("Zentralbereich Aktivzeit","sunset","22:30", 15, 45, 15, 10);
// listGrp[1] = new createGroup ("")

// Ende Einstellungen .......................................................................................................


// Experten-Einstellungen .......................................................................................................

createState('Anwesenheitssteuerung.AWSAktiv',true);
var IDAWSaktiv = "javascript.0.Anwesenheitssteuerung.AWSAktiv";     // in den objekten angelegte variable zur Bestimmung ob AWS aktiv ist - Kann auch ausgetauscht werden durch eine andere
var LogPath = "/opt/iobroker/iobroker-data/AWSLog.csv";             // Pfad und Dateiname des externen Logs
var IgnoreWhenOn = false;                                           // bei true: Ignoriert den Schaltvorgang, wenn das Geraet bereits eingeschaltet war

// Ende Experten-Einstellungen .......................................................................................................


var fs = require('fs');                     // enable write fuer externes log

var x = 0;                                  // Geraetenummer der Gruppe, die zufaellig ausgewaehlt wurde
var y = 0;                                  //  Einschaltzdauer aufgrund der Zufallszahl in Millisekunden
var z = 0;                                  // Einschaltverzögerung aufgrund der Zufallszahl
var string = " ";                           // Logstring
var logtext=" " ;                           // Kommentar im log
var objIDGruppe = " ";                      // uebergabe an Funktion der IDGruppe zum Schalten des Geraetes
var SpaceChk = new RegExp(/\s/);            // pattern um zu pruefen ob eine IDGruppe blanks enthaelt


function createGroup (Name, ZeitVon , ZeitBis, EinVon, EinBis, StartDelay, Intervall) {
    this.Name=Name;
    this.ZeitVon = ZeitVon;
    this.ZeitBis = ZeitBis;
    
    this.EinVon = EinVon;
    this.EinBis = EinBis;
    
    this.StartDelay = StartDelay;
    this.schedule = "*/"+Intervall+" * * * *";

    this.ausflag = ausflag;
    
    this.DeviceIdList=[];
}

function addDeviceToGroup(i,DeviceId) {
    ListGrp[i].DeviceIdList.push(DeviceId);
}

function createSchedules() {
    for (var i=0; i<listGrp.length; i++) {
        schedule(listGrp[i].schedule, function(i) {
        if  (getState(IDAWSaktiv).val === true) {     // AWS aktiv ?
            zeitvon = astrojetzt2(listGrp[i].ZeitVon,listGrp[i].ZeitBis,"von");             // endif - setzen der abweichenden von-Zeit falls Astro aktiv
            zeitbis = astrojetzt2(listGrp[i].ZeitVon,listGrp[i].ZeitBis,"bis");             // endif - setzen der abweichenden bis-Zeit falls Astro aktiv

            if(isTimeInRange(zeit1von, zeit1bis)) {                                         // ist die "von"-Zeit innerhalb des aktuellen Zeitfensters ?
                log("astrozeit1von  gesetzt von " + zeitvon + " bis " + zeitbis ,"info");    
                x = zufall(1,listGrp[i].DeviceIdList.length,x);                             // Ermittlung zufaelliges Geraet zum schalten
                z = zufall(0,listGrp[i].EinVon*60,y)*1000;                                  // Ermittlung der Einschaltverzögerung aufgrund der Zufallszahl
                y = zufall(listGrp[i].EinVon*60,listGrp[i].EinBis*60,y)*1000;               // Ermittlung der Einschaltzdauer aufgrund der Zufallszahl in Millisekunden

                if ( GeraetExists(listGrp[i].DeviceIdList[x]) ) { AWSSchaltung(listGrp[i].DeviceIdList[x],y,z);  }   // Geraet muss existieren dann schalten
            } // Ende Zeitcheck
        }  // Endeif für AWS-Aktivflag check   
        }.bind(null,i)); // end schedule
    }
}

// ------------------------Ruecksetzen der Timeouts /Ausschalten der teilnehmenden Geraete, wenn AWS-Aktiv auf false gesetzt wird--------------

on({id: IDAWSaktiv, val: false }, function(obj)      // Event:  wenn AWS Flag auf nicht aktiv gesetzt wurde
{
    var countobj   =    0;      //counter fuer Verzoegerungen zwischen den Ausschaltungen

    for (i = 1; i <= listGrp.length; i++) {                                                 // Loop fuer die Gruppe
           for (j = 1; j <= listGrp[i].DeviceIdList.length; j++) {                          // Loop Position 2 /1 - 5 )
                if (SpaceChk.test(eval(listGrp[i].DeviceIdList[j]))) {                      // Check for  blanks
                } else {                                                                    // keine blanks
                       if (GeraetExists(listGrp[i].DeviceIdList[j]) === true) {                             // Gibt es das Geraet 
                            clearStateDelayed(eval(listGrp[i].DeviceIdList[j]));                             // Alle Pläne der Gruppe loeschen
                            if (listGrp[i].ausflag) {                                                   // sollen die Teilnehmer ausgeschaltet werden ?  
                                setStateDelayed(eval(listGrp[i].DeviceIdList[j]), false, countobj);             // ausschalten mit je  300 millisekunden wartezeit
                            }                                                                // endif check ob Geraete ausgeschaltet werden sollen
                            countobj = countobj + 300;                                       // alle 300 millisekunden schalten
                       } // endif fuer Geraetecheck und switch off
                } // end Space Check
          } //  Ende Position 2 Loop
    }  // Ende Position 1 Loop
    log("EVENT  AWS deaktiviert Der schedule zur geplanten Ausschaltung von Geraeten wurde zurueckgesetzt " ,"info"); 
    string = ";;;;;;;AWS wurde deaktiviert - Der schedule zur geplanten Ausschaltung von Geraeten wurde zurueckgesetzt";           // bereite LOG vor

    writelog(string);                                                                           // schreibe LOG in Datei
}); // ende on id


// ------------------------schreibe Log wenn AWS aktiviert wurde--------------------------------------

on({id: IDAWSaktiv, val: true }, function(obj)       // Event:  wenn AWS Flag auf nicht aktiv gesetzt wurde
{

log("EVENT  AWS wurde aktiviert " ,"info"); 
string = ";;;;;;;AWS wurde aktiviert";                                                  // bereite LOG vor
writelog(string);     


}); // ende on id

// ------------------------ F U N K T I O N E N -------------------------------------------------------

//-----------------------------------------------------------------------------------------------------
// Diese Funktion schaltet die IDGruppenmitglieder der gerade zu berabeitenden IDGruppe
//-----------------------------------------------------------------------------------------------------
function AWSSchaltung(objIDGruppe,y,z) {
    logtext = " ";
    if (eval(objIDGruppe).match('STATE')) {                                             // ist es ein STATE Geraet ?
       if  (getState(eval(objIDGruppe)).val === false ) {                               // nur wenn noch nicht eingeschaltet
          setStateDelayed(eval(objIDGruppe), true,  z);                                 // Licht an in z millisekunden
//          var timer = setTimeout(function (){                                                                             
//             setState(eval(objIDGruppe),0);   }, z+y);                                //Licht aus in y millisekunden   (Einschaltverzoegerung plus Einschaltdauer)                
               setStateDelayed(eval(objIDGruppe), false, z+y, false);                   //Licht aus in z+y millisekunden   (Einschaltverzoegerung plus Einschaltdauer)
       } else {                                                                         // else - Geraet ist schon eingeschaltet
           if (IgnoreWhenOn) {                                                          //keine  Reaktion wenn Geraet bereits eingeschaltet war
                logtext = "keine Aktion - Geraet war bereits eingeschaltet";   
           } else {                                                                     // else - es soll uebersteuert werden mit den neuen werten
                z = 0;                                                                  // Einschaltverzoegerung setzen auf Null
                setStateDelayed(eval(objIDGruppe), false, z+y, true );                  //Licht aus in z+y millisekunden   (Einschaltverzoegerung plus Einschaltdauer) ohne Einschaltverzoegerung
                logtext = "Geraet war bereits eingeschaltet -- uebersteuert - ohne Einschaltverzoegerung -  alter schedule geloescht- ";     
           }          // endeif IgnoreWhenOn
       }        // Ende IF fuer Check ob bereits eingeschaltet
    } // Ende IF für STATE Geraete
       
    if (eval(objIDGruppe).match('LEVEL')) {                                             // ist es ein LEVEL Geraet ?
       if  (getState(eval(objIDGruppe)).val === 0) {                                   // nur wenn noch nicht eingeschaltet
            setStateDelayed(eval(objIDGruppe), getRandomLevel(),  z);                     // Licht an in z millisekunden
//            var timer = setTimeout(function (){                                                                             
//                setState(eval(objIDGruppe),0);   }, z+y);                             //Licht aus in y millisekunden   (Einschaltverzoegerung plus Einschaltdauer)                
            setStateDelayed(eval(objIDGruppe), 0, z+y, false);                          //Licht aus in y millisekunden   (Einschaltverzoegerung plus Einschaltdauer)
       } else {                                                                         // else - Geraet ist schon eingeschaltet
        if (IgnoreWhenOn) {                                                             //keine  Reaktion wenn Geraet bereits eingeschaltet war
                logtext = "keine Aktion - Geraet war bereits eingeschaltet";   
           } else {                                                                     // else - es soll uebersteuert werden mit den neuen werten     
                z = 0;                                                                  // Einschaltverzoegerung setzen auf Null
                 setStateDelayed(eval(objIDGruppe), 0, z+y, true);                      //Licht aus in z+y millisekunden   (Einschaltverzoegerung plus Einschaltdauer) ohne Einschaltverzoegerung
                 logtext = "Geraet war bereits eingeschaltet -- uebersteuert - ohne Einschaltverzoegerung -  alter schedule geloescht- ";     
           }    // endeif IgnoreWhenOn
        }     // Ende IF fuer Check ob bereits eingeschaltet 
     } // Ende IF für LEVEL Geraete

        var GeraeteName = getObject(eval(objIDGruppe)).common.name;                         // Name des Geraetes in Klartext
        var now =    new Date();                                                            // store current date and time
        var currSec = now.getTime();                                                        // millisekunden seit 01.01.1970 /current millisecs
        var berechnEinZeit = millisecToDate( currSec + z);                                  // millisecs in Zeit umrechnen fuer die Einschaltzeit
        var berechnAusZeit = millisecToDate(currSec + z + y);                               // millisecs in Zeit umrechnen fuer die Ausschaltzeit
//        WriteArray(objIDGruppe,timer, currSec + z, currSec + z + y)                                             // Merken des Schaltvorganges
        string = objIDGruppe+";" + eval(objIDGruppe) +";" +  GeraeteName + ";" + z/1000 + ";" +y/1000+";"+berechnEinZeit + ";" + berechnAusZeit + ";" + logtext;     // bereite LOG vor
        log("EVENT " + objIDGruppe + "; " + eval(objIDGruppe) + "; " +  GeraeteName + "; " + z/1000 + "; " + y/1000 + "; " + berechnEinZeit + "; " + berechnAusZeit + "; " + logtext, "info");  //Log schreiben
        writelog(string);                                                               // schreibe LOG in Datei
        Logtext = " ";
                
} // Ende Funktion

function getRandomLevel() {
	var levels = [40,60,80];
	
	var index = zufall(0,levels.length-1,index);
	return levels[index];
}

//-----------------------------------------------------------------------------------------------------
// Funktion zur Bestimmung einer ganzzahligen Zufallszahl innerhalb vorgegebener min/max Werte
//-----------------------------------------------------------------------------------------------------
function zufall(low,high,back) {
  back = Math.floor(Math.random() * (high - low + 1)) + low;   
//  log("EVENT  AWS Zufallszahlen - low = " + low + "high = " + high + " back = " + back ,"info"); 
 return back;
} // ende Funktion


//-----------------------------------------------------------------------------------------------------
// Funktion zur Ueberpruefung ob die angegebenen Geraete exisiteren
//-----------------------------------------------------------------------------------------------------
function GeraetExists(objGruppe) {
back = false;
  
if (SpaceChk.test(eval(objGruppe))) {                     // objIDGruppe darf kein space enthalten  // ist ein Geraet ueberhaupt zugeordnet ?
//         log("Geraet hat kein assignment - Gruppe " + objGruppe, "info"); 
         return back;
 } //  endif IDGruppe hat kein assignment

if  (getState(eval(objGruppe)))   { // Existiert das Geraet ?
         back = true;
    } else {     log("Geraet existiert nicht - bitte in den Einstellungen ueberpruefen - Gruppe " + objGruppe, "info"); 
} //  endif check on Geraet exists

return back;
} // ende Funktion


//-----------------------------------------------------------------------------------------------------
// Funktion schreibt einen Logeintrag in das Filesystem und auch in das interne Log-System
//-----------------------------------------------------------------------------------------------------
function writelog(string) {
    if (logflag === true) {
     // Zerlege Datum und Zeit in Variable
        var now =    new Date(); // store current date and time
        var year =   now.getFullYear();
        var month =  addZero(now.getMonth()+1);
        var day =    addZero(now.getDate());
        var Thour =  addZero(now.getHours());
        var Tmin =   addZero(now.getMinutes());
        var Tsec =   addZero(now.getSeconds());
        var logdate = day + '.' + month + '.' + year;
        var logtime = Thour + ':' + Tmin + ':' + Tsec;



if (fs.existsSync(LogPath)) {
    fs.appendFileSync(LogPath, logdate+" ;"+logtime+" ;"+string + "\n");       // Füge Satz in Datei ein
    } else {     
        log("Logfile nicht gefunden - wird angelegt"), "info";
        var headerLine= "Datum;Uhrzeit;Gruppe;GeraeteID;Geraetebezeichnung;Einschaltverzoegerung;LaengeSchaltzeit;ZeitEin berechnet;ZeitAus berechnet;Kommentar"    
        fs.appendFileSync(LogPath, headerLine + "\n");       // Füge Satz in Datei ein
        fs.appendFileSync(LogPath, logdate+" ;"+logtime+" ;"+string + "\n");       // Füge Satz in Datei ein
      }  // endif Filecheck
    } ; // Ende check on logflag
} // Ende Funktion


//------------------------Ermittlung der Zeit wenn Astrozeit eingeschaltet wird
// Funktion bestimmt ob die Astrozeit die Gültigkeitsbereich der VonZeit overruled
//-----------------------------------------------------------------------------------------------------

function astrojetzt2(zeitvon, zeitbis, abschnitt) {
var astroEnd = getAstroDate("sunriseEnd");                                    // Ende der Nacht nach Astro
var astroStart = getAstroDate("sunsetStart");                                 // Ende des Tages nach Astro
var astrovon = false;
var astrobis = false;

switch (zeitvon) {
    case "sunrise": // sunrise (top edge of the sun appears on the horizon)
    case "sunriseEnd": // sunrise ends (bottom edge of the sun touches the horizon)
    case "goldenHourEnd": // morning golden hour (soft light, best time for photography) ends
    case "solarNoon": // solar noon (sun is in the highest position)
    case "goldenHour": // evening golden hour starts
    case "sunsetStart": // sunset starts (bottom edge of the sun touches the horizon)
    case "sunset": // sunset (sun disappears below the horizon, evening civil twilight starts)
    case "dusk": // dusk (evening nautical twilight starts)
    case "nauticalDusk": // nautical dusk (evening astronomical twilight starts)
    case "night": // night starts (dark enough for astronomical observations)
    case "nightEnd": // night ends (morning astronomical twilight starts)
    case "nauticalDawn": // nautical dawn (morning nautical twilight starts)
    case "dawn": // dawn (morning nautical twilight ends, morning civil twilight starts)
    case "nadir": // nadir (darkest moment of the night, sun is in the lowest position)
        astroStart = getAstroDate(zeitvon);
        astrovon=true;
        break;
}

switch (zeitbis) {
    case "sunrise": // sunrise (top edge of the sun appears on the horizon)
    case "sunriseEnd": // sunrise ends (bottom edge of the sun touches the horizon)
    case "goldenHourEnd": // morning golden hour (soft light, best time for photography) ends
    case "solarNoon": // solar noon (sun is in the highest position)
    case "goldenHour": // evening golden hour starts
    case "sunsetStart": // sunset starts (bottom edge of the sun touches the horizon)
    case "sunset": // sunset (sun disappears below the horizon, evening civil twilight starts)
    case "dusk": // dusk (evening nautical twilight starts)
    case "nauticalDusk": // nautical dusk (evening astronomical twilight starts)
    case "night": // night starts (dark enough for astronomical observations)
    case "nightEnd": // night ends (morning astronomical twilight starts)
    case "nauticalDawn": // nautical dawn (morning nautical twilight starts)
    case "dawn": // dawn (morning nautical twilight ends, morning civil twilight starts)
    case "nadir": // nadir (darkest moment of the night, sun is in the lowest position)
        astroEnd = getAstroDate(zeitbis);
        astrobis=true;
        break;
}


var nowvon;                                                                     // fuer astrozeitrechnung vonzeit
var nowbis;                                                                     // fuer astrozeitrechnung vonzeit
var Thour;                                                                      // Stunde mit führender Null
var Tmin;                                                                       // Minute mit führender Null
var lower;                                                                      // Zeitvergleich
var upper;                                                                      // Zeitvergleich
var zeit;                                                                       // Rueckgabezeit


if(astrovon === true ) {                                                        // Astrozeit gesetzt
    nowvon      =  new Date(astroStart);                                        // store sunset date and time vonZeit 
    Thour       =  addZero(nowvon.getHours());                                  // extract hour
    Tmin        =  addZero(nowvon.getMinutes());                                // extract min
    zeitvon = Thour + ':' + Tmin + ':' + "00";                                  // Zusammensetzen der Zeit in Format hh:mm:ss
}

if(astrobis === true ) {                                                        // Astrozeit gesetzt
    nowbis      =  new Date(astroEnd);                                        // store sunset date and time vonZeit  
    Thour       =  addZero(nowbis.getHours());                                  // extract hour
    Tmin        =  addZero(nowbis.getMinutes());                                // extract min
    zeitbis = Thour + ':' + Tmin + ':' + "00";                                  // Zusammensetzen der Zeit in Format hh:mm:ss
}


if (abschnitt === "von") {                                                      // wenn vonZeit berechnet wird 
    lower = addTime(zeitvon);                                                   // vonZeit muss kleiner sein als bis Zeit
    upper = addTime(zeitbis);                                                   // bisZeit muss groesser sein als vonZeit
    zeit = zeitvon;
    if (upper < lower && astrovon === true && astrobis === false) {             // Sonderfall wenn die biszeit kleiner als die astrozeit ist
        zeit = zeitbis;                                                         // wenn die Astrozeit groesser wird als die BisZeit, dann ist vonZeit = bisZeit
    }
}

if (abschnitt === "bis") {                                                      // nur Rückgabewert setzen
    zeit = zeitbis;
}

return zeit;                                                                    // fertig
    
} // Ende Funktion




//-----------------------------------------------------------------------------------------------------
// Funktion zur Erzeugung von führenden Nullen für das Datum Format
//-----------------------------------------------------------------------------------------------------
function addZero(i) {
    if (i < 10) {
        i = "0" + i;
    }
    return i;
} // Ende Funktion

 //-----------------------------------------------------------------------------------------------------
// Funktion Millisekunden in Datum/Zeit  umrechnen /wird für logging benoetigt
//-----------------------------------------------------------------------------------------------------
function millisecToDate(millisec) {
        var time = new Date(millisec);
        var Thour =  addZero(time.getHours());
        var Tmin =   addZero(time.getMinutes());
        var Tsec =   addZero(time.getSeconds());
        datum = Thour + ':' + Tmin + ':' + Tsec;
       return datum;
} // Ende Funktion
     
//-----------------------------------------------------------------------------------------------------
// 3 Funktionen zum Zeitrange check zur Prüfung ob die Schaltungszeiten erreicht sind
// Autor ist Beatz - uebernommen aus:
// viewtopic.php?f=21&t=1072&p=11167&hilit=isTimeInRange&sid=4dca8ea2c7f9337cdc73a1a9e4824a40#p11167
//-----------------------------------------------------------------------------------------------------
function isTimeInRange(strLower, strUpper) {
    var now = new Date();
    var lower = addTime(strLower);
    var upper = addTime(strUpper);
    var inRange = false;
    if (upper > lower) {
        // opens and closes in same day
        inRange = (now >= lower && now <= upper) ? true : false;
    } else {
        // closes in the following day
        inRange = (now >= upper && now <= lower) ? false : true;
    }
    return inRange;
} 

function currentDate() {
    var d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}
function addTime(strTime) {
    var time = strTime.split(':');
    var d = currentDate();
    d.setHours(time[0]);
    d.setMinutes(time[1]);
    d.setSeconds(time[2]);
    return d;
}


/******************* los ***********************/

createSchedules();

