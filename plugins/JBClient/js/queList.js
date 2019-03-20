define(function(){
    return {
        jobs: {},

        initQueue:function(browser) {
            let thisb = this;
            this.browser = browser;
    
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
                        thisb.jobs[data.id] = event.data;
                        $('#j-hist-grid #head').after(
                                "<tr class='j-hist-item' id='"+data.id+"'>"
                                +"<td>"+data.id+"</td>"
                                +"<td class='state' questate='"+thisb.getQueState(data.state)+"'></td>"
                                +"<td class='name'>"+data.data.name+"</td>"
                                +"</tr>");                
                                break;
                    case 'updated':
                        //console.log('event update',data.id,data);
                        thisb.jobs[data.id].state = data.state;
                        thisb.jobs[data.id].name = data.name;
                        $('#j-hist-grid #'+data.id+" .state").attr('questate',thisb.getQueState(data.state));
                        $('#j-hist-grid #'+data.id+" .name").html(data.data.name);
                        break;
                    case 'destroyed':
                        //console.log('event remove',event.id);
                        delete thisb.jobs[event.id];
                        $("#j-hist-grid tr#"+event.id).remove();
                        break;
                }
            });
            
            io.socket.on('jobactive', function(event){
                console.log('event jobactive',event);
                if (event.data.active===0) $("div.flapEx").removeClass("cogwheel");
                else $("div.flapEx").addClass("cogwheel");
            });    
            
            thisb.doGetQueue();
        },
        
        doGetQueue:function() {
            
            var typeToWatch = 'workflow';
            let thisb = this;
            
            thisb.getJobs(function(data){
                jdata = JSON.parse(data);
                //console.log("jobs ",jdata.length,jdata);
        
                jdata.sort(function(a,b) {
                    if (a.id > b.id) return -1;
                    if (a.id < b.id) return 1;
                    else return 0;
                });
        
                for (var x in jdata) {
                    // filter out non galaxy-job type
                    if (typeof jdata[x] === 'object' && jdata[x].data) {  // not sure why this check is needed...but it fixes the problem.
                        
                        thisb.jobs[jdata[x].id] = jdata[x].data;

                        $("#j-hist-grid table").append(
                            "<tr class='j-hist-item' id='"+jdata[x].id+"'>"
                            +"<td>"+jdata[x].id+"</td>"
                            +"<td class='state' questate='"+thisb.getQueState(jdata[x].state)+"'></td>"
                            +"<td>"+jdata[x].data.name+"</td>"
                            +"</tr>");

                        $('tr.j-hist-item#'+jdata[x].id).hover(
                            function(){
                                //$(this).css("background-color", "yellow");
                                console.log('hover in',this.id);
                            }, 
                            function(){
                                //$(this).css("background-color", "pink");
                                console.log('hover out',this.id);
                            }                    
                        )
                    }
                }
                console.log("jobs",thisb.jobs);
        
            });
        },
        getJobs:function(callback) {
        
            $.ajax({
                url: "/job/get",
                dataType: "text",
                success: function (data) {
                  callback(data);
                }
                // todo: handle errors
            });
        },
        
        getQueState:function(state) {
            switch(state) {
                case 'active':
                case 'complete':
                case 'failed':
                    return state;
                default: 
                    return 'unknown';
            }
        }
        
        
        

    };
});