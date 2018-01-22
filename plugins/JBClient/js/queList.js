/*
 * This manages the queue side panel
 * todo: do a better separation - model/view/controller
 */
function initQueue() {
    
    // subscribe to all job objects including new
    io.socket.get('/job', function(resData, jwres) {console.log(resData);});
    io.socket.get('/jobactive', function(resData, jwres) {console.log(resData);});

    // trigger on events
    io.socket.on('job', function(event){
        console.log('event job',event);
        var data = event.data;
        switch(event.verb) {
            case 'created':
                //console.log('event job create',event.data.id,data);
                $('#j-hist-grid #head').after(
                        "<tr id='"+data.id+"'>"
                        +"<td>"+data.id+"</td>"
                        +"<td class='state' questate='"+getQueState(data.state)+"'></td>"
                        //+"<td class='progress'>"+data.progress+"</td>"
                        +"<td class='name'>"+data.data.name+"</td>"
                        +"</tr>");                
                        break;
            case 'updated':
                //console.log('event update',data.id,data);
                $('#j-hist-grid #'+data.id+" .state").attr('questate',getQueState(data.state));
                $('#j-hist-grid #'+data.id+" .name").html(data.data.name);
                break;
            case 'destroyed':
                //console.log('event remove',event.id);
                $("#j-hist-grid tr#"+event.id).remove();
                break;
                }
    });
    
    io.socket.on('jobactive', function(event){
        console.log('event jobactive',event);
        if (event.data.active===0) $("div.flapEx").removeClass("cogwheel");
        else $("div.flapEx").addClass("cogwheel");
    });    
    
    doGetQueue();
}

function doGetQueue() {
    
    var typeToWatch = 'workflow';
    
    getJobs(function(data){
        jdata = JSON.parse(data);
        console.log("jobs ",jdata.length,jdata);

        jdata.sort(function(a,b) {
            if (a.id > b.id) return -1;
            if (a.id < b.id) return 1;
            else return 0;
        });

        for (var x in jdata) {
            // filter out non galaxy-job type
            //if (jdata[x].type === typeToWatch) {
                
                $("#j-hist-grid table").append(
                    "<tr id='"+jdata[x].id+"'>"
                    +"<td>"+jdata[x].id+"</td>"
                    //+"<td class='state'>"+getQueState(jdata[x].state,jdata[x])+"</td><td>"
                    +"<td class='state' questate='"+getQueState(jdata[x].state)+"'></td>"
                    //+"<td>"+jdata[x].progress+"</td>"
                    +"<td>"+jdata[x].data.name+"</td>"
                    +"</tr>");
            //}
        }

    });
}
function getJobs(callback) {

    $.ajax({
        url: "/job/get",
        dataType: "text",
        success: function (data) {
          callback(data);
        }
        // todo: handle errors
    });
};

function getQueState(state) {
    switch(state) {
        case 'active':
        case 'complete':
        case 'failed':
            return state;
        default: 
            return 'unknown';
    }
}


