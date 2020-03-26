/* global SensorAPI */

(function () {
    "use strict";

    fluid.defaults("fluid.nexusOrientationSensor", {
        gradeNames: ["fluid.nexusWebSocketBoundComponent", "fluid.viewComponent"],
        selectors: {
            displayOrientationValues: ".fluidc-display-orientation-values"
        },
        members: {
            nexusHost: "localhost", // Set to Nexus host
            nexusPeerComponentPath: "nexus.sensors",
            nexusBoundModelPath: "orientation",
            sendsChangesToNexus: true,
            receivesChangesFromNexus: false,
            lastUpdated: 0,
            minimumUpdatePeriodMs: 100
        },
        model: {
            orientation: {}
        },
        modelListeners: {
            orientation: {
                funcName: "fluid.nexusOrientationSensor.displayValues",
                args: ["{change}.value", "{that}.dom.displayOrientationValues"]
            }
        },
        invokers: {
            handleSensorEvent: {
                funcName: "fluid.nexusOrientationSensor.handleSensorEvent",
                args: [
                    "{that}",
                    "{that}.applier",
                    "{that}.nexusBoundModelPath",
                    "{arguments}.0" // event data
                ]
            }
        },
        listeners: {
            "onCreate.loadSensorDriver": {
                funcName: "fluid.nexusOrientationSensor.loadSensorDriver",
                args: ["{that}.handleSensorEvent"]
            }
        }
    });

    fluid.nexusOrientationSensor.loadSensorDriver = function (eventHandler) {
        var app = new SensorAPI();
        app.loadDriver("../../node_modules/sensorapijs/driver/deviceOrientation.js");
        app.onDeviceAdded(function(device) {
            device.sensors.orientation.subscribe(eventHandler);
        });
    };

    fluid.nexusOrientationSensor.handleSensorEvent = function (that, applier, modelPath, eventData) {
        var now = Date.now();
        if (now > that.lastUpdated + that.minimumUpdatePeriodMs) {
            that.lastUpdated = now;
            // Update the model with the orientation info from eventData
            applier.change(modelPath, {
                alpha: eventData.alpha,
                beta: eventData.beta,
                gamma: eventData.gamma,
                absolute: eventData.absolute
            });
        }
    };

    fluid.nexusOrientationSensor.displayValues = function (data, elem) {
        elem.text(JSON.stringify(data));
    };

}());
