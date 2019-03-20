/*
 * 
 * Notes callback framework:
 * Provides a mechanism to register a call back when a job queue panel action occurs.
 * Callbacks are registered with ctype and a callback function.
 * 
 * Callbacks        Data passed back        Description
 * job-item-in      jbrowse config track    job queue hover in item
 * job-item-out     jbrowse config track    job queue hover out item
 *
*/
define(function(){
    return {
        jobs: {},
        callback: {},

        /*
         * register callback for job panel
         */
        registerCallback(ctype,fn) {
            if (typeof this.callback[ctype] === 'undefined') this.callback[ctype] = [];
            this.callback[ctype].push(fn);
        },
        /*
         * initialize the job queue panel.
         */
        initQueue(browser) {
            let thisb = this;
            this.browser = browser;
            browser.jbconnect = { queue: this }
    
            // subscribe to all job objects including new
            io.socket.get('/job', function(resData, jwres) {console.log(resData);});
            io.socket.get('/jobactive', function(resData, jwres) {console.log(resData);});
        
            // trigger on events
            io.socket.on('job', function(event){
                console.log('event job',event);
                var data = event.data;
                switch(event.verb) {
                    case 'created':
                        thisb.jobs[data.id] = event.data;
                        $('#j-hist-grid #head').after(
                                "<tr class='j-hist-item' id='"+data.id+"'>"
                                +"<td>"+data.id+"</td>"
                                +"<td class='state' questate='"+thisb.getQueState(data.state)+"'></td>"
                                +"<td class='name'>"+data.data.name+"</td>"
                                +"</tr>");                
                                break;
                    case 'updated':
                        thisb.jobs[data.id].state = data.state;
                        thisb.jobs[data.id].name = data.name;
                        $('#j-hist-grid #'+data.id+" .state").attr('questate',thisb.getQueState(data.state));
                        $('#j-hist-grid #'+data.id+" .name").html(data.data.name);
                        break;
                    case 'destroyed':
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
            
            this.registerCallback('job-item-in',function(track) {
                $('label.tracklist-label > span:contains("'+track.key+'")').parent().css("border-style","solid").css("border-color","red");
            });
            this.registerCallback('job-item-out',function(track) {
                $('label.tracklist-label > span:contains("'+track.key+'")').parent().css("border-style","none");
            });

            thisb.doGetQueue();
        },
        /*
         * enumberate and populate queue entries
         */  
        doGetQueue() {
            
            var typeToWatch = 'workflow';
            let thisb = this;
            let tracks = this.browser.config.tracks;
            
            thisb.getJobs(function(data){
                jdata = JSON.parse(data);
        
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
                                let track = findTrack(parseInt(this.id));
                                if (track)
                                    //$('label.tracklist-label > span:contains("'+track.key+'")').parent().css("border-style","solid").css("border-color","red");
                                    callbackFn('job-item-in',track);
                            }, 
                            function(){
                                let track = findTrack(parseInt(this.id));
                                if (track)
                                    //$('label.tracklist-label > span:contains("'+track.key+'")').parent().css("border-style","none");
                                    callbackFn('job-item-out',track);
                            }                    
                        )
                    }
                }
            });
            // for the given job id, return track config, if it exists in the jbrowse track selector, otherwise return false
            function callbackFn(ctype,data) {
                if (thisb.callback[ctype]) {
                    for(let i in thisb.callback[ctype]) {
                        thisb.callback[ctype][i](data);
                    }
                }
            }
            function findTrack(jobid) {
                for(let i in tracks) {
                    if (tracks[i].jblast && tracks[i].job === jobid) return tracks[i];
                }
                return false;
            }
        },
        /*
         * enumerate all jobs
         */        
        getJobs(callback) {
        
            $.ajax({
                url: "/job/get",
                dataType: "text",
                success: function (data) {
                  callback(data);
                }
            });
        },
        /*
         * convert a queue state into a handled state image
         */
        getQueState(state) {
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