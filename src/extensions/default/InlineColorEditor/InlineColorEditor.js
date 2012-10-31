/*jslint vars: true, plusplus: true, nomen: true, regexp: true, maxerr: 50 */
/*global define, brackets, $, window */

define(function (require, exports, module) {
    "use strict";
    
    var InlineWidget         = brackets.getModule("editor/InlineWidget").InlineWidget,
        ColorEditor          = require("ColorEditor"),
        InlineEditorTemplate = require("text!InlineColorEditorTemplate.html");

    function _extends(child, parent) {
        var key;
        for (key in parent) {
            if (parent.hasOwnProperty(key)) {
                child[key] = parent[key];
            }
        }
        
        function Ctor() {
            this.constructor = child;
        }
        
        Ctor.prototype = parent.prototype;
        child.prototype = new Ctor();
        child.__super__ = parent.prototype;
        return child;
    }
    
    function InlineColorEditor(color, pos) {
        this.color = color;
        this.pos = pos;
        this.setColor = this.setColor.bind(this);

        this.initialColorString = this.color;
        InlineWidget.call(this);
    }

    _extends(InlineColorEditor, InlineWidget);

    InlineColorEditor.prototype.parentClass = InlineWidget.prototype;
    InlineColorEditor.prototype.$wrapperDiv = null;

    InlineColorEditor.prototype.setColor = function (colorLabel) {
        var end;
        if (colorLabel !== this.initialColorString) {
            end = { line: this.pos.line, ch: this.pos.ch + this.color.length };
            this.editor.document.replaceRange(colorLabel, this.pos, end);
            this.editor._codeMirror.setSelection(this.pos, {
                line: this.pos.line,
                ch: this.pos.ch + colorLabel.length
            });
            return (this.color = colorLabel);
        }
    };

    InlineColorEditor.prototype.load = function (hostEditor) {
        var selectedColors, self;
        self = this;
        this.editor = hostEditor;
        this.parentClass.load.call(this, hostEditor);
        selectedColors = this.editor._codeMirror.getValue().match(/#[a-f0-9]{6}|#[a-f0-9]{3}|rgb\( ?\b([0-9]{1,2}|1[0-9]{2}|2[0-4][0-9]|25[0-5])\b ?, ?\b([0-9]{1,2}|1[0-9]{2}|2[0-4][0-9]|25[0-5])\b ?, ?\b([0-9]{1,2}|1[0-9]{2}|2[0-4][0-9]|25[0-5])\b ?\)|rgba\( ?\b([0-9]{1,2}|1[0-9]{2}|2[0-4][0-9]|25[0-5])\b ?, ?\b([0-9]{1,2}|1[0-9]{2}|2[0-4][0-9]|25[0-5])\b ?, ?\b([0-9]{1,2}|1[0-9]{2}|2[0-4][0-9]|25[0-5])\b ?, ?\b(1|0|0\.[0-9]{1,3}) ?\)|hsl\( ?\b([0-9]{1,2}|[12][0-9]{2}|3[0-5][0-9]|360)\b ?, ?\b([0-9]{1,2}|100)\b% ?, ?\b([0-9]{1,2}|100)\b% ?\)|hsla\( ?\b([0-9]{1,2}|[12][0-9]{2}|3[0-5][0-9]|360)\b ?, ?\b([0-9]{1,2}|100)\b% ?, ?\b([0-9]{1,2}|100)\b% ?, ?\b(1|0|0\.[0-9]{1,3}) ?\)/gi);
        selectedColors = this.usedColors(selectedColors, 7);
        this.$wrapperDiv = $(InlineEditorTemplate);
        this.colorEditor = new ColorEditor(this.$wrapperDiv, this.color, this.setColor, selectedColors);
        return this.$htmlContent.append(this.$wrapperDiv);
    };

    InlineColorEditor.prototype.close = function () {
        if (this.closed) {
            return;
        }
        this.closed = true;
        this.hostEditor.removeInlineWidget(this);
        if (this.onClose) {
            return this.onClose(this);
        }
    };

    InlineColorEditor.prototype.onAdded = function () {
        window.setTimeout(this._sizeEditorToContent.bind(this));
        return this.colorEditor.focus();
    };

    InlineColorEditor.prototype._sizeEditorToContent = function () {
        return this.hostEditor.setInlineWidgetHeight(this, this.$wrapperDiv.outerHeight(), true);
    };

    InlineColorEditor.prototype.usedColors = function (originalArray, length) {
        var a, colorCount, compressed, copyArray, copyColor, i, originalColor, _i, _j, _len, _len1;
        if (length === undefined) {
            length = 10;
        }
        compressed = [];
        copyArray = originalArray.slice(0);
        for (_i = 0, _len = originalArray.length; _i < _len; _i++) {
            originalColor = originalArray[_i];
            colorCount = 0;
            for (i = _j = 0, _len1 = copyArray.length; _j < _len1; i = ++_j) {
                copyColor = copyArray[i];
                if (originalColor && copyColor && originalColor.toLowerCase() === copyColor.toLowerCase()) {
                    colorCount++;
                    delete copyArray[i];
                }
            }
            if (colorCount > 0) {
                a = {};
                a.value = originalColor;
                a.count = colorCount;
                compressed.push(a);
            }
        }
        compressed.sort(function (a, b) {
            if (a.count === b.count) {
                return 0;
            }
            if (a.count > b.count) {
                return -1;
            }
            if (a.count < b.count) {
                return 1;
            }
        });
        return compressed.slice(0, length);
    };

    module.exports = InlineColorEditor;
});
