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

var WeckerEnableId = "Wecker.0.Enable";
var WeckerOffTriggerId = "Wecker.0.OffNow";
var WeckerSnoozeTriggerId = "Wecker.0.SnoozeNow";
var WeckerSnoozeValId     = "Wecker.0.SnoozeTime";

var JagdweckerEnableId = "Jagdwecker.0.Enable";
var JagdweckerCalcTimeId = "Jagdwecker.0.CalcTime";

var JagdweckerOffset = 3000;

function WeckerOn() {
    var RampUpTime = 120;
    
    setState("hm-rpc.0.GEQ0210167.1.RAMP_TIME"/*Licht Schlafzimmer OG (Bett rechts):1.RAMP_TIME*/,RampUpTime);
    setStateDelayed("hm-rpc.0.GEQ0210167.1.LEVEL"/*Licht Schlafzimmer OG (Bett rechts):1.LEVEL*/,75,100);
    
    setState("squeezebox.0.merle.volume"/*merle.volume*/,0);
    setStateDelayed("squeezebox.0.merle.power"/*merle.power*/,true,RampUpTime*1000);
    for (i=0; i<10; i++) {
        setStateDelayed ("squeezebox.0.merle.volume"/*merle.volume*/, i*3, false, (RampUpTime*1000)+(i+1)*2000, false, function(){
            // dwmlog("Squeezebox Lautstärke"+getState("squeezebox.0.merle.volume"/*merle.volume*/).val,4);
        });
    }
}

function WeckerOff() {
    setState("hm-rpc.0.GEQ0210167.1.RAMP_TIME"/*Licht Schlafzimmer OG (Bett rechts):1.RAMP_TIME*/,30);
    setStateDelayed("hm-rpc.0.GEQ0210167.1.LEVEL"/*Licht Schlafzimmer OG (Bett rechts):1.LEVEL*/,0,100);
    
    var startVolume=getState("squeezebox.0.merle.volume"/*merle.volume*/).val;
    var theVolume = startVolume;
    
    for (i=0; i<34; i++) {
        theVolume = startVolume-i*3;
        if (theVolume<0) theVolume=0;
        setStateDelayed ("squeezebox.0.merle.volume"/*merle.volume*/, theVolume, false, (i+1)*2000, false, function(){
            dwmlog("Squeezebox Lautstärke"+getState("squeezebox.0.merle.volume"/*merle.volume*/).val,4);
        });
        if (theVolume==0) {
            setStateDelayed("squeezebox.0.merle.power"/*merle.power*/,false,(i+2)*2000);
            setStateDelayed("squeezebox.0.merle.volume"/*merle.volume*/,25,(i+2)*2000+300);
            break;
        }
    }
}

function calcJagdweckerTime() {
   setState(JagdweckerEnableId,false); // Automatisch Jagdwecker abschalten :)
   var today = new Date();
    var tomorrow = today.setDate(today.getDate() + 1);
    var tomorrowDawn = getAstroDate("nauticalDawn", tomorrow);
    
    setState(JagdweckerCalcTimeId, formatDate(tomorrowDawn.getTime()-JagdweckerOffset*1000,"hh:mm"));
}

createState( WeckerEnableId,  // name
             0,                                                     // initial value
             0,
             { 
                 type: 'number', 
                 states: ['Aus','An']
		     }                     
           );    

createState( WeckerOffTriggerId,  // name
             false,                                                     // initial value
             0,
             { 
                 type: 'boolean', 
		     }                     
           );

createState( WeckerSnoozeTriggerId,  // name
             false,                                                     // initial value
             0,
             { 
                 type: 'boolean', 
		     }                     
           );
           
createState( JagdweckerEnableId,  // name
             0,                                                     // initial value
             0,
             { 
                 type: 'number', 
                 states: ['Aus','An']
		     }                     
           );    

createState( JagdweckerCalcTimeId,  // name
             "",                                                     // initial value
             0,
             { 
                 type: 'string', 
		     }                     
           );  

subscribe ({id: "ical.0.events.Wecker"/*Wecker*/, change: "ne"},function(data){
    if (getState(WeckerEnableId).val===1) {
        if (data.state.val) {
            WeckerOn();
        } else {
            WeckerOff();
        }
    }
});

schedule({astro: "nauticalDawn", shift: -1*JagdweckerOffset}, function () {
    dwmlog("Jagdwecker!!",2);
    if (getState(JagdweckerEnableId).val) {
        WeckerOn();
        setTimeout (WeckerOff, 900000); 
    }
});

schedule ("2 9 * * *", function() {
    calcJagdweckerTime();
});

calcJagdweckerTime();

