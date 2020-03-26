"use strict";

var fluid = require("infusion");
var gpii = fluid.registerNamespace("gpii");

require("infusion-nexus-client");

var nexusHost = "localhost";
var nexusPort = 9081;

fluid.promise.sequence([
    function () {
        return fluid.writeNexusDefaults(
            nexusHost,
            nexusPort,
            "fluid.nexus.fakeSensor",
            {
                gradeNames: [ "fluid.modelComponent" ],
                model: {
                    sensorData: { }
                }
            }
        );
    },
    function () {
        return fluid.writeNexusDefaults(
            nexusHost,
            nexusPort,
            "fluid.nexus.fakeSensorPH",
            {
                gradeNames: [ "fluid.modelComponent" ],
                model: {
                    sensorData: { }
                }
            }
        );
    },
    function () {
        return fluid.writeNexusDefaults(
            nexusHost,
            nexusPort,
            "fluid.nexus.fakeSensorTemperature",
            {
                gradeNames: [ "fluid.modelComponent" ],
                model: {
                    sensorData: { }
                }
            }
        );
    },
    function () {
        return fluid.writeNexusDefaults(
            nexusHost,
            nexusPort,
            "fluid.nexus.atlasScientificDriver.phSensor",
            {
                gradeNames: [ "fluid.modelComponent" ],
                model: {
                    sensorData: { }
                }
            }
        );
    },
    function () {
        return fluid.writeNexusDefaults(
            nexusHost,
            nexusPort,
            "fluid.nexus.atlasScientificDriver.ecSensor",
            {
                gradeNames: [ "fluid.modelComponent" ],
                model: {
                    sensorData: { }
                }
            }
        );
    },
    function () {
        return fluid.writeNexusDefaults(
            nexusHost,
            nexusPort,
            "fluid.nexus.rpiSenseHatDriver.tempSensor1",
            {
                gradeNames: [ "fluid.modelComponent" ],
                model: {
                    sensorData: { }
                }
            }
        );
    },
    function () {
        return fluid.writeNexusDefaults(
            nexusHost,
            nexusPort,
            "fluid.nexus.rpiSenseHatDriver.tempSensor2",
            {
                gradeNames: [ "fluid.modelComponent" ],
                model: {
                    sensorData: { }
                }
            }
        );
    },
    function () {
        return fluid.writeNexusDefaults(
            nexusHost,
            nexusPort,
            "fluid.nexus.scienceLab.collector",
            {
                gradeNames: [ "fluid.modelComponent" ],
                model: {
                    sensors: { }
                }
            }
        );
    },
    function () {
        return fluid.writeNexusDefaults(
            nexusHost,
            nexusPort,
            "fluid.nexus.scienceLab.sendFakeSensor",
            {
                gradeNames: [ "fluid.nexus.recipeProduct" ],
                componentPaths: {
                    fakeSensor: null,
                    collector: null
                },
                components: {
                    fakeSensor: "@expand:fluid.componentForPath({recipeProduct}.options.componentPaths.fakeSensor)",
                    collector: "@expand:fluid.componentForPath({recipeProduct}.options.componentPaths.collector)"
                },
                modelRelay: {
                    source: "{fakeSensor}.model.sensorData",
                    target: "{collector}.model.sensors.fakeSensor",
                    forward: {
                        excludeSource: "init"
                    },
                    singleTransform: {
                        type: "fluid.identity"
                    }
                },
                listeners: {
                    "onDestroy.removeFakeSensor": {
                        listener: "{collector}.applier.change",
                        args: [ "sensors.fakeSensor", null, "DELETE" ]
                    }
                }
            }
        );
    },
    function () {
        return fluid.writeNexusDefaults(
            nexusHost,
            nexusPort,
            "fluid.nexus.scienceLab.sendfakeSensorPH",
            {
                gradeNames: [ "fluid.nexus.recipeProduct" ],
                componentPaths: {
                    fakeSensorPH: null,
                    collector: null
                },
                components: {
                    fakeSensorPH: "@expand:fluid.componentForPath({recipeProduct}.options.componentPaths.fakeSensorPH)",
                    collector: "@expand:fluid.componentForPath({recipeProduct}.options.componentPaths.collector)"
                },
                modelRelay: {
                    source: "{fakeSensorPH}.model.sensorData",
                    target: "{collector}.model.sensors.fakeSensorPH",
                    forward: {
                        excludeSource: "init"
                    },
                    singleTransform: {
                        type: "fluid.identity"
                    }
                },
                listeners: {
                    "onDestroy.removefakeSensorPH": {
                        listener: "{collector}.applier.change",
                        args: [ "sensors.fakeSensorPH", null, "DELETE" ]
                    }
                }
            }
        );
    },
    function () {
        return fluid.writeNexusDefaults(
            nexusHost,
            nexusPort,
            "fluid.nexus.scienceLab.sendfakeSensorTemperature",
            {
                gradeNames: [ "fluid.nexus.recipeProduct" ],
                componentPaths: {
                    fakeSensorTemperature: null,
                    collector: null
                },
                components: {
                    fakeSensorTemperature: "@expand:fluid.componentForPath({recipeProduct}.options.componentPaths.fakeSensorTemperature)",
                    collector: "@expand:fluid.componentForPath({recipeProduct}.options.componentPaths.collector)"
                },
                modelRelay: {
                    source: "{fakeSensorTemperature}.model.sensorData",
                    target: "{collector}.model.sensors.fakeSensorTemperature",
                    forward: {
                        excludeSource: "init"
                    },
                    singleTransform: {
                        type: "fluid.identity"
                    }
                },
                listeners: {
                    "onDestroy.removefakeSensorTemperature": {
                        listener: "{collector}.applier.change",
                        args: [ "sensors.fakeSensorTemperature", null, "DELETE" ]
                    }
                }
            }
        );
    },
    function () {
        return fluid.writeNexusDefaults(
            nexusHost,
            nexusPort,
            "fluid.nexus.scienceLab.sendPhSensor",
            {
                gradeNames: [ "fluid.nexus.recipeProduct" ],
                componentPaths: {
                    phSensor: null,
                    collector: null
                },
                components: {
                    phSensor: "@expand:fluid.componentForPath({recipeProduct}.options.componentPaths.phSensor)",
                    collector: "@expand:fluid.componentForPath({recipeProduct}.options.componentPaths.collector)"
                },
                modelRelay: {
                    source: "{phSensor}.model.sensorData",
                    target: "{collector}.model.sensors.phSensor",
                    forward: {
                        excludeSource: "init"
                    },
                    singleTransform: {
                        type: "fluid.identity"
                    }
                },
                listeners: {
                    "onDestroy.removePhSensor": {
                        listener: "{collector}.applier.change",
                        args: [ "sensors.phSensor", null, "DELETE" ]
                    }
                }
            }
        );
    },
    function () {
        return fluid.writeNexusDefaults(
            nexusHost,
            nexusPort,
            "fluid.nexus.scienceLab.sendEcSensor",
            {
                gradeNames: [ "fluid.nexus.recipeProduct" ],
                componentPaths: {
                    ecSensor: null,
                    collector: null
                },
                components: {
                    ecSensor: "@expand:fluid.componentForPath({recipeProduct}.options.componentPaths.ecSensor)",
                    collector: "@expand:fluid.componentForPath({recipeProduct}.options.componentPaths.collector)"
                },
                modelRelay: {
                    source: "{ecSensor}.model.sensorData",
                    target: "{collector}.model.sensors.ecSensor",
                    forward: {
                        excludeSource: "init"
                    },
                    singleTransform: {
                        type: "fluid.identity"
                    }
                },
                listeners: {
                    "onDestroy.removeEcSensor": {
                        listener: "{collector}.applier.change",
                        args: [ "sensors.ecSensor", null, "DELETE" ]
                    }
                }
            }
        );
    },
    function () {
        return fluid.writeNexusDefaults(
            nexusHost,
            nexusPort,
            "fluid.nexus.scienceLab.sendRpiTempSensor1",
            {
                gradeNames: [ "fluid.nexus.recipeProduct" ],
                componentPaths: {
                    tempSensor: null,
                    collector: null
                },
                components: {
                    tempSensor: "@expand:fluid.componentForPath({recipeProduct}.options.componentPaths.tempSensor)",
                    collector: "@expand:fluid.componentForPath({recipeProduct}.options.componentPaths.collector)"
                },
                modelRelay: {
                    source: "{tempSensor}.model.sensorData",
                    target: "{collector}.model.sensors.rpiTempSensor1",
                    forward: {
                        excludeSource: "init"
                    },
                    singleTransform: {
                        type: "fluid.identity"
                    }
                },
                listeners: {
                    "onDestroy.removeRpiTempSensor1": {
                        listener: "{collector}.applier.change",
                        args: [ "sensors.rpiTempSensor1", null, "DELETE" ]
                    }
                }
            }
        );
    },
    function () {
        return fluid.writeNexusDefaults(
            nexusHost,
            nexusPort,
            "fluid.nexus.scienceLab.sendRpiTempSensor2",
            {
                gradeNames: [ "fluid.nexus.recipeProduct" ],
                componentPaths: {
                    tempSensor: null,
                    collector: null
                },
                components: {
                    tempSensor: "@expand:fluid.componentForPath({recipeProduct}.options.componentPaths.tempSensor)",
                    collector: "@expand:fluid.componentForPath({recipeProduct}.options.componentPaths.collector)"
                },
                modelRelay: {
                    source: "{tempSensor}.model.sensorData",
                    target: "{collector}.model.sensors.rpiTempSensor2",
                    forward: {
                        excludeSource: "init"
                    },
                    singleTransform: {
                        type: "fluid.identity"
                    }
                },
                listeners: {
                    "onDestroy.removeRpiTempSensor2": {
                        listener: "{collector}.applier.change",
                        args: [ "sensors.rpiTempSensor2", null, "DELETE" ]
                    }
                }
            }
        );
    },
    function () {
        return fluid.constructNexusPeer(nexusHost, nexusPort, "scienceLabCollector", {
            type: "fluid.nexus.scienceLab.collector"
        });
    },
    function () {
        return fluid.constructNexusPeer(nexusHost, nexusPort, "recipes.sendFakeSensor", {
            type: "fluid.nexus.recipe",
            reactants: {
                fakeSensor: {
                    match: {
                        type: "gradeMatcher",
                        gradeName: "fluid.nexus.fakeSensor"
                    }
                },
                collector: {
                    match: {
                        type: "gradeMatcher",
                        gradeName: "fluid.nexus.scienceLab.collector"
                    }
                }
            },
            product: {
                path: "sendFakeSensor",
                options: {
                    type: "fluid.nexus.scienceLab.sendFakeSensor"
                }
            }
        });
    },
    function () {
        return fluid.constructNexusPeer(nexusHost, nexusPort, "recipes.sendfakeSensorPH", {
            type: "fluid.nexus.recipe",
            reactants: {
                fakeSensorPH: {
                    match: {
                        type: "gradeMatcher",
                        gradeName: "fluid.nexus.fakeSensorPH"
                    }
                },
                collector: {
                    match: {
                        type: "gradeMatcher",
                        gradeName: "fluid.nexus.scienceLab.collector"
                    }
                }
            },
            product: {
                path: "sendfakeSensorPH",
                options: {
                    type: "fluid.nexus.scienceLab.sendfakeSensorPH"
                }
            }
        });
    },
    function () {
        return fluid.constructNexusPeer(nexusHost, nexusPort, "recipes.sendfakeSensorTemperature", {
            type: "fluid.nexus.recipe",
            reactants: {
                fakeSensorTemperature: {
                    match: {
                        type: "gradeMatcher",
                        gradeName: "fluid.nexus.fakeSensorTemperature"
                    }
                },
                collector: {
                    match: {
                        type: "gradeMatcher",
                        gradeName: "fluid.nexus.scienceLab.collector"
                    }
                }
            },
            product: {
                path: "sendfakeSensorTemperature",
                options: {
                    type: "fluid.nexus.scienceLab.sendfakeSensorTemperature"
                }
            }
        });
    },    
    function () {
        return fluid.constructNexusPeer(nexusHost, nexusPort, "recipes.sendPhSensor", {
            type: "fluid.nexus.recipe",
            reactants: {
                phSensor: {
                    match: {
                        type: "gradeMatcher",
                        gradeName: "fluid.nexus.atlasScientificDriver.phSensor"
                    }
                },
                collector: {
                    match: {
                        type: "gradeMatcher",
                        gradeName: "fluid.nexus.scienceLab.collector"
                    }
                }
            },
            product: {
                path: "sendPhSensor",
                options: {
                    type: "fluid.nexus.scienceLab.sendPhSensor"
                }
            }
        });
    },
    function () {
        return fluid.constructNexusPeer(nexusHost, nexusPort, "recipes.sendEcSensor", {
            type: "fluid.nexus.recipe",
            reactants: {
                ecSensor: {
                    match: {
                        type: "gradeMatcher",
                        gradeName: "fluid.nexus.atlasScientificDriver.ecSensor"
                    }
                },
                collector: {
                    match: {
                        type: "gradeMatcher",
                        gradeName: "fluid.nexus.scienceLab.collector"
                    }
                }
            },
            product: {
                path: "sendEcSensor",
                options: {
                    type: "fluid.nexus.scienceLab.sendEcSensor"
                }
            }
        });
    },
    function () {
        return fluid.constructNexusPeer(nexusHost, nexusPort, "recipes.sendRpiTempSensor1", {
            type: "fluid.nexus.recipe",
            reactants: {
                tempSensor: {
                    match: {
                        type: "gradeMatcher",
                        gradeName: "fluid.nexus.rpiSenseHatDriver.tempSensor1"
                    }
                },
                collector: {
                    match: {
                        type: "gradeMatcher",
                        gradeName: "fluid.nexus.scienceLab.collector"
                    }
                }
            },
            product: {
                path: "sendRpiTempSensor1",
                options: {
                    type: "fluid.nexus.scienceLab.sendRpiTempSensor1"
                }
            }
        });
    },
    function () {
        return fluid.constructNexusPeer(nexusHost, nexusPort, "recipes.sendRpiTempSensor2", {
            type: "fluid.nexus.recipe",
            reactants: {
                tempSensor: {
                    match: {
                        type: "gradeMatcher",
                        gradeName: "fluid.nexus.rpiSenseHatDriver.tempSensor2"
                    }
                },
                collector: {
                    match: {
                        type: "gradeMatcher",
                        gradeName: "fluid.nexus.scienceLab.collector"
                    }
                }
            },
            product: {
                path: "sendRpiTempSensor2",
                options: {
                    type: "fluid.nexus.scienceLab.sendRpiTempSensor2"
                }
            }
        });
    }
]);
