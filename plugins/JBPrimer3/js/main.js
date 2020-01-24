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
            title: 'Test Dialog',
            init:initMenu,
            contents:dialogContent,
            process:processInput
        };
        
        function initMenu(queryDialog,container) {
            console.log("testmenu.init")

            browser.addGlobalMenuItem( 'tools', new MenuItem({
                id: 'menubar_submit_test',
                label: 'test',
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
                    '<span classs="header">Input sequence to submit</span><br />'+ 
                    '<textarea id="sequence-text" class="seq-text" />'
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
