var debuglevel = 4;
var debugchannel = 'info';

var AdapterId = "javascript.0";
var SecNumId    = "SecNumber.State";
var SecNumTimeout = 15;

createState( SecNumId,
           "",
           false,
           {
                type: 'string',
           }
           );
           
subscribe({id: AdapterId+"."+SecNumId, valNe:""},function(data){
    setStateDelayed(AdapterId+"."+SecNumId,"",SecNumTimeout*1000);
});