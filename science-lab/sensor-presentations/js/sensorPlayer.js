(function ($, fluid) {

    "use strict";

    fluid.defaults("fluid.sensorPlayer.sensor", {
        gradeNames: ["fluid.modelComponent"],
        model: {
            sensorValue: 50,
            sensorMax: 100,
            sensorMin: 0,
            description: "A sensor"
        }
    });

    // Base sonifier definition
    fluid.defaults("fluid.sensorPlayer.sensorSonifier.base", {
        gradeNames: ["fluid.modelComponent"],
        model: {
            sensorMax: 100,
            sensorMin: 0,
            sensorValue: 50
        },
        components: {
            synth: {
                options: {
                    model: {
                        valueInformation: {
                            max: "{sensorSonifier}.model.sensorMax",
                            min: "{sensorSonifier}.model.sensorMin",
                            current: "{sensorSonifier}.model.sensorValue"
                        }
                    }
                }
            }
        }
    });

    // A sensor sonifier that uses the scaling synth
    fluid.defaults("fluid.sensorPlayer.sensorSonifier.scaling", {
        gradeNames: ["fluid.sensorPlayer.sensorSonifier.base"],
        components: {
            synth: {
                type: "fluid.sensorPlayer.scalingSynth"
            }
        }
    });

    // A pH-sensor specific sonifier
    fluid.defaults("fluid.sensorPlayer.sensorSonifier.pH", {
        gradeNames: ["fluid.sensorPlayer.sensorSonifier.base"],
        components: {
            sonifier: {
                type: "floe.scienceLab.phSonification",
                options: {
                    components: {
                        bufferLoader: {
                            options: {
                                bufferDefs: [
                                    {
                                        id: "rhodes-chord",
                                        src: "../../../../node_modules/nexus-science-lab-synths/audio/rhodes-chord-mono.mp3"
                                    }
                                ]
                            }
                        },
                        synth: {
                            type: "fluid.sensorPlayer.pHSynth",
                            options: {
                                model: {
                                    valueInformation: {
                                        max: "{sensorSonifier}.model.sensorMax",
                                        min: "{sensorSonifier}.model.sensorMin",
                                        current: "{sensorSonifier}.model.sensorValue"
                                    }
                                }
                            }
                        }
                    }
                }
            },
            synth: "{sonifier}.synth"
        }
    });

    fluid.defaults("fluid.sensorPlayer.pHSynth", {
        gradeNames: ["flock.modelSynth", "floe.scienceLab.phSynth"],
        modelRelay: [{
            target: "inputs.distortion.amount",
            singleTransform: {
                type: "fluid.sensorPlayer.transforms.polarityScale",
                input: "{that}.model.valueInformation.current",
                inputScaleMax: "{that}.model.valueInformation.max",
                inputScaleMin: "{that}.model.valueInformation.min",
                outputScaleMax: 5.0,
                outputScaleMin: 1.0
            }
        },
        {
            target: "inputs.granulator.speed",
            singleTransform: {
                type: "fluid.sensorPlayer.transforms.minMaxScale",
                input: "{that}.model.valueInformation.current",
                inputScaleMax: "{that}.model.valueInformation.max",
                inputScaleMin: "{that}.model.valueInformation.min",
                outputScaleMax: 4,
                outputScaleMin: 0.4
            }
        }]
    });

    // A model-driven synth that scales model values
    // with specified min / max to a min/max frequency range
    fluid.defaults("fluid.sensorPlayer.scalingSynth", {
        gradeNames: ["flock.modelSynth"],
        modelRelay: [{
            target: "inputs.carrier.freq",
            singleTransform: {
                type: "fluid.sensorPlayer.transforms.minMaxScale",
                input: "{that}.model.valueInformation.current",
                inputScaleMax: "{that}.model.valueInformation.max",
                inputScaleMin: "{that}.model.valueInformation.min",
                outputScaleMax: "{that}.model.freqMax",
                outputScaleMin: "{that}.model.freqMin"
            }
        },
        {
            target: "inputs.midpoint.freq",
            singleTransform: {
                type: "fluid.transforms.binaryOp",
                left: {
                    transform: {
                        type: "fluid.transforms.binaryOp",
                        left: "{that}.model.freqMax",
                        right: "{that}.model.freqMin",
                        operator: "+"
                    }
                },
                right: "2",
                operator: "/"
            }
        }
        ],
        model: {
            // In real-world usage, these will be bound
            // to models from other components
            valueInformation: {
                max: 100,
                min: 0,
                current: 50
            },
            inputs: {
                carrier: {
                    freq: 440
                }
            },
            freqMax: 680,
            freqMin: 200
        },
        synthDef: {
            ugen: "flock.ugen.out",
            sources: [
                {
                    id: "sum",
                    mul: 1,
                    ugen: "flock.ugen.sum",
                    sources: [
                        {
                        id: "carrier",
                        ugen: "flock.ugen.sin",
                        inputs: {
                            freq: 440,
                            mul: {
                                id: "mod",
                                ugen: "flock.ugen.sinOsc",
                                freq: 0.1,
                                mul: 0.25
                                }
                            }
                        },
                        {
                        id: "midpoint",
                        ugen: "flock.ugen.sin",
                        inputs: {
                            freq: 440,
                            mul: 0
                            }
                        }
                    ]
                }
            ]
        }
    });


    fluid.registerNamespace("fluid.sensorPlayer.transforms");

    fluid.defaults("fluid.sensorPlayer.transforms.minMaxScale", {
        "gradeNames": [ "fluid.standardTransformFunction", "fluid.multiInputTransformFunction" ],
        "inputVariables": {
            "inputScaleMax": 100,
            "inputScaleMin": 0,
            "outputScaleMax": 680,
            "outputScaleMin": 200
        }
    });

    fluid.sensorPlayer.transforms.clampInput = function (input, inputScaleMax, inputScaleMin) {
        if(input > inputScaleMax) {
            input = inputScaleMax;
        } else if (input < inputScaleMin) {
            input = inputScaleMin;
        }
        return input;
    };

    fluid.sensorPlayer.transforms.minMaxScale = function (input, extraInputs) {
        var inputScaleMax = extraInputs.inputScaleMax(),
            inputScaleMin = extraInputs.inputScaleMin();

        input = fluid.sensorPlayer.transforms.clampInput(input, inputScaleMax, inputScaleMin);

        var scaledValue = ((extraInputs.outputScaleMax() - extraInputs.outputScaleMin()) * (input - extraInputs.inputScaleMin()) / (extraInputs.inputScaleMax() - extraInputs.inputScaleMin())) + extraInputs.outputScaleMin();
        return scaledValue;
    };

    // Given min and max for input and output, returns a value calculated from
    // the distance of the input value from the midpoint of input min and max
    fluid.defaults("fluid.sensorPlayer.transforms.polarityScale", {
        "gradeNames": [ "fluid.standardTransformFunction", "fluid.multiInputTransformFunction" ],
        "inputVariables": {
            "inputScaleMax": 14,
            "inputScaleMin": 0,
            "outputScaleMax": 5.0,
            "outputScaleMin": 1.0
        }
    });

    fluid.sensorPlayer.transforms.polarityScale = function (input, extraInputs) {
        var inputScaleMax = extraInputs.inputScaleMax(),
            inputScaleMin = extraInputs.inputScaleMin(),
            outputScaleMax = extraInputs.outputScaleMax(),
            outputScaleMin = extraInputs.outputScaleMin();

            input = fluid.sensorPlayer.transforms.clampInput(input, inputScaleMax, inputScaleMin);

            // Get the input midpoint
            var inputMidpoint = (inputScaleMin + inputScaleMax) / 2;

            // Get max amount of variance from the midpoint
            var maxFromInputMidpoint = inputScaleMax - inputMidpoint;

            // Get the current distance from the midpoint
            var distanceFromInputMidpoint = Math.abs(input - inputMidpoint);

            // What is the percentage of the current value from the
            // midpoint, relative to max distance?
            var percentageFromInputMidpoint = distanceFromInputMidpoint / maxFromInputMidpoint * 100;

            // What is the max amount of variance in the output between min and max?
            var maxOutputVariance = outputScaleMax - outputScaleMin;

            // Return the percentage of the variance added to the min

            var returnValue = outputScaleMin + (maxOutputVariance * percentageFromInputMidpoint / 100);

            return returnValue;
    };

    fluid.defaults("fluid.sensorPlayer.valueDisplay", {
        gradeNames: ["fluid.viewComponent"],
        model: {
            value: "Hello, World!"
        },
        strings: {
            template: "<p class=\"flc-valueDisplay-value\"></p>"
        },
        selectors: {
            value: ".flc-valueDisplay-value"
        },
        listeners: {
            "onCreate.appendTemplate": {
                "this": "{that}.container",
                "method": "html",
                "args": "{that}.options.strings.template"
            },
            "onCreate.setInitialValue": {
                "this": "{that}.dom.value",
                "method": "html",
                "args": ["{that}.model.value"]
            }
        },
        modelListeners: {
            value: {
                "this": "{that}.dom.value",
                "method": "html",
                "args": ["{that}.model.value"]
            }
        }
    });

    fluid.defaults("fluid.sensorPlayer.sensorDisplayDebug", {
        gradeNames: ["fluid.viewComponent"],
        events: {
            displayTemplateReady: null
        },
        selectors: {
            sensorMaxDisplay: ".flc-sensorMaxValue",
            sensorMinDisplay: ".flc-sensorMinValue",
            sensorValueDisplay: ".flc-sensorValue",
            synthFreqDisplay: ".flc-freqValue",
            descriptionDisplay: ".flc-descriptionDisplay",
            midpointToneControl: ".flc-midpointToneControl",
            muteControl: ".flc-muteControl"
        },
        strings: {
            template: "<div class=\"flc-descriptionDisplay\"></div><div class=\"flc-sensorMaxValue\"></div><div class=\"flc-sensorMinValue\"></div><div class=\"flc-sensorValue\"></div><div class=\"flc-freqValue\"></div>"
        },
        listeners: {
            "onCreate.appendDisplayTemplate": {
                "this": "{that}.container",
                "method": "html",
                "args": "{that}.options.strings.template"
            },
            "onCreate.fireDisplayTemplateReady": {
                func: "{that}.events.displayTemplateReady.fire"
            },
            "onCreate.bindSynthControls": {
                func: "fluid.sensorPlayer.sensorDisplayDebug.bindSynthControls",
                args: ["{that}", "{sensorPlayer}"]
            }
        },
        components: {
            descriptionDisplay: {
                createOnEvent: "{sensorDisplayDebug}.events.displayTemplateReady",
                type: "fluid.sensorPlayer.valueDisplay",
                container: "{sensorDisplayDebug}.dom.descriptionDisplay",
                options: {
                    model: {
                        value: "{sensorSonifier}.model.description"
                    },
                    strings: {
                        template: "<strong>Sensor Description:</strong> <span class=\"flc-valueDisplay-value\"></span>"
                    }
                }
            },
            sensorMinDisplay: {
                createOnEvent: "{sensorDisplayDebug}.events.displayTemplateReady",
                type: "fluid.sensorPlayer.valueDisplay",
                container: "{sensorDisplayDebug}.dom.sensorMinDisplay",
                options: {
                    model: {
                        value: "{sensorSonifier}.model.sensorMin"
                    },
                    strings: {
                        template: "<strong>Sensor Min Value:</strong> <span class=\"flc-valueDisplay-value\"></span>"
                    }
                }
            },
            sensorMaxDisplay: {
                createOnEvent: "{sensorDisplayDebug}.events.displayTemplateReady",
                type: "fluid.sensorPlayer.valueDisplay",
                container: "{sensorDisplayDebug}.dom.sensorMaxDisplay",
                options: {
                    model: {
                        value: "{sensorSonifier}.model.sensorMax"
                    },
                    strings: {
                        template: "<strong>Sensor Max Value:</strong> <span class=\"flc-valueDisplay-value\"></span>"
                    }
                }
            },
            sensorDisplayDebug: {
                createOnEvent: "{sensorDisplayDebug}.events.displayTemplateReady",
                type: "fluid.sensorPlayer.valueDisplay",
                container: "{sensorDisplayDebug}.dom.sensorValueDisplay",
                options: {
                    model: {
                        value: "{sensorSonifier}.model.sensorValue"
                    },
                    strings: {
                        template: "<strong>Sensor Current Value:</strong> <span class=\"flc-valueDisplay-value\"></span>"
                    }
                }
            },
            synthFreqDisplay: {
                createOnEvent: "{sensorDisplayDebug}.events.displayTemplateReady",
                type: "fluid.sensorPlayer.valueDisplay",
                container: "{sensorDisplayDebug}.dom.synthFreqDisplay",
                options: {
                    model: {
                        value: "{scalingSynth}.model.inputs.carrier.freq"
                    },
                    strings: {
                        template: "<strong>Synthesizer frequency:</strong> <span class=\"flc-valueDisplay-value\"></span>"
                    }
                }
            }
        }
    });

    fluid.sensorPlayer.sensorDisplayDebug.bindSynthControls = function (that, sensorSonifier) {
        var muteControl = that.locate("muteControl");
        var midpointToneControl = that.locate("midpointToneControl");

        muteControl.click(function () {
            var checked = muteControl.is(":checked");
            if(checked) {
                sensorSonifier.synth.set("sum.mul", {
                    id: "fader",
                   ugen: "flock.ugen.line",
                   rate: "control",
                   start: 1,
                   end: 0,
                   duration: 1
                });
            }
            else {
                sensorSonifier.synth.set("sum.mul", {
                    id: "fader",
                   ugen: "flock.ugen.line",
                   rate: "control",
                   start: 0,
                   end: 1,
                   duration: 1
                });

            }

        });

        midpointToneControl.click(function () {
            var checked = midpointToneControl.is(":checked");
            if(checked) {
                sensorSonifier.synth.applier.change("inputs.midpoint.mul", 0.12);
            }
            else {
                sensorSonifier.synth.applier.change("inputs.midpoint.mul", 0);
            }

        });
    };

    // Base
    fluid.defaults("fluid.sensorPlayer", {
        gradeNames: ["fluid.modelComponent"],
        components: {
            sensor: {
                type: "fluid.sensorPlayer.sensor"
            },
            sensorSonifier: {
                type: "fluid.sensorPlayer.sensorSonifier.scaling",
                options: {
                    model: {
                        sensorValue: "{sensor}.model.sensorValue",
                        sensorMax: "{sensor}.model.sensorMax",
                        sensorMin: "{sensor}.model.sensorMin"
                    }
                }
            }
        }
    });

    fluid.defaults("fluid.sensorPlayer.pH", {
        gradeNames: ["fluid.sensorPlayer"],
        components: {
            sensorSonifier: {
                type: "fluid.sensorPlayer.sensorSonifier.pH"
            }
        }
    });

})(jQuery, fluid);
