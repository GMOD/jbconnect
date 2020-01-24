/* 
    JBMenu - Client Menu and other interface integrations
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
        console.log("plugin: JBPrimer3 ",args);
        
        var thisB = this;
        var browser = this.browser;
    }
});
});
