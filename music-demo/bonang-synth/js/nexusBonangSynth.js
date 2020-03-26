(function () {
    "use strict";

    fluid.defaults("fluid.nexusBonangSynth", {
        gradeNames: "fluid.nexusWebSocketBoundComponent",
        members: {
            nexusPeerComponentPath: "nexus.bonang.synth",
            nexusBoundModelPath: "controls",
            sendsChangesToNexus: false,
            receivesChangesFromNexus: true
        },
        model: {
            controls: {
                activeNote: -1,
                tremoloFreq: 1
            }
        },
        components: {
            bonang: {
                type: "fluid.trackerSynth.bonang",
                options: {
                    model: {
                        activeNote: "{fluid.nexusBonangSynth}.model.controls.activeNote",
                        inputs: {
                            tremolo: {
                                freq: "{fluid.nexusBonangSynth}.model.controls.tremoloFreq"
                            }
                        }
                    }
                }
            }
        }
    });

}());
