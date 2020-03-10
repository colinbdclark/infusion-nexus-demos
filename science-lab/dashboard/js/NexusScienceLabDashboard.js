(function () {
    "use strict";

    // TODO: Add ARIA live region markup?

    fluid.defaults("fluid.nexusScienceLabDashboard", {
        gradeNames: ["gpii.nexusWebSocketBoundComponent", "fluid.viewComponent"],
        numberLocale: "en",
        maximumFractionDigits: 2,
        members: {
            nexusPeerComponentPath: "scienceLabCollector",
            nexusBoundModelPath: "sensors",
            receivesChangesFromNexus: true,
            sendsChangesToNexus: false
        },
        strings: {
            noSensorsConnected: "No sensors connected"
        },
        markup: {
            noSensorsConnected: "<p class='flc-nexus-science-lab-dashboard-message'>%message</p>",
            sensor: "<div><h2>%sensorHeading</h2><p class='fl-nexus-science-lab-dashboard-value'>%sensorValue</p></div>"
        },
        selectors: {
            message: ".flc-nexus-science-lab-dashboard-message",
            sensor: "div",
            sensorHeading: "h2",
            sensorValue: "p"
        },
        modelListeners: {
            sensors: {
                funcName: "fluid.nexusScienceLabDashboard.updateDashboard",
                args: ["{that}", "{change}.value"]
            }
        }
    });

    fluid.nexusScienceLabDashboard.updateDashboard = function (that, sensors) {

        var sensorsArray = fluid.hashToArray(sensors, "sensor");

        if (sensorsArray.length === 0) {
            that.container.html(fluid.stringTemplate(
                that.options.markup.noSensorsConnected,
                {
                    message: that.options.strings.noSensorsConnected
                }
            ));
        } else {
            $(that.container.find(that.options.selectors.message)).remove();

            fluid.stableSort(sensorsArray, function (a, b) {
                return a.name.localeCompare(b.name);
            });

            fluid.nexusScienceLabDashboard.updateDashboardValues(
                that,
                sensorsArray
            );
        }
    };

    fluid.nexusScienceLabDashboard.updateDashboardValues = function (that, sortedSensors) {

        var sensorsArrayIndex = 0;

        that.container.find(that.options.selectors.sensor).each(function (index, sensorElem) {
            if (sensorsArrayIndex < sortedSensors.length) {
                // We have incoming sensor data yet to process

                var sensorOnPage = $($(sensorElem).find(that.options.selectors.sensorHeading)).text();

                // Insert any new sensors
                while (sensorOnPage.localeCompare(fluid.nexusScienceLabDashboard.buildSensorHeading(sortedSensors[sensorsArrayIndex])) === 1) {
                    $(sensorElem).before(fluid.nexusScienceLabDashboard.buildSensorMarkup(
                        that.options.markup.sensor,
                        sortedSensors[sensorsArrayIndex],
                        that.options.numberLocale,
                        that.options.maximumFractionDigits
                    ));
                    ++sensorsArrayIndex;
                }

                switch (sensorOnPage.localeCompare(fluid.nexusScienceLabDashboard.buildSensorHeading(sortedSensors[sensorsArrayIndex]))) {
                    case 0:
                        // Existing value, update it
                        var newValue = fluid.nexusScienceLabDashboard.buildSensorValue(
                            sortedSensors[sensorsArrayIndex],
                            that.options.numberLocale,
                            that.options.maximumFractionDigits
                        );
                        $($(sensorElem).find(that.options.selectors.sensorValue)).text(newValue);
                        ++sensorsArrayIndex;
                        break;
                    case -1:
                        // Outdated sensor, remove it
                        $(sensorElem).remove();
                        break;
                }
            } else {
                // We have reached the end of the incoming sensor data,
                // remove any remaining outdated values from the page
                $(sensorElem).remove();
            }
        });

        // Add any remaining new sensors from the incoming data
        while (sensorsArrayIndex < sortedSensors.length) {
            that.container.append(fluid.nexusScienceLabDashboard.buildSensorMarkup(
                that.options.markup.sensor,
                sortedSensors[sensorsArrayIndex],
                that.options.numberLocale,
                that.options.maximumFractionDigits
            ));
            ++sensorsArrayIndex;
        }
    };

    fluid.nexusScienceLabDashboard.buildSensorMarkup = function (markup, sensorData, numberLocale, maximumFractionDigits) {
        return fluid.stringTemplate(markup,
            {
                sensorHeading: fluid.nexusScienceLabDashboard.buildSensorHeading(sensorData),
                sensorValue: fluid.nexusScienceLabDashboard.buildSensorValue(
                    sensorData,
                    numberLocale,
                    maximumFractionDigits
                )
            }
        );
    };

    fluid.nexusScienceLabDashboard.buildSensorHeading = function (sensorData) {
        if (sensorData.units) {
            return fluid.stringTemplate("%sensorName (%units)", {
                sensorName: sensorData.name,
                units: sensorData.units
            });
        } else {
            return sensorData.name;
        }
    };

    fluid.nexusScienceLabDashboard.buildSensorValue = function (sensorData, numberLocale, maximumFractionDigits) {
        return sensorData.value.toLocaleString(numberLocale, {
            maximumFractionDigits: maximumFractionDigits
        });
    };

}());
