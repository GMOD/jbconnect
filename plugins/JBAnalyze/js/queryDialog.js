define([
    'dojo/_base/declare',
    'dojo/dom-construct',
    'dojo/aspect',
    'dijit/focus',
    'dijit/Dialog',
    'dijit/form/Button',
    'dijit/form/RadioButton',
    'dijit/form/CheckBox',
    'dijit/form/TextBox',
    'dijit/form/Textarea',
    "dojo/store/Memory",
    "dijit/form/ComboBox",
    'JBrowse/View/Dialog/WithActionBar'
],
function(
    declare,
    dom,
    aspect,
    focus,
    Dialog,
    dButton,
    dRButton,
    dCheckBox,
    dTextBox,
    dTextArea,
    Memory,
    ComboBox,
    ActionBarDialog
) {

return declare( ActionBarDialog, {

constructor: function(args) {
    this.plugin = args.plugin;
    this.browser = args.browser;
    this.workflows = args.workflows;
    var thisB = this;

    aspect.after( this, 'hide', function() {
          focus.curNode && focus.curNode.blur();
          setTimeout( function() { thisB.destroyRecursive(); }, 500 );
    });
},

_dialogContent: function () {
    
    console.log("_dialogContent");
    let workflows =this.workflows;
    let wfStr = "";
    for(var i in workflows) {
        if (!workflows[i].deleted) {
            wfStr += "<option value='"+workflows[i].id+"'>"+workflows[i].name+"</option>";
        }
    }
    let container = dom.create('div', { className: 'search-dialog' } );

    let workflowCombo = dom.create('div', {
        id: 'workflow-div',
        className: 'section',
        innerHTML:
            '<span classs="header">Select Workflow</span><br />'+ 
            '<select id="workflow-combo" name="workflow">'+wfStr+'</select>'

    },container);

    let cfg = this.browser.config;

    console.log("queryDialog.analyzeMenu",this.analyzeMenu);

    if (this.analyzeMenu && this.analyzeMenu.contents)
        this.analyzeMenu.contents(container);


    return container;
},

_getSearchParams: function() {
    var content = this.content;
    //console.log("dialog result",$('.search-dialog #workflow-combo').find('option:selected').val(),$('.search-dialog #sequence-text').val());
    return {
        workflow: $('.search-dialog #workflow-combo').find('option:selected').val(),
        //sequence: $('.search-dialog #sequence-text').val()
    };
},

_fillActionBar: function ( actionBar ) {
    let thisB = this;
    let browser = this.browser;
    console.log("_fillActionBar()");

    new dButton({
        label: 'Submit',
        //iconClass: 'dijitIconBookmark',
        onClick: function() {
            var searchParams = thisB._getSearchParams();
            thisB.callback( searchParams );
            thisB.hide();

            console.log("queryDialog submit");

            if (thisB.analyzeMenu && thisB.analyzeMenu.process) {

                thisB.analyzeMenu.process((postData) => {
                    if (postData.err) {
                        alert(postData.err);
                        return;
                    }
                    postData.service = "workflow";
                    postData.dataset = browser.config.dataRoot;
                    postData.workflow = searchParams.workflow;

                    thisB.postSubmit(postData);
                });
            }
        }
    })
    .placeAt( actionBar );

    new dButton({
        label: 'Cancel',
        //iconClass: 'dijitIconDelete',
        onClick: function() {
            thisB.callback( false );
            thisB.hide();
        }
    })
    .placeAt( actionBar );
},

postSubmit(postData) {
    console.log("postSubmit",postData);
    $.post( "/job/submit", postData , function( result ) {

        // open job queue panel
        $('#extruderRight').openMbExtruder(true);$('#extruderRight').openPanel();

        // show confirm submit box
        var confirmBox = new Dialog({ title: 'Confirmation' });
        dojo.create('div', {
            id: 'confirm-btn',
            innerHTML: 'submitted...'
        }, confirmBox.containerNode );
        confirmBox.show();

        // close confirm box
        setTimeout(function(){ confirmBox.destroyRecursive(); }, 2000);

    }, "json")
    .fail(function(jqxhr, textStatus, errorThrown) {
        alert( "Job submit failed: "+jqxhr.responseText+" ("+jqxhr.status+"-"+jqxhr.statusText+")" );
    });
},

show: function ( callback ) {
    
    if (this.analyzeMenu && this.analyzeMenu.process)
        this.set( 'title', this.analyzeMenu.title);

    this.callback = callback || function() {};
    this.set( 'content', this._dialogContent() );
    this.inherited( arguments );
    focus.focus( this.closeButtonNode );
},


});
});
