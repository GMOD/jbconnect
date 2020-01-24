define(function(){
    return {

        init(browser,plugin) {
            let thisb = this;
            this.browser = browser;
            this.plugin = plugin; 
            console.log("JBAnalyze toolmenu init",this);
            require([
                'dojo/dom-construct',
                'dijit/MenuItem',
                'dijit/Dialog',
                'dijit/form/Button',
                'plugins/JBAnalyze/js/queryDialog'
            ], function(dom,dijitMenuItem,Dialog,dButton,queryDialog){
                
                
                browser.addGlobalMenuItem( 'tools', new dijitMenuItem({
                    id: 'menubar_submit_seq',
                    label: 'Submit DNA sequence',
                    //iconClass: 'dijitIconFilter',
                    onClick: function() {
                        //console.log(thisb,thisb.plugin);
                        thisb.plugin.getWorkflows(function(workflows){

                            if (workflows.length==0) {
                                alert("no workflows found");
                                return;
                            }
                                           
                            var dialog = new queryDialog({
                                browser:thisb.browser,
                                plugin:thisb.plugin,
                                workflows:workflows
                            }); 
                            dialog.show(function(x) {
                            });
                        });                       
                    }
                }));
                
                browser.addGlobalMenuItem( 'tools', new dijitMenuItem({
                    id: 'menubar_blast_hilite',
                    label: 'Primer3 - Submit highlighted region',
                    //iconClass: 'dijitIconFilter',
                    onClick: function() {
                        let btnState = $("[widgetid*='highlight-btn'] > input").attr('aria-checked');
                        console.log("btnState",btnState,typeof btnState);
                        if (btnState==='mixed') {
                            // launch blast dialog
                            console.log("launch blast dialog");
                            plugin.startBlast();

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

                            //txt += 'The BLAST button <img src="plugins/JBAnalyze/img/blast_btn.PNG" height="22px"/> will ';
                            //txt += 'then appear in the tool button area. Click the BLAST button to blast the highlighted region.';                                            
    


                            // show highlight instruct box
                            var confirmBox = new Dialog({ title: 'Highlight region to submit for analysis' });
                            dojo.create('div', {
                                id: 'confirm-btn',
                                style: "width: 700px;padding:15px",
                                innerHTML: txt
            
                            }, confirmBox.containerNode );
                            new dButton({
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
                /*
                browser.addGlobalMenuItem( 'tools', new dijitMenuItem({
                    id: 'menubar_jblast_dbclean',
                    label: 'Clear demo data',
                    //iconClass: 'dijitIconFilter',
                    onClick: function() {

                        // show confirm dialog
                        let confirmCleanBox = new Dialog({ title: 'Confirm Demo Cleanup',id:'demo-clean-confirm-dialog' });

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
                */
                browser.renderGlobalMenu( 'tools','JBlastTools', browser.menuBar );
    
                // reorder the menubar
                $("[widgetid*='dropdownbutton_tools']").insertBefore("[widgetid*='dropdownbutton_help']");
                $("[widgetid*='dropdownbutton_tools'] span.dijitButtonNode").html(" Analyze");

            });

        }
    }
});