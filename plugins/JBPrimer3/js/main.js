/* 
    JBPrimer3 - Client Menu and other interface integrations
    Author     : ey
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
        console.log("plugin: JBPrimer3",args,"login",this.browser.loginState);
        
        var thisb = this;
        var browser = this.browser;

        browser.jbconnect.analyzeMenus.JBPrimer3 = {
            title: 'Primer3 Analysis',
            module: 'JBPrimer3',
            init:initMenu,
            contents:dialogContent,
            process:processInput
        };

        browser.jbconnect.getWorkflows(function(workflows){
            browser.jbconnect.analyzeMenus.JBPrimer3.workflows = workflows;
            thisb.workflows = workflows;
        }, 'JBPrimer3');

        
        function initMenu(menuName,queryDialog,container) {
            browser.addGlobalMenuItem( menuName, new MenuItem({
                id: 'menubar_submit_primer3',
                label: 'Primer3 - Submit Highlighted Region',
                //iconClass: 'dijitIconFilter',
                onClick: function() {

                    let btnState = $("[widgetid*='highlight-btn'] > input").attr('aria-checked');
                    console.log("btnState",btnState,typeof btnState);
                    if (btnState==='mixed') {
                        // launch blast dialog
                        console.log("launch blast dialog");
                        startPrimer3Dialog();

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
            function startPrimer3Dialog() {
                                    
                    var dialog = new queryDialog({
                        browser:thisb.browser,
                        plugin:thisb.plugin,
                        workflows:thisb.workflows
                    });
                    dialog.analyzeMenu = browser.jbconnect.analyzeMenus.JBPrimer3; 
                    dialog.show(function(x) {});
            }          
        }
        function dialogContent(container) {
            //Render textarea box
            var searchBoxDiv = dom.create('div', {
                className: "section",
                innerHTML:
                    '<div class="pr-params">'
                    +'<table class="pr-table">'
                    +'<tr>'
                    +'    <td class="pr-head">Primer Size</td>'
                    +'    <td>Min</td>'
                    +'    <td><input class="pr-data" type="text" name="PRIMER_MIN_SIZE"></td>'
                    +'    <td>Opt</td>'
                    +'    <td><input class="pr-data" type="text" name="PRIMER_OPT_SIZE"></td>'
                    +'    <td>Max</td>'
                    +'    <td><input class="pr-data" type="text" name="PRIMER_MAX_SIZE"></td>'
                    +'</tr>'
                    +'<tr>'
                    +'    <td class="pr-head">Primer GC%</td>'
                    +'    <td>Min</td>'
                    +'    <td><input class="pr-data" type="text" name="PRIMER_MIN_GC"></td>'
                    +'    <td>Opt</td>'
                    +'    <td><input class="pr-data" type="text" name="PRIMER_OPT_GC"></td>'
                    +'    <td>Max</td>'
                    +'    <td><input class="pr-data" type="text" name="PRIMER_MAX_GC"></td>'
                    +'</tr>'
                    +'<tr>'
                    +'    <td class="pr-head">Primer Tm</td>'
                    +'    <td>Min</td>'
                    +'    <td><input class="pr-data" type="text" name="PRIMER_MIN_TM"></td>'
                    +'    <td>Opt</td>'
                    +'    <td><input class="pr-data" type="text" name="PRIMER_OPT_TM"></td>'
                    +'    <td>Max</td>'
                    +'    <td><input class="pr-data" type="text" name="PRIMER_MAX_TM"></td>'
                    +'</tr>'
                    +'</table>'
                    +'</div>'
                    //'<span classs="header">Input sequence to submit</span><br />'+ 
                    //</tr>/'<textarea id="sequence-text" class="seq-text" />'
            }, container );

            // setup default values for fields
            setTimeout(function() {
                $('.pr-data[name=PRIMER_MIN_SIZE]').val(18);
                $('.pr-data[name=PRIMER_OPT_SIZE]').val(20);
                $('.pr-data[name=PRIMER_MAX_SIZE]').val(27);
                $('.pr-data[name=PRIMER_MIN_GC]').val(20.0);
                $('.pr-data[name=PRIMER_OPT_GC]').val(50.0);
                $('.pr-data[name=PRIMER_MAX_GC]').val(80.0);
                $('.pr-data[name=PRIMER_MIN_TM]').val(57);
                $('.pr-data[name=PRIMER_OPT_TM]').val(60);
                $('.pr-data[name=PRIMER_MAX_TM]').val(63);
            },200);
        }
        function processInput(cb) {
            console.log ('jbprimer3 processInput',browser);

            // check if bpSize is oversized
            let bpSize = browser._highlight.end - browser._highlight.start;
            if (browser.jbconnect.isOversized(bpSize))  return {err: "oversized"};

            // get parameter list
            let params = {}; 
            $( ".pr-params .pr-data" ).each(function( i ) {
                console.log( $(this).attr('name')+ ": " + $( this ).val() );
                params[$(this).attr('name')] = $( this ).val();
            });            
            

            browser.getStore('refseqs', dojo.hitch(this,function( refSeqStore ) {
                if( refSeqStore ) {
                    var hilite = browser._highlight;
                    refSeqStore.getReferenceSequence(
                        hilite,
                        dojo.hitch( this, function( seq ) {
                            let bpSize = hilite.end-hilite.start;
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
