/*jslint vars: true, plusplus: true, nomen: true, regexp: true, maxerr: 50 */
/*global define, brackets, $, document */

define(function (require, exports, module) {
    "use strict";
    
    var EditorManager = brackets.getModule("editor/EditorManager"),
        ProjectManager = brackets.getModule("project/ProjectManager"),
        InlineColorEditor = require("InlineColorEditor"),
        link = document.createElement("link"),
        hexRegEx = /#([a-f0-9]{6}|[a-f0-9]{3})/i,
        hslRegEx = /hsla?\((\d|,|%| |.)*\)/i,
        rgbRegEx = /rgba?\((\d|,|%| |.)*\)/i,
        _colorPickers = {};

    link.type = "text/css";
    link.rel = "stylesheet";
    link.href = require.toUrl("css/main.css");
    document.getElementsByTagName("head")[0].appendChild(link);
    
    function onClose(colorPicker) {
        return delete _colorPickers[colorPicker.pos.line];
    }
    
    function inlineColorEditorProvider(hostEditor, pos) {
        var colorPicker, colorRegEx, cursorLine, end, inlineColorEditor, match, result, sel, start;
        sel = hostEditor.getSelection(false);
        if (sel.start.line !== sel.end.line) {
            return null;
        }
        
        colorRegEx = /#[a-f0-9]{6}|#[a-f0-9]{3}|rgb\( ?\b([0-9]{1,2}|1[0-9]{2}|2[0-4][0-9]|25[0-5])\b ?, ?\b([0-9]{1,2}|1[0-9]{2}|2[0-4][0-9]|25[0-5])\b ?, ?\b([0-9]{1,2}|1[0-9]{2}|2[0-4][0-9]|25[0-5])\b ?\)|rgba\( ?\b([0-9]{1,2}|1[0-9]{2}|2[0-4][0-9]|25[0-5])\b ?, ?\b([0-9]{1,2}|1[0-9]{2}|2[0-4][0-9]|25[0-5])\b ?, ?\b([0-9]{1,2}|1[0-9]{2}|2[0-4][0-9]|25[0-5])\b ?, ?\b(1|0|0\.[0-9]{1,3}) ?\)|hsl\( ?\b([0-9]{1,2}|[12][0-9]{2}|3[0-5][0-9]|360)\b ?, ?\b([0-9]{1,2}|100)\b% ?, ?\b([0-9]{1,2}|100)\b% ?\)|hsla\( ?\b([0-9]{1,2}|[12][0-9]{2}|3[0-5][0-9]|360)\b ?, ?\b([0-9]{1,2}|100)\b% ?, ?\b([0-9]{1,2}|100)\b% ?, ?\b(1|0|0\.[0-9]{1,3}) ?\)/i;
        cursorLine = hostEditor._codeMirror.getLine(pos.line);
        match = cursorLine.match(colorRegEx);
        
        if (!match) {
            return null;
        } else {
            start = match.index;
            end = start + match[0].length;
            if (pos.ch < start || pos.ch > end) {
                return null;
            }
        }
        
        pos.ch = start;
        colorPicker = _colorPickers[pos.line];
        if (colorPicker) {
            colorPicker.close();
            if (match[0] === colorPicker.color) {
                return null;
            }
        }
        
        hostEditor._codeMirror.setSelection({ line: pos.line, ch: start },
                                            { line: pos.line, ch: end });
        
        result = new $.Deferred();
        inlineColorEditor = new InlineColorEditor(match[0], pos);
        inlineColorEditor.onClose = onClose;
        inlineColorEditor.load(hostEditor, pos);
        _colorPickers[pos.line] = inlineColorEditor;
        result.resolve(inlineColorEditor);
        return result.promise();
    }
    
    EditorManager.registerInlineEditProvider(inlineColorEditorProvider);
    
    exports.inlineColorEditorProvider = inlineColorEditorProvider;
});
