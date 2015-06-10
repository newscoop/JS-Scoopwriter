define([
    'aloha',
    'jquery',
    'aloha/plugin',
    'ui/ui',
    'ui/button',
    'aloha/console',
    'undo/vendor/undo',
    'undo/vendor/diff_match_patch_uncompressed'
],
function(Aloha, jQuery, Plugin, Ui, Button, Console) {
 
    var dmp = new diff_match_patch();
 
    function reversePatch(patch) {
        var reversed = dmp.patch_deepCopy(patch);
        for (var i = 0; i < reversed.length; i++) {
            for (var j = 0; j < reversed[i].diffs.length; j++) {
                reversed[i].diffs[j][0] = -(reversed[i].diffs[j][0]);
            }
        }
        return reversed;
    }
 
    function enableBlocks() {

        if (!Aloha.settings.plugins.block.defaults) {
            Aloha.settings.plugins.block.defaults = {};
        }
        /**
         * re-enable all blocks instead of just the active
         * editable blocks
         */
        $.each(Aloha.editables, function () {
            var editable = this;
            if ( editable !== null ) {
                var $editor = jQuery(editable.obj);
                jQuery.each(Aloha.settings.plugins.block.defaults, 
                    function(selector, instanceDefaults) {
                        $editor.find(selector).alohaBlock(instanceDefaults);
                    }
                );
            }
        });
    }
 
    var EditCommand = Undo.Command.extend({
        constructor: function(editable, patch) {
            this.editable = plugin.getRootEditable(editable);
            this.patch = patch;
        },
        execute: function() {
            //command object is created after execution.
        },
        undo: function() {
            Aloha.undoneEditable = this.editable;
            this.phase(reversePatch(this.patch));
        },
        redo: function() {
            Aloha.redoneEditable = this.editable;
            this.phase(this.patch);
        },
        phase: function(patch) {
            var contents = this.editable.getContents(),
                applied = dmp.patch_apply(patch, contents),
                newValue = applied[0],
                didNotApply = applied[1];
            this.reset(newValue);
        },
        reset: function(val) {
            var reactivate = null;
            if (Aloha.getActiveEditable() === this.editable) {
                Aloha.deactivateEditable();
                reactivate = this.editable;
            }
 
            this.editable.obj.html(val);
 
            if (null !== reactivate) {
                reactivate.activate();
            }
 
            this.editable.oldContents = val;
        }
    });
    /**
     * register the plugin with unique name
     */
    var plugin = Plugin.create('undo', {
        /**
         * Initialize the plugin and set initialize flag on true
         */
        init: function () {
            plugin.stack = new Undo.Stack();
            plugin.stack.changed = function() {
                plugin.updateButtons();
            };
 
            plugin.createButtons();
 
            jQuery(document).keydown(function(event) {
                if (!event.metaKey || event.keyCode != 90) {
                    return;
                }
                event.preventDefault();
 
                //Before doing an undo, bring the smartContentChange
                //event up to date.
                plugin.takeSnapshot();
 
                if (event.shiftKey) {
                    plugin.redo();
                } else {
                    plugin.undo();
                }
            });
 
            Aloha.bind('aloha-smart-content-changed', function(jevent, aevent) {
                plugin.takeSnapshot(aevent.editable);
            });
 
            Aloha.bind('aloha-editable-activated', function(event, rangeObject) {
                plugin.updateButtons();
            });

            /**
             * Added in order to access undo/redo
             * from custom functions in our app
             * not very nice, but it works
             */
            Aloha.canUndo = function () {
                return plugin.stack.canUndo();
            }
            Aloha.canRedo = function () {
                return plugin.stack.canRedo();
            }
            Aloha.undo = function () {
                plugin.undo();
            }
            Aloha.redo = function () {
                plugin.redo();
            }
        },
        takeSnapshot: function(editable){
            if (editable == null) {
                editable = Aloha.getActiveEditable();
            }
            editable = plugin.getRootEditable(editable);
 
            var newValue = editable.getContents(),
                oldValue = editable.oldContents || editable.getSnapshotContent(),
                patch = dmp.patch_make(oldValue, newValue);
 
            // getContents triggers content-handlers and the makeClean method of
            // plugins. The table plugin calls mahaloBlock on table wrappers.
            Aloha.jQuery('.aloha-table-wrapper').alohaBlock();
 
            // only push an EditCommand if something actually changed.
            if (0 !== patch.length) {
                plugin.stack.execute( new EditCommand( editable, patch ) );
                editable.oldContents = newValue;
            }
        },
        getRootEditable: function (editable) {
            if (!editable || !editable.obj) {
                Console.warn('undo', 'editable.obj not found.');
                return Aloha.editables[0];
            }
 
            // Get top-most aloha-editable
            var root = editable.obj.parents('.aloha-editable').last();
            if (!root.length) {
                if (editable.obj.parents('body').length) {
                    return editable;
                }
                else {
                    // Sometimes the editable is detached from DOM (deleted blocks?)
                    Console.warn('undo', 'Dettached editable, falling back to editable[0]');
                    return Aloha.editables[0];
                }
            }
 
            var rootEditable;
            $.each(Aloha.editables, function(){
                if (this.obj[0] === root[0]) {
                    rootEditable = this;
                }
            });
 
            return rootEditable;
        },
        undo: function(){
            if (plugin.stack.canUndo()){
                plugin.stack.undo();
                enableBlocks();
            }
        },
        redo: function(){
            if (plugin.stack.canRedo()){
                plugin.stack.redo();
                enableBlocks();
            }
        },
        updateButtons: function () {
            plugin.undoButton.element.button('option', 'disabled', !plugin.stack.canUndo());
            plugin.redoButton.element.button('option', 'disabled', !plugin.stack.canRedo());
        },
        createButtons: function () {
            plugin.undoButton = Ui.adopt('undo', Button, {
                tooltip: 'Undo',
                icon: 'aloha-button-undo',
                scope: 'Aloha.continuoustext',
                click: function() {
                    plugin.undo();
                }
            });

            plugin.redoButton = Ui.adopt('redo', Button, {
                tooltip: 'Redo',
                icon: 'aloha-button-redo',
                scope: 'Aloha.continuoustext',
                click: function() {
                    plugin.redo();
                }
            });

            plugin.updateButtons();
        },
        /**
         * toString method
         * @return string
         */
        toString: function () {
            return 'undo';
        }
 
    });
 
    return plugin;
});
