"use strict";

var fluid = require("infusion"),
    SerialPort = require("serialport");

fluid.defaults("fluid.nexus.atlasScientificConnection", {
    gradeNames: "fluid.component",

    devicePath: null, // To be provided by user

    serialPortOptions: {
        autoOpen: false,
        baudRate: 9600,
        dataBits: 8,
        stopBits: 1
    },

    members: {
        serialPortParser: "@expand:fluid.nexus.atlasScientificConnection.constructReadlineCrParser()",
        serialPort: {
            expander: {
                funcName: "fluid.nexus.atlasScientificConnection.constructSerialPort",
                args: [
                    "{that}.options.devicePath",
                    "{that}.options.serialPortOptions",
                    "{that}.serialPortParser",
                    "{that}.events.onData",
                    "{that}.events.onClose"
                ]
            }
        }
    },

    invokers: {
        start: {
            "this": "{that}.serialPort",
            method: "open",
            args: ["{that}.openCallback"]
        },
        openCallback: {
            funcName: "fluid.nexus.atlasScientificConnection.openCallback",
            args: [
                "{arguments}.0", // Error
                "{that}.events.onStarted",
                "{that}.events.onErrorOpeningConnection"
            ]
        },
        sendDeviceInformationRequest: {
            "this": "{that}.serialPort",
            method: "write",
            // TODO: Provide callback for error notification
            args: ["\rI\r"]
        }
    },

    events: {
        onStarted: null,
        onErrorOpeningConnection: null,
        onData: null, // Response data string
        onReading: null, // Array of numbers
        onDeviceInformation: null, // Device Information data
        onClose: null
    },

    listeners: {
        "onData.parseResponse": {
            listener: "fluid.nexus.atlasScientificConnection.parseResponse",
            args: [
                "{that}",
                "{arguments}.0" // Response
            ]
        }
    }
});

fluid.nexus.atlasScientificConnection.constructReadlineCrParser = function () {
    return SerialPort.parsers.readline("\r");
};

fluid.nexus.atlasScientificConnection.constructSerialPort = function (devicePath, serialPortOptions, serialPortParser, onDataEvent, onCloseEvent) {

    var options = fluid.extend({}, serialPortOptions);
    options.parser = serialPortParser;

    var port = new SerialPort(devicePath, options);

    port.on("data", function(data) {
        onDataEvent.fire(data);
    });

    port.on("close", function() {
        onCloseEvent.fire();
    });

    return port;
};

fluid.nexus.atlasScientificConnection.openCallback = function (error, successEvent, errorEvent) {
    if (error) {
        errorEvent.fire(error);
    } else {
        successEvent.fire();
    }
};

fluid.nexus.atlasScientificConnection.parseResponse = function (that, response) {
    if (/^\d/.test(response)) {
        // Response starts with a digit, parse as a reading
        that.events.onReading.fire(fluid.transform(response.split(","), parseFloat));
    } else if (response.startsWith("?I")) {
        // Device information
        var deviceInfoData = response.split(",");
        if (deviceInfoData.length === 3) {
            that.events.onDeviceInformation.fire({
                deviceType: deviceInfoData[1],
                firmwareVersion: deviceInfoData[2]
            });
        }
    }
};

fluid.defaults("fluid.nexus.atlasScientificDriver", {
    gradeNames: "fluid.modelComponent",

    devicePath: null, // To be provided by user
    nexusHost: "localhost",
    nexusPort: 9081,

    circuitTypes: {
        "EC": {
            sensorName: "Conductivity",
            units: "μS/cm",
            rangeMin: 0,
            rangeMax: 20000,
            nexusPeerComponentPath: "ecSensor",
            nexusPeerComponentOptions: {
                type: "fluid.nexus.atlasScientificDriver.ecSensor"
            }
        },
        "pH": {
            sensorName: "pH",
            units: undefined,
            rangeMin: 0,
            rangeMax: 14,
            nexusPeerComponentPath: "phSensor",
            nexusPeerComponentOptions: {
                type: "fluid.nexus.atlasScientificDriver.phSensor"
            }
        }
    },

    components: {
        atlasScientificConnection: {
            type: "fluid.nexus.atlasScientificConnection",
            options: {
                devicePath: "{atlasScientificDriver}.options.devicePath",
                events: {
                    onErrorOpeningConnection: "{atlasScientificDriver}.events.onErrorConnectingToSensor"
                },
                listeners: {
                    "onStarted.sendDeviceInformationRequest": {
                        listener: "{that}.sendDeviceInformationRequest"
                    },
                    "onReading.log": function (data) {
                        console.log("Reading: " + JSON.stringify(data));
                    },
                    "onDeviceInformation.log": function (data) {
                        console.log("Device information: " + JSON.stringify(data));
                    },
                    "onClose.log": function () {
                        console.log("Close");
                    },
                    "onClose.destroyPeer": "{atlasScientificDriver}.events.doDestroyNexusPeer"
                }
            }
        },

        nexusBinding: {
            type: "fluid.nexusWebSocketBoundComponent",
            createOnEvent: "{atlasScientificConnection}.events.onDeviceInformation",
            options: {
                circuitType: "{arguments}.0.deviceType",
                members: {
                    nexusHost: "{atlasScientificDriver}.options.nexusHost",
                    nexusPort: "{atlasScientificDriver}.options.nexusPort",
                    nexusPeerComponentPath: {
                        expander: {
                            func: "fluid.nexus.atlasScientificDriver.lookupCircuitData",
                            args: [
                                "{atlasScientificDriver}.options.circuitTypes",
                                "{that}.options.circuitType",
                                "nexusPeerComponentPath"
                            ]
                        }
                    },
                    nexusPeerComponentOptions: {
                        expander: {
                            func: "fluid.nexus.atlasScientificDriver.lookupCircuitData",
                            args: [
                                "{atlasScientificDriver}.options.circuitTypes",
                                "{that}.options.circuitType",
                                "nexusPeerComponentOptions"
                            ]
                        }
                    },
                    nexusBoundModelPath: "sensorData",
                    sendsChangesToNexus: true,
                    managesPeer: true
                },
                model: {
                    sensorData: {
                        name: {
                            expander: {
                                func: "fluid.nexus.atlasScientificDriver.lookupCircuitData",
                                args: [
                                    "{atlasScientificDriver}.options.circuitTypes",
                                    "{that}.options.circuitType",
                                    "sensorName"
                                ]
                            }
                        },
                        units: {
                            expander: {
                                func: "fluid.nexus.atlasScientificDriver.lookupCircuitData",
                                args: [
                                    "{atlasScientificDriver}.options.circuitTypes",
                                    "{that}.options.circuitType",
                                    "units"
                                ]
                            }
                        },
                        rangeMin: {
                            expander: {
                                func: "fluid.nexus.atlasScientificDriver.lookupCircuitData",
                                args: [
                                    "{atlasScientificDriver}.options.circuitTypes",
                                    "{that}.options.circuitType",
                                    "rangeMin"
                                ]
                            }
                        },
                        rangeMax: {
                            expander: {
                                func: "fluid.nexus.atlasScientificDriver.lookupCircuitData",
                                args: [
                                    "{atlasScientificDriver}.options.circuitTypes",
                                    "{that}.options.circuitType",
                                    "rangeMax"
                                ]
                            }
                        },
                        value: 0
                    }
                },
                events: {
                    onErrorConstructingPeer: "{atlasScientificDriver}.events.onErrorConstructingPeer",
                    onPeerDestroyed: "{atlasScientificDriver}.events.onNexusPeerComponentDestroyed"
                },
                listeners: {
                    "{atlasScientificConnection}.events.onReading": {
                        listener: "fluid.nexus.atlasScientificDriver.updateModelSensorValue",
                        args: [
                            "{that}",
                            "{arguments}.0" // Sensor reading
                        ]
                    },
                    "{atlasScientificDriver}.events.doDestroyNexusPeer": {
                        listener: "{that}.destroyNexusPeerComponent"
                    }
                }
            }
        }
    },

    invokers: {
        start: "{atlasScientificConnection}.start",
        destroyNexusPeerComponent: "{that}.events.doDestroyNexusPeer.fire"
    },

    events: {
        onErrorConnectingToSensor: null,
        onErrorConstructingPeer: null,
        doDestroyNexusPeer: null,
        onNexusPeerComponentDestroyed: null
    }

});

fluid.nexus.atlasScientificDriver.lookupCircuitData = function (circuitTypes, deviceType, key) {
    return circuitTypes[deviceType][key];
};

fluid.nexus.atlasScientificDriver.updateModelSensorValue = function (nexusBinding, sensorReading) {
    // Use the first value from the sensor reading
    //
    // For more information, see the Atlas Scientific circuit
    // documentation:
    //
    // - https://www.atlas-scientific.com/_files/_datasheets/_circuit/pH_EZO_datasheet.pdf
    // - https://www.atlas-scientific.com/_files/_datasheets/_circuit/EC_EZO_Datasheet.pdf
    //
    nexusBinding.applier.change("sensorData.value", sensorReading[0]);
};
