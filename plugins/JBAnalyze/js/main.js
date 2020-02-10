/* 
    JBAnalyze - Client Menu and other interface integrations
    Author     : ey
*/

define([
        'dojo/_base/declare',
        'dojo/_base/lang',
        'dojo/Deferred',
        'dojo/dom-construct',
        'dojo/query',
        'JBrowse/Plugin',
           'dijit/form/Button',
           'dijit/Dialog',
           "dojo/store/Memory",
           "dijit/form/ComboBox",
            'dijit/Menu',
            'dijit/MenuItem',
           'JBrowse/has'
       ],
       function(
        declare,
        lang,
        Deferred,
        domConstruct,
        query,
        JBrowsePlugin,
        Button, Dialog, Memory, ComboBox,Menu,MenuItem,has
       ) {
return declare( JBrowsePlugin,
{
    constructor: function( args ) {
        console.log("plugin: JBAnalyze ",args);
        
        var thisB = this;
        var browser = this.browser;

        // skip the following if not logged in  <-------------------------
        if (!this.browser.loginState) return;

        browser.jbconnect = {
            asset: null,
            browser: browser,
            focusQueue: [],
            focusQueueProc: 0,
            panelDelayTimer: null,
            bpSizeLimit: args.bpSizeLimit || 0,
            getWorkflows: this.getWorkflows,
            countSequence: thisB.countSequence,
            analyzeMenus: {},

            // check if bpSize > bpSizeLimit, if bpSizeLimit is defined
            isOversized(bpSize) {
                let bpSizeLimit = JBrowse.jbconnect.bpSizeLimit;

                if (bpSizeLimit && bpSize > bpSizeLimit) {
                    // oversize message
                    alert("Query size is "+bpSize+".  The query size is limited to "+bpSizeLimit+" bp for demonstration purposes.  bpSizeLimit is set in trackList.json.");
                    return true;
                }
                else return false;
            }
        };
        // insert Analyze menu
        browser.afterMilestone( '/jbrowse/jbclient_ready', function() {
        
            thisB.initAnalyzeMenu();
        });
        
    },

    initAnalyzeMenu() {
        let thisb = this;
        let browser = this.browser;
        this.plugin = this;
        let menuName = "analyze"; 
        require([
            'dojo/dom-construct',
            'dijit/MenuItem',
            'dijit/Dialog',
            'dijit/form/Button',
            'plugins/JBAnalyze/js/queryDialog'
        ], function(dom,dijitMenuItem,Dialog,dButton,queryDialog){
            
            let analyzeMenus = browser.jbconnect.analyzeMenus;

            //console.log("JBAnalyze toolmenu init",analyzeMenus);//Object.keys(analyzeMenus).length);
            
            for(let i in analyzeMenus) {
                console.log("Analyze menu",i);
                analyzeMenus[i].init(menuName,queryDialog);
            }

            browser.addGlobalMenuItem( menuName, new dijitMenuItem({
                id: 'menubar_jblast_dbclean',
                label: 'Reset Analysis Results',
                //iconClass: 'dijitIconFilter',
                onClick: function() {

                    // show confirm dialog
                    let confirmCleanBox = new Dialog({ title: 'Confirm reset',id:'demo-clean-confirm-dialog' });

                    dom.create('div', {
                        id: 'descript',
                        innerHTML: 'This is a demo-only feature that will clean up the<br>job queue and tracks.  Are you sure you want to do this?'
                    }, confirmCleanBox.containerNode );

                    new dButton({
                        id: 'yes',
                        label: 'Yes',
                        //iconClass: 'dijitIconDelete',
                        onClick: function() {
                            //alert('ding');
                            $.post( "/util/democleanup",{}, function( data) {
                                console.log("demo cleaned up");
                                setTimeout(function() {
                                    location.reload();
                                },1000);
                            });
                            confirmCleanBox.destroyRecursive();
                            //confirmCleanBox.hide();
                        }
                    })
                    .placeAt( confirmCleanBox.containerNode );
            
                    new dButton({
                        id: 'no',
                        label: 'No',
                        //iconClass: 'dijitIconDelete',
                        onClick: function() {
                            confirmCleanBox.destroyRecursive();
                            //confirmCleanBox.hide();
                        }
                    })
                    .placeAt( confirmCleanBox.containerNode );
            
                    confirmCleanBox.show();
                
                }
            }));

            browser.renderGlobalMenu( menuName,'AnalyzeTools', browser.menuBar );

            // reorder the menubar
            $("[widgetid*='dropdownbutton_analyze']").insertBefore("[widgetid*='dropdownbutton_help']");
            $("[widgetid*='dropdownbutton_analyze'] span.dijitButtonNode").html(" Analyze");

        });
    },
    /**
     * get galaxy workflows (using jbrowse api)
     * @param {type} cb - cb(workflows]]
     * @returns {getWorkflows}
     */
    getWorkflows(cb,servModule) {
        let browser = this.browser;
        
        let xhr = $.get( "/service/exec/get_workflows?dataset="+browser.config.dataRoot+"&module="+servModule, function( data ) {
            for(let i=0;i<data.length;i++) console.log('getWorkflow',i,data[i]);
            cb(data);
        }).fail(function(jqxhr, textStatus, errorThrown) {
            alert('get_workflows failed',textStatus);
        });;
    },
    countSequence(seq) {
        let lines = seq.split("\n");
        let count = 0;

        for(let i=0;i<lines.length;i++) {
            console.log(i,lines[i]);
            if (lines[i].charAt(0) !== ">") {
                count += lines[i].length;
            }
        }
    
        return count;
    }

});
});


