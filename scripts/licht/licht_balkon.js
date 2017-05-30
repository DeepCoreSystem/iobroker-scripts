var debuglevel = 4;
var debugchannel = 'info';

var AutoOffTimer = null;
var AutoOffTime = 300;

var AdapterId = "javascript.0";
var ControllerName = "Balkonlicht";
var ControlModeId = "javascript.0.Beleuchtung.Controllers."+ControllerName.replace(/ /g, "_")+".ControlMode";
var LightStateId  = "hm-rpc.0.GEQ0132247.1.STATE"/*Licht Balkon:1.STATE*/;
var HelligkeitId = AdapterId+".Helligkeit.Helligkeitsstufe";
var LichtAutomatikId = "javascript.0.Bereiche.Aussenbereich.LichtAutomatik"/*Bereiche.Aussenbereich.LichtAutomatik*/;

var HandleOffTimeout = null;

function LightEvent(data) {
    var ControlMode = getState(ControlModeId).val;
    var LichtAutomatik = getState(LichtAutomatikId).val;

    dwmlog ("Status: "+data.state.val,4);
    if (data.state.val===true) {
        dwmlog (ControllerName+" AN ",4);
        if ((ControlMode==2 || ControlMode==3) && ( getState("hm-rpc.0.FEQ0080216.1.STATE"/*Balkontür:1.STATE*/).val === false ) && LichtAutomatik ) { // Auto-Off oder Auto-OnOff
            AutoOffTimer=setStateDelayed(data.id,false,AutoOffTime*1000,true,function(data){dwmlog("Balkonlicht Ausschalten nach Timeout",4);});
        }
    } else {
        dwmlog (ControllerName+" AUS "+AutoOffTimer,2);
        clearStateDelayed(data.id);
        AutoOffTimer=null;
    }
}

function handleOn(data) {
    var ControlMode = getState(ControlModeId).val;
    var LichtAutomatik = getState(LichtAutomatikId).val;
    
    switch (ControlMode) {
        case 1:
        case 3:
            if (LichtAutomatik) setState(LightStateId,true);
            break;
    }
}

function handleOff(data){
    dwmlog ("Balkonlicht aus ... ");
    var TuerStatus = getState("hm-rpc.0.FEQ0080216.1.STATE"/*Balkontür:1.STATE*/).val;
    var ControlMode = getState(ControlModeId).val;
    var LichtAutomatik = getState(LichtAutomatikId).val;

    HandleOffTimeout = null;
    
    switch (ControlMode) {
        case 2:
        case 3:
            if (TuerStatus === false ) { // also nur wenn Tür zu!
                if (LichtAutomatik) setState ( LightStateId,false);
            }
            break;
    }
}

function onControlModeChange(data) {
    var ControlMode = getState(ControlModeId).val;
    var LichtAutomatik = getState(LichtAutomatikId).val;

    var TuerStatus = getState("hm-rpc.0.FEQ0080216.1.STATE"/*Balkontür:1.STATE*/).val;
    
    if (ControlMode == 2 && LichtAutomatik) {
        // Auto-Off Modus
        setState(LightStateId,false);
    } else if (ControlMode == 3 && LichtAutomatik) { // AutoOnOff
        if (TuerStatus) {
            // Tür offen
            setState(LightStateId,true);
        } else {
            // Tür zu
            setState(LightStateId,false);
        }
    } else 
    if (ControlMode==0 || ControlMode==1) {
        clearStateDelayed(LightStateId);
        if (HandleOffTimeout !== null) {
            clearTimeout(HandleOffTimeout);
            HandleOffTimeout = null;
        }
    }
}

function calcControlMode () {
    var helligkeit = getState("javascript.0.Helligkeit.Helligkeitsstufe"/*Helligkeit.Helligkeitsstufe*/).val;
    
    if (getState(ControlModeId).val !== 0 ) {
        if (helligkeit == 0 || helligkeit == 1) {
            setState (ControlModeId,3); 
        } else {
            setState (ControlModeId,2);
        }
    }
}

subscribe({id: LightStateId, ack:true}, function(data){
    dwmlog (ControllerName+" Event",4);
    LightEvent(data);
});

subscribe ({id: HelligkeitId, change:"ne"}, function(data){ calcControlMode(); });

subscribe({id: ControlModeId, change:"ne"}, function(data){
    dwmlog (ControllerName+" ControlMode hat sich geändert: "+data.state.val,4);
    onControlModeChange(data);
});

subscribe({id: LichtAutomatikId, change:"ne"}, function(data){
    dwmlog (ControllerName+" LichtAutomatik Einstellung hat sich geändert",4);
    onControlModeChange(data);
});

subscribe({id: "hm-rpc.0.FEQ0080216.1.STATE"/*Balkontür:1.STATE*/, change:"ne"}, function(data){
    if (data.state.val) {
        dwmlog ("Balkontür schaltet Licht ein",4);
        if (HandleOffTimeout !== null) {
            clearTimeout(HandleOffTimeout);
            HandleOffTimeout = null;
        }
        handleOn(data);
    } else {
        dwmlog ("Balkontür schaltet Licht ab",4);
        if (HandleOffTimeout!==null) clearTimeout(HandleOffTimeout);
        HandleOffTimeout = setTimeout(handleOff,20000);
        dwmlog ("Balkontür geschlossen - Licht aus",4);
    }
});

calcControlMode();