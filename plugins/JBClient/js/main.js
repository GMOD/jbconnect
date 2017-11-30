define([
        'dojo/_base/declare',
        'dojo/_base/lang',
        'dojo/Deferred',
        'dojo/dom-construct',
        'dojo/query',
        'JBrowse/Plugin'
    ],
       function(
        declare,
        lang,
        Deferred,
        domConstruct,
        query,
        JBrowsePlugin
       ) {
return declare( JBrowsePlugin,
{
    constructor: function( args ) {
        var thisB = this;
        var browser = this.browser;
        console.log("plugin: JBClient");
        
        
        //var io = sailsIOClient(socketIOClient);
        //io.sails.url = 'http:/example.com';
        setTimeout(function(){
            browser.publish ('/jbrowse/jbclient_ready',null);   // testing remove io
        },500);
        
        // login panel (bootstrap.js)
        $.get("/loginstate",function(data) {
            console.log("loginstate",data);
            var txt = "";
            if (data.loginstate !== true) {
                txt += '<div class="dropdown">';
                txt += '<button class="btn btn-secondary dropdown-toggle jb-dropdown jb-login-icon" type="button" title="Login" alt="Login" id="dropdownMenuButton" data-toggle="dropdown" ></button>';
                txt += '<div class="dropdown-menu dropdown-menu-right panel panel-default jb-login-panel"><div class="panel-body">';
                txt +=   '<form id="form-login" class="form-group" role="form" action="/auth/local?next=/jbrowse" method="post">';
                txt +=     '<div class="input-group">';
                txt +=       '<input class="form-control" type="text" name="identifier" placeholder="Username">';
                txt +=       '<span class="input-group-addon"></span>';
                txt +=       '<input class="form-control" type="password" name="password" placeholder="Password">';
                txt +=     '</div>';
                txt +=     '<button class="btn btn-secondary jb-form-button" type="submit">Sign in</button>';
                txt +=     '<button class="btn btn-secondary jb-form-button" type="button" onclick="window.location=\'/register\'">Register</button>';
                txt +=   '</form>';
                txt += '</div></div>';
                txt += '</div>';
            }
            else {
                txt +=    '<div class="dropdown">';
                txt +=      '<button class="btn btn-secondary dropdown-toggle jb-dropdown jb-user-icon" type="button" id="dropdownMenuButton" data-toggle="dropdown" >';
                txt +=      data.user.username;
                txt +=      '</button>';
                txt +=      '<ul class="dropdown-menu" aria-labelledby="dropdownMenuButton">';
                txt +=        '<li><a id="button-manage" class="dropdown-item jb-menuitem" href="#">Manage</a></li>';
                txt +=        '<li><a id="button-logout" class="dropdown-item jb-menuitem" href="/logout?next=/jbrowse">Logout</a></li>';
                txt +=      '</ul>';
                txt +=    '</div>';
            }
        $( "body" ).append( "<div class='jb-loginbox'>"+txt+"</div>" );
        $( "body" ).append('<div class="jb-share" title="Share"></div>');

        });
        /*
         * class override function intercepts
         */
        browser.afterMilestone( 'loadConfig', function() {
            if (typeof browser.config.classInterceptList === 'undefined') {
                browser.config.classInterceptList = {};
            }
            // override Browser
            require(["dojo/_base/lang", "JBrowse/Browser"], function(lang, Browser){
                lang.extend(Browser, {
                    extendedRender: function(track, f, featDiv, container) {
                        setTimeout(function() {
                            thisB.insertFeatureDetail(track);
                        },1000);
                    }
                });
            });
        }); 
        browser.afterMilestone( 'initView', function() {
            // inject the actual login/logou redirect
            $('#form-login').attr('action','/auth/local?next='+thisB.browser.makeCurrentViewURL());
            $('#button-logout').attr('href','/logout?next='+thisB.browser.makeCurrentViewURL());

            thisB.setupJobPanel();
            thisB.setupEventTraps();
            startQueue();
        });
        //dojo.subscribe("/jbrowse/jbclient_ready", function(){
        //    startQueue();
        //});
        
        
        function startQueue() {
            console.log("jbclient_ready");

            // new track event handlers
            io.socket.on('track', function(event){
                //console.log('event track',event);
                switch(event.verb) {
                    case 'created':
                        newTrackHandler ('new',event.data.trackData);
                        break;
                    case 'updated':
                        newTrackHandler ('replace',event.data.trackData);
                        break;
                    default: 
                        console.log('unhandled event');
                }
            });    

            // queue events
            setTimeout(function() {
                initQueue();
            },1000);
            
            // event handlers for server events
            function newTrackHandler(eventType,data) {

                console.log("trackhandler "+eventType,data);
                data.baseUrl = browser.config.baseUrl+browser.config.dataRoot+'/';
                var notifyStoreConf = dojo.clone (data);
                var notifyTrackConf = dojo.clone (data);
                notifyStoreConf.browser = browser;
                notifyStoreConf.type = notifyStoreConf.storeClass;
                notifyTrackConf.store = browser.addStoreConfig(undefined, notifyStoreConf);
                browser.publish ('/jbrowse/v1/v/tracks/' + eventType, [notifyTrackConf]);
            };
        }
    },
    setupJobPanel: function() {
        //$.get("plugins/JBClient/JobPanel.html", function(data){
            console.log("Loading Job Panel");
            
            var data = "";
            data += '<script type="text/javascript" src="/jblib/mb.extruder/inc/jquery.hoverIntent.min.js"></script>';
            data += '<script type="text/javascript" src="/jblib/mb.extruder/inc/jquery.mb.flipText.js"></script>';
            data += '<script type="text/javascript" src="/jblib/mb.extruder/inc/mbExtruder.js"></script>';
            //<div id="extruderRight" class="{title:'Jobs ', url:'plugins/JBlast/JobPanel.html'}"></div>
            data += '<div id="extruderRight" class="{title:\'Jobs \', url:\'plugins/JBClient/JobPanel.html\'}"></div>';
            
            $('body').append(data);

            $("#extruderRight").buildMbExtruder({
                position:"right",
                width:300,
                extruderOpacity:.8,
                hidePanelsOnClose:true,
                accordionPanels:true,
                onExtOpen:function(){},
                onExtContentLoad:function(){
                    jobPanelInit();
                },
                onExtClose:function(){}
            });
        //});            
        
    },
    setupEventTraps: function() {
        
        // trap track events
        io.socket.get('/track', function(resData, jwres) {
            console.log("registered for track events");
            console.log(resData);
        });

        io.socket.on('track', function(event){
            console.log('event track',event);
        });    
    },
    Browser_override_makeCurrentViewURL(x) {
        
    }

});
});

function jobPanelInit() {              
    console.log("jobPanelInit()");
    
    // fix position of flap
    $("#extruderRight div.flap").addClass("flapEx");

    // add gear icon (activity indicator)
    //$("#extruderRight div.flap").prepend("<img class='cogwheel hidden' src='plugins/JBlast/img/st_active.gif' />");
    $("#extruderRight div.flap").attr('title','Workflow queue');

    $("#extruderRight .extruder-content").css('height','300px');
    $("#extruderRight .extruder-content").css('border-bottom-left-radius','5px');



    //adjust grid height
    setInterval(function() {
        var h = $("#extruderRight div.extruder-content").height();
        $("#j-hist-grid").height(h-3);
    },1000);
}
