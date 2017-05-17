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

var ProfilJagdzimmer = {
    Normal: [ 
        { zeit: "00:00", sp: 17}
    ],
    Feiertag: [ 
        { zeit: "00:00", sp: 17}
    ],
    HomeOffice: [ 
        { zeit: "00:00", sp: 17}
    ],
    AbendsWeg: [
        { zeit: "00:00", sp: 17}
    ],
    Abwesend: [
        { zeit: "00:00", sp: 17}
    ],
    Krank: [
        { zeit: "00:00", sp: 17}
    ]
};

var ProfilGaestezimmer = {
    Normal: [ 
        { zeit: "00:00", sp: 17}
    ],
    Feiertag: [ 
        { zeit: "00:00", sp: 17}
    ],
    HomeOffice: [ 
        { zeit: "00:00", sp: 17}
    ],
    AbendsWeg: [
        { zeit: "00:00", sp: 17}
    ],
    Abwesend: [
        { zeit: "00:00", sp: 17}
    ],
    Krank: [
        { zeit: "00:00", sp: 17}
    ]
};


var ProfilBuero = {
    Normal: [ 
        { zeit: "00:00", sp: 18.5}
    ],
    Feiertag: [ 
        { zeit: "00:00", sp: 18.5}
    ],
    HomeOffice: [ 
        { zeit: "00:00", sp: 18.5},
        { zeit: "08:00", sp: 21},
        { zeit: "19:00", sp: 18.5}
    ],
    AbendsWeg: [
        { zeit: "00:00", sp: 18.5}
    ],
    Abwesend: [
        { zeit: "00:00", sp: 16}
    ],
    Krank: [
        { zeit: "00:00", sp: 18.5}
    ]
};

var ProfilMedienzimmer = {
    Normal: [ 
        { zeit: "00:00", sp: 17}
    ],
    Feiertag: [ 
        { zeit: "00:00", sp: 17}
    ],
    HomeOffice: [ 
        { zeit: "00:00", sp: 17}
    ],
    AbendsWeg: [
        { zeit: "00:00", sp: 17}
    ],
    Abwesend: [
        { zeit: "00:00", sp: 17}
    ],
    Krank: [
        { zeit: "00:00", sp: 17}
    ]
};

var ProfilWohnbereich = {
    Normal: [ 
        { zeit: "00:00", sp: 18},
        { zeit: "06:00", sp: 19},
        { zeit: "15:00", sp: 21},
        { zeit: "23:00", sp: 19}
    ],
    Feiertag: [ 
        { zeit: "00:00", sp: 18},
        { zeit: "06:00", sp: 19},
        { zeit: "07:00", sp: 20},
        { zeit: "12:00", sp: 21},
        { zeit: "23:00", sp: 19}
    ],
    HomeOffice: [ 
        { zeit: "00:00", sp: 18},
        { zeit: "06:00", sp: 19},
        { zeit: "07:00", sp: 20},
        { zeit: "12:00", sp: 21},
        { zeit: "23:00", sp: 19}
    ],
    AbendsWeg: [
        { zeit: "00:00", sp: 18},
        { zeit: "06:00", sp: 19},
    ],
    Abwesend: [
        { zeit: "00:00", sp: 17}
    ],
    Krank: [
        { zeit: "00:00", sp: 18},
        { zeit: "06:00", sp: 19},
        { zeit: "07:00", sp: 20},
        { zeit: "12:00", sp: 21},
        { zeit: "23:00", sp: 19}
    ]
};


var ProfilSchlafzimmer = {
    Normal: [ 
        { zeit: "06:00", sp: 19},
        { zeit: "09:30", sp: 17},
        { zeit: "19:00", sp: 19},
        { zeit: "22:00", sp: 18}
    ],
    Feiertag: [ 
        { zeit: "06:00", sp: 19},
        { zeit: "11:30", sp: 17},
        { zeit: "19:00", sp: 19},
        { zeit: "22:00", sp: 18}
    ],
    HomeOffice: [ 
        { zeit: "06:00", sp: 19},
        { zeit: "09:30", sp: 17},
        { zeit: "19:00", sp: 19},
        { zeit: "22:00", sp: 18}
    ],
    AbendsWeg: [
        { zeit: "06:00", sp: 19},
        { zeit: "09:30", sp: 17},
        { zeit: "21:00", sp: 19},
        { zeit: "23:30", sp: 18}
    ],
    Abwesend: [
        { zeit: "00:00", sp: 16}
    ],
    Krank: [
        { zeit: "00:00", sp: 20}
    ]
};

var HZVentile=[];
var HZController=[];

var VorlaufPumpeId = "";

var VorlaufTempHzId = "";
var VorlaufTempWwId = "";

HZVentile[0]  = new createHeizVentil ("Ventil Wohnzimmer OG","hm-rpc.0.FEQ0050486"/*Heizkörper OG Wohnzimmer (links)*/);
HZVentile[1]  = new createHeizVentil ("Ventil Schlafzimmer","hm-rpc.0.FEQ0050837"/*Heizkörper OG Schlafzimmer*/);
HZVentile[2]  = new createHeizVentil ("Ventil Büro (links)","hm-rpc.0.FEQ0050559"/*Heizkörper EG Wohnzimmer (links)*/);
HZVentile[3]  = new createHeizVentil ("Ventil Büro (rechts)","hm-rpc.0.FEQ0079634"/*Heizkörper EG Wohnzimmer (rechts)*/);
HZVentile[4]  = new createHeizVentil ("Ventil Jagdzimmer (Front)","hm-rpc.0.FEQ0079872"/*Heizkörper EG Stüberl (Front)*/);
HZVentile[5]  = new createHeizVentil ("Ventil Jagdzimmer (Haustür)","hm-rpc.0.FEQ0050625"/*Heizkörper EG Stüberl*/);
HZVentile[6]  = new createHeizVentil ("Ventil Medienzimmer","hm-rpc.0.FEQ0050670"/*Heizkörper OG Stüberl*/);
HZVentile[7]  = new createHeizVentil ("Ventil Gästezimmer","hm-rpc.0.FEQ0030976"/*Heizkörper EG Schlafzimmer*/);
HZVentile[8]  = new createHeizVentil ("Ventil Küche","hm-rpc.0.FEQ0050677"/*Heizkörper OG Küche*/);

HZController[0] = new createHeizController ("Wohnzimmer OG","hm-rpc.0.FEQ0050316.2.SETPOINT"/*Heizung OG Wohnzimmer:2.SETPOINT*/,[0,8], ProfilWohnbereich);
HZController[1] = new createHeizController ("Schlafzimmer","hm-rpc.0.FEQ0050198.2.SETPOINT"/*Heizung OG Schlafzimmer:2.SETPOINT*/,[1], ProfilSchlafzimmer);
HZController[2] = new createHeizController ("Büro", "hm-rpc.0.FEQ0050193.2.SETPOINT"/*Heizung EG Wohnzimmer:2.SETPOINT*/,[2,3], ProfilBuero);
HZController[3] = new createHeizController ("Jagdzimmer","hm-rpc.0.FEQ0050146.2.SETPOINT"/*Heizung EG Stüberl:2.SETPOINT*/,[4,5], ProfilJagdzimmer);
HZController[4] = new createHeizController ("Medienzimmer","hm-rpc.0.FEQ0050001.2.STATE"/*Heizung OG Stüberl:2.STATE*/,[6], ProfilMedienzimmer);
HZController[5] = new createHeizController ("Gästezimmer","hm-rpc.0.FEQ0030655.2.SETPOINT"/*Heizung EG Schlafzimmer:2.SETPOINT*/,[7],ProfilGaestezimmer);

HZController[4].MasterController=0;
HZController[4].MasterCouplingId="hm-rpc.0.JEQ0216760.1.STATE"/*Tür Medienraum OG:1.STATE*/;

HZController[5].EnableAuto=false;


function createHeizVentil (Name, Id) {
    this.Name = Name;
    this.Id = Id;
}

function createHeizController (Name, Id, Ventile, Profil) {
    this.Name = Name;
    this.Id   = Id;
    this.Ventile = Ventile;
    this.EnableAuto = true;
    this.EnableAutoId = null;
    
    this.Profil = Profil;
    this.Enforce = false; // true bedeutet, jeder Aufruf setzt den SP durch, false bedeutet, nur einmal
    this.LastIndex = null;
    this.LastProfileIndex = null;
    this.LastDay = null;
    
    // Master-Controller handling
    this.MasterController = null;
    this.MasterCoupling = false;
    this.MasterCouplingId = null;
    this.MasterEnableCouplingId = null;
    this.MasterNotEnabledProfile = Profil;
    this.LastController = null;
}

function createStates () {
    createState("Heizung.Control.Mode", 1, {
          read: true, 
          write: true, 
          desc: "Modus der automatischen Einstellung der Temperaturcontroller", 
          type: "number", 
          max: 6,
          min: 0, 
          def: 1, 
          states: {
            0:"OFF",
            1:"Normal",
            2:"Feiertag",
            3:"Homeoffice",
            4:"Abends weg",
            5:"Abwesend",
            6:"Krank"
          }
    });
    
    createState("Heizung.Central.Mode", 1, {
          read: true, 
          write: true, 
          desc: "Modus der Zentralheizung", 
          type: "number", 
          max: 3,
          min: 0, 
          def: 1, 
          states: {
            0:"OFF",
            1:"Sommer",
            2:"Winter",
            3:"Winter (Auto)",
          }
    });
    
    createState("Heizung.Central.Waermeanforderung", 1, {
          read: true, 
          write: true, 
          desc: "Wärmeanforderung aller Heizungsventile", 
          type: "number"
    });
}

function controlHz ( Controller) {
    dwmlog ("controlHz invoked with "+JSON.stringify(Controller),4);
    
    if (Controller.EnableAutoId !== null) Controller.EnableAuto=getState(Controller.EnableAutoId).val;
    if (!Controller.EnableAuto) return; // break off if Auto mode is not enabled.
    
    var MasterController = Controller;
    
    var theProfile = null;
    
    now=new Date();
    var currentDay = Math.floor(now.getTime()/86400000);
    dwmlog ("Heutiger Tag: "+currentDay);
    
    var newsp = getState( Controller.Id);
    var ProfilIndex = getState("Heizung.Control.Mode").val;
    var CurrentIndex = -1;
    
    if (Controller.MasterController !== null ) {
        if (Controller.MasterCouplingId !== null ) Controller.MasterCoupling = getState( Controller.MasterCouplingId ).val;
        // TODO: Hier eine evt. Invertierung einfügen
        if (Controller.MasterEnableCouplingId !== null) Controller.MasterCoupling &= getState( Controller.MasterEnableCouplingId ).val;
        if (Controller.MasterCoupling) {
            MasterController = HZController[Controller.MasterController];
        }
    }
    
    switch (ProfilIndex) {
        case 0: // Off
            break; // break immediatly, nothing to do
        case 1: 
            theProfile = MasterController.Profil.Normal;
            break;
        case 2:
            theProfile = MasterController.Profil.Feiertag;
            break;
        case 3:
            theProfile = MasterController.Profil.Homeoffice;
            break;
        case 4:
            theProfile = MasterController.Profil.AbendsWeg;
            break;
        case 5:
            theProfile = MasterController.Profil.Abwesend;
            break;
        case 6:
            theProfile = MasterController.Profil.Krank;
            break;
    }
    dwmlog ("Profil für "+Controller.Name+": "+JSON.stringify(theProfile),4);

    for (j=0; j<theProfile.length; j++) {
        if (compareTime (theProfile[j].zeit,null,"<",now)) {
            dwmlog ("Bigger, breaking at: "+j,4);
            // if (j==theProfile.length-1) newsp=theProfile[j].sp;
            break;
        } else {
            newsp=theProfile[j].sp;
        }
    }
    currentIndex = j;
    currentSp = 0;
    
    if (currentDay !== this.LastDay ) Controller.LastIndex=null;
    if (Controller.LastProfileIndex!=ProfilIndex) Controller.LastIndex=null;
    
    if ((currentIndex !== Controller.LastIndex) || Controller.Enforce) {
        dwmlog ("Neuer Setpoint: "+Controller.Name+" Index: "+currentIndex+" --> "+newsp,4);
        if ( getState(Controller.Id) != newsp ) setState (Controller.Id,newsp);
        Controller.LastIndex=currentIndex;
        Controller.LastProfileIndex=ProfilIndex;
        Controller.LastDay=currentDay;
    }
}

function doControlling() {
    dwmlog ("doControlling invoked",4);
    
    if (getState("Heizung.Central.Mode").val>1 ) {// Winter oder Winter/Auto
        for (i=0; i<HZController.length; i++) {
            controlHz (HZController[i]);       
        }
    }
}

function checkSommer() {
    if (getState("Heizung.Central.Mode").val <= 1) {
        dwmlog ("Heizung im Sommer-Modus",4);
        for (i=0; i<HZController.length; i++) {
            setState (HZController[i].Id,0);       
        }
    }    
}

/*******************************************************************************
 * Hier folgen Funktionen für die Zentralheizung
 */
function Waermeanforderung() {
    var Anforderung = 0;
    
    for (i=0; i<HZVentile.length; i++) {
        Anforderung += getState(HZVentile[i].Id).val;
    }
    
    setState("Heizung.Central.Waermeanforderung",Anforderung);
}

/*******************************************************************************
 * und los gehts ...
 */
 
createStates();

on("javascript.0.Heizung.Central.Mode", function(data){
    dwmlog ("Trigger Central Mode",4);
    checkSommer();
});

schedule ("*/5 * * * *", function() {
    doControlling();
});

checkSommer();
doControlling();

Waermeanforderung();


