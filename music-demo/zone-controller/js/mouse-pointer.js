(function () {
    "use strict";

    fluid.defaults("fluid.trackerSynth.pointer", {
        gradeNames: "fluid.viewComponent",

        model: {
            position: {
                relative: {
                    x: 0,
                    y: 0
                },

                absolute: {
                    left: 0,
                    top: 0
                }
            },

            // TODO: due to Infusion model transformation bugs, this default ends up overwriting the trackingRegion's bounds,
            //        even though it should be the canonical source. This is due to the model relays below, combined with the
            //        options fed into the pointer in nexusZoneController.js
            // bounds: {
            //     width: 0,
            //     height: 0
            // }
        },

        modelRelay: [
            {
                target: "{that}.model.position.absolute.left",
                singleTransform: {
                    type: "fluid.transforms.binaryOp",
                    left: "{that}.model.position.relative.x",
                    operator: "*",
                    right: "{that}.model.bounds.width"
                }
            },
            {
                target: "{that}.model.position.absolute.top",
                singleTransform: {
                    type: "fluid.transforms.binaryOp",
                    left: "{that}.model.position.relative.y",
                    operator: "*",
                    right: "{that}.model.bounds.height"
                }
            }
        ],

        modelListeners: {
            "position.absolute": [
                {
                    "this": "{that}.container",
                    method: "css",
                    args: ["{change}.value"]
                }
            ]
        }
    });
}());
