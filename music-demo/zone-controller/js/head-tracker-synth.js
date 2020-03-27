(function () {
    "use strict";

    fluid.defaults("fluid.trackerSynth", {
        gradeNames: "fluid.viewComponent",

        components: {
            region: {
                type: "fluid.trackerSynth.trackingRegion",
                container: "{that}.container"
            },

            // TODO: @simonbates, you'll need to swap this component
            // out for a new one that listens for Nexus changes and converts
            // from your camera coordinate system to model.position.x/y float values
            // in the range from 0.0 to 1.0 (zero representing left and top, respectively).
            tracker: {
                type: "fluid.mouseTracker",
                container: "{that}.container",
                options: {
                    model: {
                        bounds: "{region}.model"
                    }
                }
            },

            pointer: {
                type: "fluid.trackerSynth.pointer",
                container: "#pointer",
                options: {
                    model: {
                        position: {
                            relative: "{tracker}.model.position"
                        },
                        bounds: "{region}.model"
                    }
                }
            },

            zoneController: {
                type: "fluid.trackerSynth.zoneController",
                container: ".controller",
                options: {
                    model: {
                        pointerPosition: "{pointer}.model.position.absolute"
                    }
                }
            },

            bonang: {
                type: "fluid.trackerSynth.bonang",
                options: {
                    numNotes: "{zoneController}.dom.zones.length",
                    model: {
                        activeNote: "{zoneController}.model.activeZoneIdx"
                    }
                }
            }
        }
    });

    fluid.defaults("fluid.trackerSynth.trackingRegion", {
        gradeNames: "fluid.viewComponent",

        model: {
            /* TODO: likely due to Infusion bugs related to model initialization, these expanders do not work as intended
               both height and width end up set to 0.
               Since flocking is currently incompatible with the dev release that fixes these issues, the below onCreate
               listener manually sets the model values.
            height: {
                expander: {
                    "this": "{that}.container",
                    method: "height"
                }
            },

            width: {
                expander: {
                    "this": "{that}.container",
                    method: "width"
                }
            }
            */
           // FIXME: I don't even know why these work
           // no one is currently generating the actual page bounds, so I'm not sure how the pointer continues to function
           height: 1,
           width: 1
        }

        // TODO: this listener should be unnecessary once we move to a post-FLUID-6145 Infusion release
        // listeners: {
        //     "onCreate.setRegionBounds": "fluid.trackerSynth.trackingRegion.setRegionBounds({that})"
        // },

        // Debugging, delete later
        // modelListeners: {
        //     height: {
        //         funcName: "fluid.trackerSynth.trackingRegion.listenToBounds",
        //         args: "{change}.value"
        //     }
        // }
    });

    // TODO: remove
//     fluid.trackerSynth.trackingRegion.setRegionBounds = function(trackingRegion) {
//         console.log(trackingRegion.model);
//         trackingRegion.applier.change("height", trackingRegion.container.height());
//         trackingRegion.applier.change("width", trackingRegion.container.width());
//         console.log(trackingRegion.model);
//     };

    // TODO: remove
//     fluid.trackerSynth.trackingRegion.listenToBounds = function(height) {
//         if (height === 0) {
//             console.log('height set to 0');
//             // throw new Error('height set to 0');
//         } else {
//             console.log('height set to non-zero value');
//         }
//     };
}());
