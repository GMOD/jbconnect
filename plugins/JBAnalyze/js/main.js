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

        browser.jbmenuDialog = thisB.Browser_jbmenuDialog;

        browser.jbmenu = {
            asset: null,
            browser: browser,
            focusQueue: [],
            focusQueueProc: 0,
            panelDelayTimer: null,
            bpSizeLimit: args.bpSizeLimit || 0,
            getWorkflows: this.getWorkflows,

            // check if bpSize > bpSizeLimit, if bpSizeLimit is defined
            isOversized(bpSize) {
                let bpSizeLimit = JBrowse.jbmenu.bpSizeLimit;

                if (bpSizeLimit && bpSize > bpSizeLimit) {
                    // oversize message
                    alert("Query size is "+bpSize+".  The query size is limited to "+bpSizeLimit+" bp for demonstration purposes.  bpSizeLimit is set in trackList.json.");
                    return true;
                }
                else return false;
            }
        };


        /*
         * class override function intercepts
         */
        browser.afterMilestone( 'initView', function() {
            
         
            // skip the following if not logged in  <-------------------------
            if (!thisB.browser.loginState) return;

            if (typeof browser.config.classInterceptList === 'undefined') {
                browser.config.classInterceptList = {};
            }
            
            // setInterval(function() {
            //     if ($('div.popup-dialog div.feature-detail')[0]) {
            //         thisB.insertFeatureDetail();
            //     } 
            // },2000);

            // load toolmenu "Analyze menu"
            require(["plugins/JBAnalyze/js/toolmenu"], function(toolmenu){
                toolmenu.init(browser,thisB);
            });        
        });


    },

    /**
     * Display blast dialog box
     * @returns {undefined}
     */
    startBlast: function() {
        console.log("startBlast()");
        var thisB = this;
        var browser = this.browser;
        let bpSize = browser._highlight.end - browser._highlight.start;

        if (browser.jbmenu.isOversized(bpSize))  return;

        browser.getStore('refseqs', dojo.hitch(this,function( refSeqStore ) {
            if( refSeqStore ) {
                var hilite = browser._highlight;
                refSeqStore.getReferenceSequence(
                    hilite,
                    dojo.hitch( this, function( seq ) {
						let bpSize = hilite.end-hilite.start;
                        //console.log('startBlast() found sequence',hilite,bpSize);
                        require(["JBrowse/View/FASTA"], function(FASTA){
                            var fasta = new FASTA();
                            var fastaData = fasta.renderText(hilite,seq);
                            //console.log('FASTA',fastaData);
                            //delete fasta;
                            browser.jbmenuDialog(fastaData,bpSize);
                        });                                

                    })
                );
            }
        }));             
    },

    // display blast dialog
    Browser_jbmenuDialog: function (region,bpSize) {
        var regionB = region;
        var thisB = this;
        var comboData = [];

        //console.log("plugin",this);
        this.jbmenu.getWorkflows(function(workflows){

            if (workflows.length==0) {
                alert("no workflows found");
                return;
            }
            
            var stateStore = new Memory({
                data: comboData
            });
            
            function destroyBlastDialog() {
                dialog.destroyRecursive();
            };
            var dialog = new Dialog({ 
                title: 'Process Primer3',
                onHide: function() {
                    destroyBlastDialog();
                }
            });
            
            var ddd = dojo.create('div', {
                innerHTML: "xxx"
            }, dialog.containerNode);

            dojo.create('span', {
                innerHTML: 'Workflow '
            }, dialog.containerNode);
            
            dojo.create('button', {
                id: 'blast-workflow-select'
            }, dialog.containerNode);
            
            for(var i in workflows) {
                console.log("workflow",workflows[i]);
                if (!workflows[i].deleted) {
                    comboData.push({'name': workflows[i].name, 'id':workflows[i].id});
                }
            }

            var comboBox = new ComboBox({
                id: "workflow-combo",
                name: "workflow",
                value: comboData[0].name,
                store: stateStore,
                searchAttr: "name"
            }, "blast-workflow-select").startup();            
            
            dojo.create('div', {
                id: 'blast-box',
                style: {'margin-top': '20px'},
                innerHTML: 'This will process Primer3 analysis on the selected sequence.<br/><button id="submit-btn" type="button">Submit</button> <button id="cancel-btn" type="button">Cancel</button>'
            }, dialog.containerNode);

            var submitBtn = new Button({
                label: "Submit",
                onClick: function(){
                    
                    // get selected workflow
                    var selStr = dijit.byId('workflow-combo').get('value');
                    for(var x in comboData) {
                        if (comboData[x].name == selStr) {
                            var selWorkflow = comboData[x].id;
                            console.log('Selected workflow',selWorkflow,comboData[x].name);
                        }
                    }
                    console.log('Selected workflow',selWorkflow);
                    
                    var postData = {
                          service: "workflow",
                          dataset: thisB.config.dataRoot,
                          region: regionB,
                          workflow: selWorkflow
                      };
                    $.post( "/job/submit", postData , function( result ) {

                        // open the job queue panel
                        $('#extruderRight').openMbExtruder(true);$('#extruderRight').openPanel();
                        
                        // show confirm submit box
                        var confirmBox = new Dialog({ title: 'Confirmation' });
                        dojo.create('div', {
                            id: 'confirm-btn',
                            innerHTML: 'BLAST submitted...'
                        }, confirmBox.containerNode );
                        confirmBox.show();

                        // close confirm box
                        setTimeout(function(){ confirmBox.destroyRecursive();  }, 2000);

                    }, "json")
                    .fail(function(jqxhr, textStatus, errorThrown) {
                        alert( "Job submit failed: "+jqxhr.responseText+" ("+jqxhr.status+"-"+jqxhr.statusText+")" );
                    });

                    destroyBlastDialog();
                }
            }, "submit-btn").startup();
            var cancelBtn = new Button({
                label: "Cancel",
                onClick: function(){
                    destroyBlastDialog();
                }
            }, "cancel-btn").startup();
            
			console.log("query region: ",regionB);
			
            if (dialog) dialog.show();

        });
    },

    /**
     * get galaxy workflows (using jbrowse api)
     * @param {type} cb - cb(workflows]]
     * @returns {getWorkflows}
     */
    getWorkflows(cb) {
        let browser = this.browser;
        
        let xhr = $.get( "/service/exec/get_workflows?dataset="+browser.config.dataRoot, function( data ) {
            console.log("get workflows result", data);
            cb(data);
        }).fail(function(jqxhr, textStatus, errorThrown) {
            alert('get_workflows failed',textStatus);
        });;
    }

});
});


