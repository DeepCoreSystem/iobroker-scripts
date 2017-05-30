
var debuglevel = 1;
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

var sha256 = require('js-sha256').sha256;

var AdapterId = "javascript.0";
var BaseId    = "PINEntry";

var PIN = "";

function createStates(){
    for (i=0; i<10; i++) {
        createState( BaseId+".KeyTrigger."+i,  // name
                     false,                                                     // initial value
                     true, 
                     { 
                         type: 'boolean',
                         role: 'button'
        		     }                     
                   ); 
    }
    createState( BaseId+".KeyTrigger.Del",  // name
                 false,                                                     // initial value
                 true,
                 { 
                    type: 'boolean',
                    role: 'button' 
    		     }                     
               ); 
    createState( BaseId+".KeyTrigger.Enter",  // name
                 false,                                                     // initial value
                 true,
                 { 
                    type: 'boolean',
                    role: 'button' 
    		     }                     
               ); 
    createState( BaseId+".KeyTrigger.Star",  // name
                 false,                                                     // initial value
                 true,
                 { 
                    type: 'boolean',
                    role: 'button' 
    		     }                     
               ); 
    createState( BaseId+".KeyTrigger.Hash",  // name
                 false,                                                     // initial value
                 true,
                 { 
                    type: 'boolean',
                    role: 'button' 
    		     }                     
               ); 
    createState( BaseId+".KeyTrigger.Clear",  // name
                 false,                                                     // initial value
                 true,
                 { 
                    type: 'boolean',
                    role: 'button' 
    		     }                     
               ); 
    createState( BaseId+".ShowEntered",
               "",
               {
                    type: 'string',
               }
               );
}

function onPINKeyPressed(data) {
    switch (data.id) {
        case AdapterId+"."+BaseId+".KeyTrigger.1":
            dwmlog ("PIN: 1 pressed",4);
            PIN+="1";
            break;
        case AdapterId+"."+BaseId+".KeyTrigger.2":
            dwmlog ("PIN: 2 pressed",4);
            PIN+="2";
            break;
        case AdapterId+"."+BaseId+".KeyTrigger.3":
            dwmlog ("PIN: 3 pressed",4);
            PIN+="3";
            break;
        case AdapterId+"."+BaseId+".KeyTrigger.4":
            dwmlog ("PIN: 4 pressed",4);
            PIN+="4";
            break;
        case AdapterId+"."+BaseId+".KeyTrigger.5":
            dwmlog ("PIN: 5 pressed",4);
            PIN+="5";
            break;
        case AdapterId+"."+BaseId+".KeyTrigger.6":
            dwmlog ("PIN: 6 pressed",4);
            PIN+="6";
            break;
        case AdapterId+"."+BaseId+".KeyTrigger.7":
            dwmlog ("PIN: 7 pressed",4);
            PIN+="7";
            break;
        case AdapterId+"."+BaseId+".KeyTrigger.8":
            dwmlog ("PIN: 8 pressed",4);
            PIN+="8";
            break;
        case AdapterId+"."+BaseId+".KeyTrigger.9":
            dwmlog ("PIN: 9 pressed",4);
            PIN+="9";
            break;
        case AdapterId+"."+BaseId+".KeyTrigger.0":
            dwmlog ("PIN: 0 pressed",4);
            PIN+="0";
            break;
        case AdapterId+"."+BaseId+".KeyTrigger.Del":
            dwmlog ("DEL pressed",4);
            PIN=PIN.substr(0,PIN.length-1);
            break;
        case AdapterId+"."+BaseId+".KeyTrigger.Star":
            dwmlog ("Star pressed",4);
            PIN+="*"
            break;
        case AdapterId+"."+BaseId+".KeyTrigger.Hash":
            dwmlog ("Hash pressed",4);
            PIN+="#"
            break;
        case AdapterId+"."+BaseId+".KeyTrigger.Clear":
            dwmlog ("Clear pressed",4);
            PIN="";
            break;
        case AdapterId+"."+BaseId+".KeyTrigger.Enter":
            dwmlog ("ENTER pressed",4);
            setState("javascript.0.SecNumber.State"/*SecNumber.State*/,sha256(PIN));
            PIN="";
            break;
    }

    dwmlog (PIN,4);
    dwmlog (sha256(PIN),4);
    
    setState(BaseId+".ShowEntered","*".repeat(PIN.length));
}

function createSubscribes(){
    for (i=0; i<10; i++) {
        subscribe ({id: AdapterId+"."+BaseId+".KeyTrigger."+i, val:true}, function(data) { onPINKeyPressed(data); });
    }
    
    subscribe ({id: AdapterId+"."+BaseId+".KeyTrigger.Del", val:true}, function(data) { onPINKeyPressed(data); });
    subscribe ({id: AdapterId+"."+BaseId+".KeyTrigger.Clear", val:true}, function(data) { onPINKeyPressed(data); });
    subscribe ({id: AdapterId+"."+BaseId+".KeyTrigger.Enter", val:true}, function(data) { onPINKeyPressed(data); });
}

createStates();
createSubscribes();
