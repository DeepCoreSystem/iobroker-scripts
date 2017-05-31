
var AdapterId   = "javascript.0";
var EventListId = AdapterId+"."+"Ereignisse.Text";
var EventListHTMLId = AdapterId+"."+"Ereignisse.HTMLListe";

var debuglevel=4;
var debugchannel="info";

function createStates() {
    createState( EventListId,
               "",
               false,
               {
                    type: 'string',
               }
               );
    
    sendTo('history.0', 'enableHistory', {
    id: EventListId,
    options: {
        "enabled": true,
        "changesOnly": false,
        "debounce": 500,
        "maxLength": 0,
        "retention": 63072000,
        "changesRelogInterval": 0,
        "changesMinDelta": 0
    }
    
}, function (result) {
    if (result.error) {
        console.log(result.error);
    }
    if (result.success) {
        //successfull enabled
    }
});
    
    createState( EventListHTMLId+".10",
               "",
               false,
               {
                    type: 'string',
               }
               );
}

function formatEventsToHTML( list ) {
    var html = "<table>";

    html += "<tr><th style=\"text-align:left\">Uhrzeit</th><th style=\"text-align:left\">Ereignis</th></tr>";
    for (var i = 0; i < list.length; i++) {
        html+="<tr><td>"+formatDate( new Date(list[i].ts), "DD.MM.YYYY hh:mm:ss")+"</td><td style=\"padding-left:10px;\">"+list[i].val+"</td></tr>";
    }
    html+="</table>";
    
    return html;
}

function getCountAsHTML(number,datapoint) {
    getHistory("history.0",{
            id:         "javascript.0.Ereignisse.Text"/*Ereignisse.Text*/,
            aggregate:  'none',
            count:      number
        }, function (err, result) {
            if (err) console.error(err);
            if (result) {
                result.reverse();
                var html = formatEventsToHTML( result );
                // dwmlog("Events:"+html,4);
                setState(datapoint,html);
            }
        });    
}


function pushEvent(Kat, Text) {
    if (EventListId === undefined || EventListId === null ) return;
    var theText = Kat+" - "+Text;
    // dwmlog ("Eventlist - adding "+theText,4);
    setState (EventListId,theText);
}

createStates();

subscribe(EventListId,function(data){
    setTimeout (function (){
        dwmlog ("Subscribe triggered",4);
        getCountAsHTML(10,EventListHTMLId+".10");        
    },500);
});

getCountAsHTML(10,EventListHTMLId+".10");
