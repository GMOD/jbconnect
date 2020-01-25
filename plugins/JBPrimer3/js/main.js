/* 
    JBMenu - Client Menu and other interface integrations
    Author     : ey
*/

define([
    'dojo/_base/declare',
    'dojo/dom-construct',
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
    dom,
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
        console.log("plugin: JBPrimer3 ",args);
        
        var thisb = this;
        var browser = this.browser;

        browser.jbanalyze.analyzeMenus.testmenu = {
            title: 'Primer3 Test',
            init:initMenu,
            contents:dialogContent,
            process:processInput
        };
        
        function initMenu(queryDialog,container) {
            browser.addGlobalMenuItem( 'tools', new MenuItem({
                id: 'menubar_submit_primer3',
                label: 'Primer3 - submit',
                //iconClass: 'dijitIconFilter',
                onClick: function() {
                    //console.log(thisb,thisb.plugin);
                    browser.jbanalyze.getWorkflows(function(workflows){

                        if (workflows.length==0) {
                            alert("no workflows found");
                            return;
                        }
                                        
                        var dialog = new queryDialog({
                            browser:thisb.browser,
                            plugin:thisb.plugin,
                            workflows:workflows
                        });
                        dialog.analyzeMenu = browser.jbanalyze.analyzeMenus.testmenu; 
                        dialog.show(function(x) {});
                    });                       
                }
            }));
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
            console.log ('jbprimer3 process',browser);
            let bpSize = browser._highlight.end - browser._highlight.start;

            if (browser.jbanalyze.isOversized(bpSize))  return {err: "oversized"};
    
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
                                //browser.analyzeDialog(fastaData,bpSize);
                                cb({
                                    region:fastaData,
                                    bpSize:bpSize
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
