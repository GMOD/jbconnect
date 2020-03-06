/* 
    JBSample - Example JBConnect JBrowse plugins
*/

define([
    'dojo/_base/declare',
    'dojo/dom-construct',
    'JBrowse/Plugin',
    'dijit/form/Button',
    'dijit/Dialog',
    'dijit/MenuItem'
   ],
   function(
    declare,
    dom,
    JBrowsePlugin,
    Button, 
    Dialog,
    MenuItem
   ) {
return declare( JBrowsePlugin,
{
    constructor: function( args ) {
        console.log("plugin: JBSample",args,"login",this.browser.loginState);
        
        var thisb = this;
        var browser = this.browser;

        // analyze menu structure
        browser.jbconnect.analyzeMenus.JBSample = {
            title: 'Sample Analysis',
            module: 'JBSample',
            init:initMenu,
            contents:dialogContent,
            process:processInput
        };

        browser.jbconnect.getWorkflows(function(workflows){
            browser.jbconnect.analyzeMenus.JBSample.workflows = workflows;
            thisb.workflows = workflows;
        }, 'JBSample');

        // initMenu sets up Analyze Menu item(s)
        function initMenu(menuName,queryDialog,container) {
            browser.addGlobalMenuItem( menuName, new MenuItem({
                id: 'menubar_submit_sample',
                label: 'JBSample Job - Submit Highlighted Region',
                //iconClass: 'dijitIconFilter',
                onClick: function() {

                    let btnState = $("[widgetid*='highlight-btn'] > input").attr('aria-checked');
                    console.log("btnState",btnState,typeof btnState);
                    if (btnState==='mixed') {
                        // launch blast dialog
                        console.log("launch sample dialog");
                        startSampleDialog();

                    }
                    if (btnState==='false' || btnState==='true') {
                        // false - highlight button hasn't been pressed
                        // true - highlight button has been pressed but region not selected yet.

                        let txt = "";
                        txt += 'This feature allows you to select an arbitrary region to submit for analysis using the highlight region feature of JBrowse. <p/>';
                        
                        if (btnState==='false') {
                            txt += 'To begin, click the highlight button <img src="plugins/JBAnalyze/img/hilite_unselected.PNG" height="22px" /> on the toolbar to begin the highlight mode. ';
                        }
                        if (btnState==='true') {
                            txt += 'You have selected the highlight button, which now appears yellow <img src="plugins/JBAnalyze/img/hilite_selected.PNG" height="22px" />. ';
                        }
                        txt += 'Highlight the region by clicking the start coordinate in the track area of the genome browser, ';
                        txt += 'holding down and dragging to the end coordinate and releasing. ';

                        // show highlight instruct box
                        var confirmBox = new Dialog({ title: 'Highlight region to submit for analysis' });
                        dojo.create('div', {
                            id: 'confirm-btn',
                            style: "width: 700px;padding:15px",
                            innerHTML: txt
        
                        }, confirmBox.containerNode );
                        new Button({
                            id: 'ok-btn1',
                            label: 'Ok',
                            //iconClass: 'dijitIconDelete',
                            onClick: function() {
                                confirmBox.destroyRecursive();
                                //confirmCleanBox.hide();
                            }
                        })
                        .placeAt( confirmBox.containerNode );

                        confirmBox.show();

                    }
                }
            }));
            function startSampleDialog() {
                                    
                    var dialog = new queryDialog({
                        browser:thisb.browser,
                        plugin:thisb.plugin,
                        workflows:thisb.workflows
                    });
                    dialog.analyzeMenu = browser.jbconnect.analyzeMenus.JBSample; 
                    dialog.show(function(x) {});
            }          
        }

        // setup content of submit dialog box
        function dialogContent(container) {
            //Render textarea box

            var searchBoxDiv = dom.create('div', {
                className: "section",
                innerHTML:
                    '<div class="s-params">'
                    +'    Add CUSTOM_DATA= attribute to all features in the sample result.<br/>'
                    +'    <input class="s-data" type="text" name="CUSTOM_DATA">'
                    +'</div>'
            }, container );

            // setup default values for fields
            setTimeout(function() {
                $('.s-data[name=CUSTOM_DATA]').val('hello world');
            },200);
        }

        // after Submit button is pressed, this processes input from the dialog prior to submitting the job.
        function processInput(cb) {
            console.log ('JBSample processInput',browser);

            // check if bpSize is oversized
            let bpSize = browser._highlight.end - browser._highlight.start;
            if (browser.jbconnect.isOversized(bpSize))  return {err: "oversized"};

            // get parameter list
            let params = {}; 
            $( ".s-params .s-data" ).each(function( i ) {
                console.log( $(this).attr('name')+ ": " + $( this ).val() );
                params[$(this).attr('name')] = $( this ).val();
            });            
            
            // get the highlighted region data
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
                                cb({
                                    region:fastaData,
                                    bpSize:bpSize,
                                    params:params
                                });
                            });                                
                        })
                    );
                }
            }));             
        }
    }
});
});
