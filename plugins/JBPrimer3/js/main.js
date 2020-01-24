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
                    +'    <td><input type="text" name="PRIMER_MIN_SIZE"></td>'
                    +'    <td>Opt</td>'
                    +'    <td><input type="text" name="PRIMER_MIN_SIZE"></td>'
                    +'    <td>Max</td>'
                    +'    <td><input type="text" name="PRIMER_MIN_SIZE"></td>'
                    +'</tr>'
                    +'<tr>'
                    +'    <td class="pr-head">Primer GC%</td>'
                    +'    <td>Min</td>'
                    +'    <td><input type="text" name="PRIMER_MIN_GC"></td>'
                    +'    <td>Opt</td>'
                    +'    <td><input type="text" name="PRIMER_OPT_GC"></td>'
                    +'    <td>Max</td>'
                    +'    <td><input type="text" name="PRIMER_MAX_GC"></td>'
                    +'</tr>'
                    +'<tr>'
                    +'    <td class="pr-head">Primer Tm</td>'
                    +'    <td>Min</td>'
                    +'    <td><input type="text" name="PRIMER_MIN_TM"></td>'
                    +'    <td>Opt</td>'
                    +'    <td><input type="text" name="PRIMER_OPT_TM"></td>'
                    +'    <td>Max</td>'
                    +'    <td><input type="text" name="PRIMER_MAX_TM"></td>'
                    +'</tr>'
                    +'</table>'
                    +'</div>'
                    //'<span classs="header">Input sequence to submit</span><br />'+ 
                    //</tr>/'<textarea id="sequence-text" class="seq-text" />'
            }, container );
        }
        function processInput() {
            console.log ('jbprimer3 process');

            let sequence = $('.search-dialog #sequence-text').val();
            let bpSize = browser.jbanalyze.countSequence(sequence);
            if (browser.jbanalyze.isOversized(bpSize)) return 0;    // failed

            var postData = {
                region: sequence
            }
            return postData;
    }

    }
});
});
