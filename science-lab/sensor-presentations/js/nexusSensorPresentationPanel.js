(function () {
    "use strict";

    // An "abstract" grade for presenting sensors
    // An implementing grade needs to supply
    // appropriate dynamic components
    fluid.defaults("fluid.nexusSensorPresentationPanel", {
        gradeNames: ["gpii.nexusWebSocketBoundComponent", "fluid.viewComponent"],
        events: {
            onSensorAppearance: null,
            onSensorRemoval: null
        },
        dynamicComponentContainerOptions: {
            fadeOut: true,
            containerGlobalClass: "nexus-nexusSensorPresentationPanel-sensorDisplay",
            // fluid.stringTemplate
            containerIndividualClassTemplate: "nexus-nexusSensorPresentationPanel-sensorDisplay-%sensorId"
        },
        dynamicComponents: {
            sensorPresenter: {
                type: "@expand:fluid.nexusSensorPresentationPanel.getSensorPresenterType({that}, {arguments}.0)",
                createOnEvent: "onSensorAppearance",
                options: "@expand:fluid.nexusSensorPresentationPanel.getSensorPresenterOptions({arguments}.0, {arguments}.1, {arguments}.2)"
            }
        },
        members: {
            nexusPeerComponentPath: "scienceLabCollector",
            nexusBoundModelPath: "sensors",
            receivesChangesFromNexus: true,
            sendsChangesToNexus: false,
            // Member variable for tracking attached sensor state
            attachedSensors: {},
            attachedContainers: []
        },
        modelListeners: {
            sensors: {
                func: "{that}.updateSensorPresentations",
                args: [
                    "{that}",
                    "{change}.value"
                ]
            }
        },
        invokers: {
            updateSensorPresentations: {
                funcName: "fluid.nexusSensorPresentationPanel.updateSensorPresentations"
            }
        }
    });

    // expander function; used to generate sensor sonifiers as sensors
    // are attached; dynamically configures model characteristics and
    // container for display / controls based on the sensorId
    fluid.nexusSensorPresentationPanel.getSensorPresenterOptions = function (sensorId, sensorName, sensorPresentationPanel) {

        var sensorPresenterModelOptions = fluid.nexusSensorPresentationPanel.getSensorModelOptions(sensorId);

        var sensorPresenterContainerClass = fluid.stringTemplate(sensorPresentationPanel.options.dynamicComponentContainerOptions.containerIndividualClassTemplate, {sensorId: sensorId});

        var sensorPresenterListenerOptions = fluid.nexusSensorPresentationPanel.getSensorPresenterListenerOptions(sensorId, sensorPresenterContainerClass, sensorName);

        return sensorPresentationPanel.generatePresenterOptionsBlock (sensorPresenterModelOptions, sensorPresenterListenerOptions, sensorPresenterContainerClass);
    };

    // Allows specific grades for specific sensors
    // See visualization or sonification panels for implementation structure
    fluid.nexusSensorPresentationPanel.getSensorPresenterType = function (that, sensorId) {
        var perSensorPresentationGrades = that.options.perSensorPresentationGrades;
        if(perSensorPresentationGrades[sensorId]) {
            return perSensorPresentationGrades[sensorId];
        } else {
            return that.options.defaultSensorPresentationGrade;
        }
    };

    // Add / remove function for sensor changes. Handles the following:
    // 1) Fires an event when a sensor is added, argument is the sensor ID
    // 2) Fires an aggregrate event when sensors are removed, argument is
    // an array of sensor IDs
    fluid.nexusSensorPresentationPanel.updateSensorPresentations = function (that, sensors) {

        var sensorsArray = fluid.hashToArray(
            sensors,
            "sensorId"
        );

        // Add loop for new sensors
        fluid.each(sensorsArray, function (sensor) {
            var sensorId = sensor.sensorId,
                sensorName = sensor.name;
            if(! that.attachedSensors[sensorId]) {
                that.events.onSensorAppearance.fire(sensorId, sensorName, that);
                that.attachedSensors[sensorId] = true;
            }
        });

        // Track removed sensor IDs here
        var removedSensorIds = [];

        // Remove loop for any removed sensors
        fluid.each(that.attachedSensors, function (attachedSensor, attachedSensorId) {
            if (! sensors[attachedSensorId]) {
                removedSensorIds.push(attachedSensorId);
                delete that.attachedSensors[attachedSensorId];
            }
        });
        if(removedSensorIds.length > 0) {
            that.events.onSensorRemoval.fire(removedSensorIds);
        }
    };

    // Generates common model relay options to let a presenter be
    // synchronized with a particular sensor model path
    fluid.nexusSensorPresentationPanel.getSensorModelOptions = function (sensorId) {
        var sensorModelOptions = {
            sensorId: sensorId,
            description: "{nexusSensorPresentationPanel}.model.sensors." + sensorId + ".name",
            simulateChanges: false,
            sensorValue: "{nexusSensorPresentationPanel}.model.sensors." + sensorId + ".value",
            sensorMax: "{nexusSensorPresentationPanel}.model.sensors." + sensorId + ".rangeMax",
            sensorMin: "{nexusSensorPresentationPanel}.model.sensors." + sensorId + ".rangeMin"
        };

        return sensorModelOptions;
    };

    // Generates common listener options for sensor presenters to handle
    // their dynamicComponent lifecycle,
    // specifically:
    // onCreate.appendSensorDisplayContainer:
    // appends sensor-specific container markup so that a
    // new sensor has somewhere to create any viewComponents
    //
    // onCreate.fireOnSensorDisplayContainerAppended:
    // notifies that the display container is appended;
    // viewComponents associated with the sensor can use this
    // for their createOnEvent
    //
    // {nexusSensorPresentationPanel}.events.onSensorRemoval:
    // Adds a listener that lets a sensor presentor check if it should
    // be removed when the onSensorRemoval event is fired by
    // the presentation panel
    //
    // onDestroy.removeSensorDisplayContainer
    // Calls a function of the nexusSensorPresentation panel
    // to let it clean up the container after the associated
    // presenter has been destroyed
    fluid.nexusSensorPresentationPanel.getSensorPresenterListenerOptions = function (sensorId, sensorContainerClass, sensorName) {
        var sensorListenerOptions = {
           "onCreate.appendSensorDisplayContainer": {
               funcName: "fluid.nexusSensorPresentationPanel.addSensorDisplayContainer",
               args: ["{nexusSensorPresentationPanel}", sensorContainerClass, sensorName]
           },
           "onCreate.fireOnSensorDisplayContainerAppended": {
               funcName: "{that}.events.onSensorDisplayContainerAppended.fire",
               priority: "after:appendSensorDisplayContainer"
           },
           "{nexusSensorPresentationPanel}.events.onSensorRemoval": {
              funcName: "fluid.nexusSensorPresentationPanel.checkForRemoval",
              args: ["{that}", "{that}.sensor", "{arguments}.0"],
              namespace: "removeSensorPresenter-"+sensorId
          },
           "onDestroy.removeSensorDisplayContainer": {
               funcName: "fluid.nexusSensorPresentationPanel.removeSensorDisplayContainer",
               args: ["{nexusSensorPresentationPanel}", sensorContainerClass]
           }
        };

        return sensorListenerOptions;
    };


    // Adds sensor display containers in alphabetical order by
    // sensor name
    fluid.nexusSensorPresentationPanel.addSensorDisplayContainer = function (nexusSensorPresentationPanel, sensorContainerClass, sensorName) {
        var attachedContainers = nexusSensorPresentationPanel.attachedContainers;

        attachedContainers.push ({"sensorName": sensorName, "containerClass": sensorContainerClass});

        // A-Z sort on sensor name
        var compare = function (containerInfoA, containerInfoB) {
            return containerInfoA.sensorName.localeCompare(containerInfoB.sensorName);
        };

        attachedContainers.sort(compare);

        var attachedContainerIndex = attachedContainers.findIndex(function (container) {
            return container.sensorName === sensorName;
        });

        var containerClasses = nexusSensorPresentationPanel.options.dynamicComponentContainerOptions.containerGlobalClass + " " + sensorContainerClass;

        var containerMarkup = fluid.stringTemplate("<div class='%containerClasses'></div>", {containerClasses: containerClasses});

        // Prepend if 0 (right at start)
        if(attachedContainerIndex === 0) {
            nexusSensorPresentationPanel.container.prepend(containerMarkup);
        // Append after previous container that already exists
        } else {
            var previousSiblingContainer = nexusSensorPresentationPanel.container.find("." + attachedContainers[attachedContainerIndex-1].containerClass);
            previousSiblingContainer.after(containerMarkup);
        }
    };

    // Function used by the nexusSensorPresentationPanel to remove
    // dynamically generated container markup when a sensor is
    // removed
    fluid.nexusSensorPresentationPanel.removeSensorDisplayContainer = function (nexusSensorPresentationPanel, sensorContainerClass) {

        // Remove from the attached containers index
        var attachedContainers = nexusSensorPresentationPanel.attachedContainers;
        fluid.remove_if(attachedContainers, function (containerInfo) {
            return containerInfo.containerClass === sensorContainerClass;
        });

        var removedSensorContainer = nexusSensorPresentationPanel.container.find("." + sensorContainerClass);

        var fadeOut = nexusSensorPresentationPanel.options.dynamicComponentContainerOptions.fadeOut;

        if(fadeOut) {
            removedSensorContainer.fadeOut(function() {
                removedSensorContainer.remove();
            });
        } else {
            removedSensorContainer.remove();
        }
    };

    // Function used by a sensorPresenter to check the array of
    // removed sensor IDs and invoke its own destroy function
    // if it matches a removed sensor ID
    fluid.nexusSensorPresentationPanel.checkForRemoval = function (sensorPresenter, sensor, removedSensorIds) {
        if(fluid.contains(removedSensorIds,fluid.get(sensor.model, "sensorId"))) {
            sensorPresenter.destroy();
        }
    };

    // Mix-in grade for viewComponents - start hidden, then fade in
    fluid.defaults("fluid.nexusSensorPresentationPanel.fadeInPresenter", {
        listeners: {
            // Start hidden
            "onCreate.hideContainer": {
                "this": "{that}.container",
                "method": "hide",
                "args": [0]
            },
            // Fade in
            "onCreate.fadeInContainer": {
                "this": "{that}.container",
                "method": "fadeIn"
            }
        }
    });

}());
