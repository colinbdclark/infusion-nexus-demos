(function () {
    "use strict";

    fluid.defaults("fluid.nexusBonangSynthControl", {
        gradeNames: ["fluid.nexusWebSocketBoundComponent", "fluid.viewComponent"],
        selectors: {
            noteInput: ".fluidc-bonang-synth-note",
            sendButton: ".fluidc-bonang-synth-send"
        },
        members: {
            nexusPeerComponentPath: "nexus.bonang.control",
            nexusBoundModelPath: "activeNote",
            sendsChangesToNexus: true,
            receivesChangesFromNexus: false
        },
        model: {
            activeNote: -1
        },
        invokers: {
            sendButtonHandler: {
                funcName: "fluid.nexusBonangSynthControl.sendButtonHandler",
                args: [
                    "{that}.applier",
                    "{that}.nexusBoundModelPath",
                    "{that}.dom.noteInput"
                ]
            }
        },
        listeners: {
            "onCreate.registerSendButtonHandler": {
                "this": "{that}.dom.sendButton",
                method: "click",
                args: ["{that}.sendButtonHandler"]
            }
        }
    });

    fluid.nexusBonangSynthControl.sendButtonHandler = function (applier, modelPath, noteInput) {
        var noteVal = fluid.parseInteger(noteInput.val());
        applier.change(modelPath, noteVal);
    };

}());
