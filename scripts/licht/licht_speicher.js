
/**
 * Steuerung des Lichts im Speicher.
 * Das Licht im Speicher soll sich eigentlich verhalten wie ein "Kühlschrank":
 * - Klappe auf: Licht an!
 * - Klappe zu:  Licht aus!
*/

subscribe ({id: "hm-rpc.0.JEQ0016562.1.STATE"/*Speicherklappe:1.STATE*/, change:"ne" }, function(data) {
    if (getState("javascript.0.Bereiche.Speicher.LichtAutomatik"/*Bereiche.Speicher.LichtAutomatik*/).val == 1 ) {
        dwmlog ("Speicher Lichtautomatik ausgelöst",4);
        if (data.state.val) {
            setState("hm-rpc.0.LEQ0016179.1.STATE"/*Licht Speicheraufgang:1.STATE*/,true);
            setState("hm-rpc.0.LEQ0016179.2.STATE"/*Licht Speichermitte:2.STATE*/,true);
        } else {
            setState("hm-rpc.0.LEQ0016179.1.STATE"/*Licht Speicheraufgang:1.STATE*/,false);
            setState("hm-rpc.0.LEQ0016179.2.STATE"/*Licht Speichermitte:2.STATE*/,false);
            setState("hm-rpc.0.IEQ0383166.2.STATE"/*Licht Balkonüberbau:2.STATE*/,false);
        }
    }
});