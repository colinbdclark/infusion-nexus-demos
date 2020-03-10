(function () {
    "use strict";

    // A mock nexus web socket bound component that doesn't
    // actually connect to the Nexus, but has the same
    // behaviours from the PoV of a grade using it
    //
    // Having the Nexus "send" a change is a matter of updating the
    // appropriate model path intended to be attached via the
    // nexusBoundModelPath member

    fluid.defaults("gpii.nexusWebSocketBoundComponentMock", {
        gradeNames: ["gpii.nexusWebSocketBoundComponent"],
        listeners: {
            "onCreate.constructPeer": {
                funcName: "{that}.events.onPeerConstructed.fire"
            },
            "onPeerConstructed.bindNexusModel": {
                funcName: "gpii.nexusWebSocketBoundComponentMock.bindModel",
                args: [
                    "{that}",
                    "{that}.receivesChangesFromNexus",
                    "{that}.nexusMessageListener",
                    "{that}.events.onWebsocketConnected"
                ]
            },
            "onWebsocketConnected.registerModelListenerForNexus": {
                funcName: "gpii.nexusWebSocketBoundComponentMock.registerModelListener",
                args: [
                    "{that}.sendsChangesToNexus",
                    "{that}.applier",
                    "{that}.nexusBoundModelPath",
                    "{that}.sendModelChangeToNexus"
                ]
            }
        }
    }
);

gpii.nexusWebSocketBoundComponentMock.bindModel = function () {
    return;
};

gpii.nexusWebSocketBoundComponentMock.registerModelListener = function () {
    return;
};

    fluid.defaults("fluid.nexusSensorPresentationPanelMock", {
        gradeNames: ["fluid.nexusSensorPresentationPanel", "gpii.nexusWebSocketBoundComponentMock", "fluid.viewComponent"],
        // Eases testing, since we don't have to pause to wait for
        // the fade-out animation before testing that the container
        // is removed
        dynamicComponentContainerOptions: {
            fadeOut: false
        }
    });

    fluid.defaults("fluid.nexusSensorVisualizationPanelMock", {
        gradeNames: ["fluid.nexusSensorVisualizationPanel", "fluid.nexusSensorPresentationPanelMock"],
        dynamicComponentContainerOptions: {
            // fluid.stringTemplate
            containerIndividualClassTemplate: "nexus-nexusSensorVisualizationPanel-sensorDisplay-%sensorId"
        }
    });

    fluid.defaults("fluid.nexusSensorSonificationPanelMock", {
        gradeNames: ["fluid.nexusSensorSonificationPanel", "fluid.nexusSensorPresentationPanelMock"],
        dynamicComponentContainerOptions: {
            // fluid.stringTemplate
            containerIndividualClassTemplate: "nexus-nexusSensorSonificationPanel-sensorDisplay-%sensorId"
        }
    });

}());
