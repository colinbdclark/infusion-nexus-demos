"use strict";

var fluid = require("infusion");

require("infusion-nexus-client");

var nexusHost = "localhost";
var nexusPort = 9081;

fluid.defaults("fluid.nexus.fakeSensor", {
    gradeNames: ["fluid.nexusWebSocketBoundComponent"],
    model: {
        fakeSensorConfig: {
            updateDelayMs: 1000
        }
    },
    members: {
        nexusHost: nexusHost,
        nexusPort: nexusPort,
        nexusBoundModelPath: "sensorData",
        sendsChangesToNexus: true,
        managesPeer: true
    },
    invokers: {
        "update": {
            "funcName": "fluid.nexus.fakeSensor.update",
            "args": "{that}"
        }
    },
    listeners: {
        "onErrorConstructingPeer.exitProcess": {
            funcName: "fluid.nexus.fakeSensor.logErrorAndExit",
            args: ["{arguments}.0"]
        },
        "onPeerDestroyed.exitProcess": {
            funcName: "fluid.nexus.fakeSensor.exitProcess"
        }
    }
});

fluid.defaults("fluid.nexus.fakeSensor.sinValue", {
    gradeNames: ["fluid.nexus.fakeSensor"],
    members: {
        nexusPeerComponentPath: "fakeSensor",
        nexusPeerComponentOptions: {
            type: "fluid.nexus.fakeSensor"
        }
    },
    model: {
        fakeSensorConfig: {
            updateDelayMs: 2000
        },
        sensorData: {
            name: "Fake Sensor",
            rangeMin: -1,
            rangeMax: 1,
            value: 0
        }
    },
    invokers: {
        "getFakeSensorValue": {
            "funcName": "fluid.nexus.fakeSensor.getFakeSensorValueSin",
            "args": ["{that}"]
        }
    }
});

fluid.defaults("fluid.nexus.fakeSensor.pHValue", {
    gradeNames: ["fluid.nexus.fakeSensor"],
    members: {
        nexusPeerComponentPath: "fakeSensorPH",
        nexusPeerComponentOptions: {
            type: "fluid.nexus.fakeSensorPH"
        }
    },
    model: {
        fakeSensorConfig: {
            updateDelayMs: 5000
        },
        sensorData: {
            name: "Fake pH Sensor",
            rangeMin: 0,
            rangeMax: 14,
            value: 7
        }
    },
    invokers: {
        "getFakeSensorValue": {
            "funcName": "fluid.nexus.fakeSensor.getFakeSensorValuePH"
        }
    }
});


fluid.defaults("fluid.nexus.fakeSensor.temperature", {
    gradeNames: ["fluid.nexus.fakeSensor"],
    members: {
        nexusPeerComponentPath: "fakeSensorTemperature",
        nexusPeerComponentOptions: {
            type: "fluid.nexus.fakeSensorTemperature"
        }
    },
    model: {
        fakeSensorConfig: {
            updateDelayMs: 5000
        },
        sensorData: {
            name: "Fake Temperature Sensor",
            rangeMin: 10,
            rangeMax: 40,
            value: 15
        }
    },
    invokers: {
        "getFakeSensorValue": {
            "funcName": "fluid.nexus.fakeSensor.getFakeSensorValueTemperature"
        }
    }
});

fluid.nexus.fakeSensor.logErrorAndExit = function (error) {
    console.log(error.message);
    process.exit();
};

fluid.nexus.fakeSensor.exitProcess = function () {
    process.exit();
};

fluid.nexus.fakeSensor.update = function (that) {
    var nextValue = that.getFakeSensorValue();
    console.log(that.model.sensorData.name + ": " + nextValue);
    that.applier.change("sensorData.value", nextValue);
    setTimeout(function () {
        fluid.nexus.fakeSensor.update(that);
    }, that.model.fakeSensorConfig.updateDelayMs);
};

// A fairly even sin-based sensor value that moves between -1 and 1
// Calculates the sin period based on the update frequency
fluid.nexus.fakeSensor.getFakeSensorValueSin = function (that) {
    var sinPeriodMs = that.model.fakeSensorConfig.updateDelayMs * 10;
    return Math.sin((new Date().getTime() % sinPeriodMs) * Math.PI * 2 / sinPeriodMs);
};

// a pH sensor type value between 0 and 14
fluid.nexus.fakeSensor.getFakeSensorValuePH = function () {
    return fluid.nexus.fakeSensor.randomFloat(0,14);
};

fluid.nexus.fakeSensor.getFakeSensorValueTemperature = function () {
    return fluid.nexus.fakeSensor.randomFloat(10,40);
};

fluid.nexus.fakeSensor.randomInt = function(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
};

fluid.nexus.fakeSensor.randomFloat = function(min, max) {
    return Math.random() * (max - min) + min;
};

var fakeSensor = fluid.nexus.fakeSensor.sinValue();

var fakeSensorPH = fluid.nexus.fakeSensor.pHValue();

var fakeSensorTemperature = fluid.nexus.fakeSensor.temperature();

process.on("SIGINT", function () {
    fakeSensor.destroyNexusPeerComponent();
    fakeSensorPH.destroyNexusPeerComponent();
    fakeSensorTemperature.destroyNexusPeerComponent();
});

fakeSensor.update();
fakeSensorPH.update();
fakeSensorTemperature.update();
