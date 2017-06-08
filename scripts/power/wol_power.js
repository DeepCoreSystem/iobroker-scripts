/* shutdown functionality
*/

/* Verhalten
   Ausschalten (1) alle Rechner aus, dann Strom weg
   Ausschalten (2) Ausschalten, WENN alle Rechner aus sind sonst blockieren
*/
var wol = require('wake_on_lan');

var debuglevel = 4;
var debugchannel = 'info';

var AdapterId = "javascript.0";

var hosts = [];
var powergroup = [];

powergroup[0] = {name: "Schreibtisch Computerraum", PowID: "hm-rpc.0.FEQ0086402.1.STATE", StartupDelay: 30000, Interval: 703000 };
// powergroup[1] = {name: "Büro Schrankwand",          PowID: "hm-rpc.0.FEQ0083926.1.STATE", StartupDelay: 5000,  Interval: 807000 };
   
hosts[0] = { name:"magpie",       mac:"FC:F5:28:0D:1C:BF", ping_id: "ping.0.penguin.magpie_fritz_box", shutdownCmd: "/home/werner/.bin/shutdown_magpie.sh", pgroup: 0 };
hosts[1] = { name:"jaybird",      mac:"00:08:9B:C7:04:03", ping_id: "ping.0.penguin.10_22_1_17", shutdownCmd: "ssh -l admin jaybird poweroff", pgroup: -1 };
hosts[2] = { name:"manticore",    mac:"00:26:18:83:0D:21", ping_id: "ping.0.penguin.manticore", shutdownCmd: "ssh manticore sudo /sbin/shutdown -P now", pgroup: 0 };
hosts[3] = { name:"openelec",     mac:"E8:94:F6:18:63:5A", ping_id: "ping.0.penguin.10_22_1_32", shutdownCmd: "ssh -l root openelec /usr/sbin/shutdown -h now", pgroup: -1};
hosts[4] = { name:"hawk",         mac:"34:E6:D7:1B:23:66", ping_id: "ping.0.penguin.10_22_1_14", shutdownCmd: "ssh -l pi hawk c:/ut/shutdown.bat", pgroup: -1};

function setupObjects() {
    // for each power group, set a control object
    for ( var i=0; i<powergroup.length; i++) {
        createState( 'WOLPower.Powergroup.'+powergroup[i].name.replace(/ /g, "_"),                // name
                     0,                                               // initial value
                     true,
                     { min: 0, max: 3, type: 'number', 
        				 states: ['Neutral','Manuell','Auto-Aus-15','Off']
        			 }
                   );        
    }
    
    
    for ( i=0; i<hosts.length; i++) {
        createState( 'WOLPower.PWRControl.'+hosts[i].name.replace(/ /g, "_"),                // name
                     0,                                               // initial value
                     true,
                     { min: 0, max: 2, type: 'number', 
        				 states: ['Neutral','WOL','Shutdown']
        			 }
                   );        
    }
}

function setupSubscribes(){
    for ( var i=0; i<hosts.length; i++ ) {
        // subscribe to event
        subscribe ({id: AdapterId+".WOLPower.PWRControl."+hosts[i].name.replace(/ /g, "_"), val:1, change: "ne" }, function(data){
            dwmlog ("Exec start handler für "+JSON.stringify(data));
            execWOL( data );
        });
        subscribe ({id: AdapterId+".WOLPower.PWRControl."+hosts[i].name.replace(/ /g, "_"), val:2, change: "ne" }, function(data){
            dwmlog ("Exec shutdown handler für "+JSON.stringify(data),4);
            execShutdown( data );
        });
    }

/*
    for ( i=0; i<hosts.length; i++ ) {
        subscribe ({id: AdapterId+'.Powergroup.'+powergroup[i].name.replace(/ /g, "_"), val: 3, change: "ne" }, function(data){
            shutdownPowergroupByData ( data );
        });
    }
*/  
    for ( i=0; i < powergroup.length; i++) {
        pgroupInterval[i].push ( setInterval( function (_ID) {
            checkPowergroup(_ID);
        }, powergroup[i].Interval, i ) );
    }  

}

function subscribeSpecial(){
    subscribe ( { id: "hm-rpc.0.GEQ0286152.20.PRESS_SHORT", val: true }, function() {
        dwmlog ("Display-switch EG sent on command",3);
        restartInterval (0);
        setState(powergroup[0].PowID,1);
    });
}

function findHostByControlId ( id ) {
    result = -1;
    
    var Compare = "";
    for (var i=0; i<hosts.length; i++ ) {
        Compare = AdapterId+'.WOLPower.PWRControl.'+hosts[i].name.replace(/ /g, "_");
        if ( Compare === id) {
            result = i;
            break;            
        }
    }
    return result;
}

function findIndexById ( id, theArray )
{
    result = -1;
    
    for (var i = 0; i<theArray.length; i++) {
        if (theArray.id === id ) {
            result = i;
            break;
        }
    }
    return result;
}

function restartInterval ( index ) {
    // stop powergroup interval
    clearInterval ( pgroupInterval[ index ].pop() );
          
    // restart powergroup interval
    pgroupInterval[ index ].push ( setInterval( function (_ID) {
            checkPowergroup(_ID);
    }, powergroup[ index ].Interval, index ) );
}

function execWOL (data) {
    var index = findHostByControlId( data.id );
    
    dwmlog ("start command for " + data.id +" with MAC Address " + hosts[index].mac + " received.",3);
    if ( hosts[index].ping_id !== 0 ) {
        if ( getState ( hosts[index].ping_id ).val ) {
                dwmlog ("WOL for "+hosts[index].name+" refused, is already on!",3);
                return;
        }
    }
    
    if ( hosts[index].pgroup != -1 ) {
        var thePowId = powergroup[hosts[index].pgroup].PowID;
        dwmlog ("execWOL: thePowId: "+thePowId,4);

        restartInterval ( hosts[index].pgroup );
        
        if ( thePowId !== null) {
            if ( getState( thePowId ).val === false ) {
                setState ( thePowId, 1 );
                setTimeout ( function (_ID) {
                    dwmlog ("sending wakeup after " + powergroup[hosts[_ID].pgroup].StartupDelay + "ms delay to "+hosts[_ID].name,3 );
                    wol.wake( hosts[_ID].mac );
                }, powergroup[hosts[index].pgroup].StartupDelay, index);
            } else {
                dwmlog ("sending wakeup without delay to "+hosts[index].name,3);       
                wol.wake( hosts[index].mac );
            }
        } else {
                dwmlog (" PowID: 0 - sending wakeup without delay to "+hosts[index].name,3);       
                wol.wake( hosts[index].mac );
        }
    }
    else {
        dwmlog ("sending wakeup to "+hosts[index].name,3 );     
        wol.wake( hosts[index].mac );
    }

    // and reset state to be able to do it again ;)
    setTimeout ( function (_data) {
        setState ( _data.id, 0 );
    }, 1000, data );   
}

function execShutdown (data) {
    var index = findHostByControlId( data.id );
    
    execShutdownByIndex(index);

    setStateDelayed ( data.id,0,1000);            
}

function execShutdownByIndex ( index ) {    
    dwmlog ("shutdown command for " + hosts[index].name +" with MAC Address " + hosts[index].mac + " received.",3);
    
    if ( hosts[index].shutdownCmd !== "" ) {
        // TODO: execute shutdown only if host is on, meaning ping is there.
        dwmlog ("executing shutdown command "+hosts[index].shutdownCmd,4);
        exec (hosts[index].shutdownCmd, function (error, stdout, stderr){
            dwmlog ("shutdown command result: "+error+"\n"+stdout+"\n"+stderr,4);
            if ( !error || !error.code ) {
            } else {
                dwmlog ("ERROR shutdown command failed!"+error.code,1);
                dwmlog (stderr,1);
            }
        });
    }    
}

/*
function pgroupMode( theIndex, theMode ) {
    
}
*/

function checkPowergroup( theIndex ) {
    dwmlog ("checking power group "+powergroup[theIndex].Name, 3);

    var theResult = false;
    
    if ( getState( powergroup[theIndex].PowID ).val != 0 ) {
        for (var i=0; i<hosts.length; i++) {
            if ( hosts[i].pgroup == theIndex ) {
                if (hosts[i].ping_id != 0 ) {
                    theResult = theResult || getState( hosts[i].ping_id ).val;
                }
            }
        }
    
        // TODO shutdown only if setting is on "auto-15"
        if ( !theResult ) {
            dwmlog ("Switching off Powergroup "+powergroup[theIndex].Name,3);
            setState ( powergroup[theIndex].PowID, 0 );
        }
    }
}


function shutdownPowergroupByData ( data ) {
    var index = findIndexById( data.id, powergroup );
    
    shutdownPowergroupByIndex ( index );
    
    setTimeout ( function (_data) {
        setState ( _data.id, 0 );
    }, 1000, data );    
}

function shutdownPowergroupByIndex ( theIndex ) {
    dwmlog ("shutting down power group "+powergroup[theIndex].Name,3);
    if ( getState( powergroup[theIndex].PowID ).val != null ) {
        for (var i=0; i<hosts.length; i++) {
            if ( hosts[i].pgroup == theIndex ) {
                if (hosts[i].ping_id != null ) {
                    execShutdownByIndex(i);
                }
            }
        }    
    }
}

/*********** execution starts here ... ***************************************/

var pgroupInterval=new Array( powergroup.length );
for ( var i = 0; i<powergroup.length; i++) {
    pgroupInterval[i]=[];
}

setupObjects();
setupSubscribes();
subscribeSpecial();
