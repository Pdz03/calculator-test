/**
 * Class Panel Properties is used to calculate the properties of panel CLT Layup.
 * Panel properties can calculate
 *  - Shear Analogy Method
 *  - Gamma Method
 * 
 * How to use : 
 * calculate(CLTLayup) => PanelProperties
 */

// Base class for panel properties
import {
    AnalyticalMethod
} from "../type/clt-layup-type.js";

import {
    PanelPropertiesType
} from "../type/panel-properties-type.js";

import {
    CLTLayerPropertiesType
} from "../type/clt-layer-properties-type.js";

export class PanelProperties {
    static calculate(cltLayup) {
        LayupValidator.validate(cltLayup);

        if (
            cltLayup.analyticalMethod ===
            AnalyticalMethod.SHEAR_ANALOGY
        ) {
            return ShearAnalogyMethod.calculate(cltLayup);
        }

        if (
            cltLayup.analyticalMethod ===
            AnalyticalMethod.GAMMA
        ) {
            return GammaMethod.calculate(cltLayup);
        }

        throw new Error("Unsupported analytical method.");
    }
}

class LayupValidator {
    static validate(cltLayup) {
        const layerCount = cltLayup.getLayerCount();

        if (
            cltLayup.analyticalMethod ===
            AnalyticalMethod.SHEAR_ANALOGY
        ) {
            if (layerCount < 3 || layerCount > 9) {
                throw new Error(
                    "Shear Analogy only supports 3 to 9 layers."
                );
            }

            this.validateSymmetry(cltLayup.getLayers());
            return;
        }

        if (
            cltLayup.analyticalMethod ===
            AnalyticalMethod.GAMMA &&
            ![3, 5].includes(layerCount)
        ) {
            throw new Error(
                "Gamma Method only supports 3 or 5 layers."
            );
        }
    }

    static validateSymmetry(layers) {
        const pairCount = Math.floor(layers.length / 2);

        for (
            let index = 0;
            index < pairCount;
            index += 1
        ) {
            const topLayer = layers[index];
            const bottomLayer =
                layers[layers.length - 1 - index];

            if (!topLayer.isEquivalentTo(bottomLayer)) {
                throw new Error(
                    `Shear Analogy requires a symmetric layup. ` +
                    `Layer ${topLayer.index} must match ` +
                    `layer ${bottomLayer.index}.`
                );
            }
        }
    }
}

class ShearAnalogyMethod {
    static calculate(cltLayup) {
        const layers = cltLayup.getLayers();
        const effectiveWidth =
            cltLayup.effectiveWidth;
        const neutralAxis =
            cltLayup.getNeutralAxis();

        let currentPosition = 0;
        let effectiveBendingStiffness = 0;

        const layerProperties = layers.map((layer) => {
            const centroid =
                currentPosition + layer.thickness / 2;

            currentPosition += layer.thickness;

            const distanceToNeutralAxis =
                Math.abs(centroid - neutralAxis);

            const elasticModulus =
                layer.getElasticModulusForBending();

            const localMomentOfInertia =
                effectiveWidth *
                Math.pow(layer.thickness, 3) /
                12;

            const parallelAxisTerm =
                effectiveWidth *
                layer.thickness *
                Math.pow(distanceToNeutralAxis, 2);

            const bendingStiffness =
                (
                    localMomentOfInertia +
                    parallelAxisTerm
                ) *
                elasticModulus;

            effectiveBendingStiffness +=
                bendingStiffness;

            return new CLTLayerPropertiesType({
                layerIndex: layer.index,
                thickness: layer.thickness,
                orientation: layer.orientation,
                centroid,
                distanceToNeutralAxis,
                elasticModulus,
                localMomentOfInertia,
                parallelAxisTerm,
                bendingStiffness
            });
        });

        return new PanelPropertiesType({
            analyticalMethod:
                AnalyticalMethod.SHEAR_ANALOGY,
            totalThickness:
                cltLayup.getTotalThickness(),
            neutralAxis,
            effectiveBendingStiffness,
            layers: layerProperties
        });
    }
}

class GammaMethod {
    static calculate(cltLayup) {
        const layers = cltLayup.getLayers();
        const effectiveWidth = cltLayup.effectiveWidth;
        const panelLengthMm = cltLayup.panelLength * 1000;

        const totalThickness =
            cltLayup.getTotalThickness();

        let currentPosition = 0;

        const geometricLayers = layers.map(
            (layer, index) => {
                const centroid =
                    currentPosition +
                    layer.thickness / 2;

                currentPosition += layer.thickness;

                return {
                    index,
                    layer,
                    centroid,
                    gammaCoefficient: 0
                };
            }
        );

        /*
         * Gamma Method is only applied to longitudinal
         * layers. Cross layers have E = 0 for bending
         * in the panel span direction.
         */
        geometricLayers.forEach((entry) => {
            if (entry.layer.orientation !== 0) {
                entry.gammaCoefficient = 0;
                return;
            }

            entry.gammaCoefficient =
                this.calculateGammaCoefficient({
                    layers,
                    layerIndex: entry.index,
                    panelLengthMm,
                    effectiveWidth
                });
        });

        /*
         * Gamma weighted neutral axis:
         *
         * ybar =
         * Σ(γi × Ei × Ai × yi)
         * -------------------
         * Σ(γi × Ei × Ai)
         */
        const weightedStiffness =
            geometricLayers.reduce(
                (total, entry) => {
                    const elasticModulus =
                        entry.layer
                            .getElasticModulusForBending();

                    const area =
                        effectiveWidth *
                        entry.layer.thickness;

                    return (
                        total +
                        entry.gammaCoefficient *
                            elasticModulus *
                            area
                    );
                },
                0
            );

        if (weightedStiffness <= 0) {
            throw new Error(
                "Unable to determine Gamma neutral axis."
            );
        }

        const weightedFirstMoment =
            geometricLayers.reduce(
                (total, entry) => {
                    const elasticModulus =
                        entry.layer
                            .getElasticModulusForBending();

                    const area =
                        effectiveWidth *
                        entry.layer.thickness;

                    return (
                        total +
                        entry.gammaCoefficient *
                            elasticModulus *
                            area *
                            entry.centroid
                    );
                },
                0
            );

        const neutralAxis =
            weightedFirstMoment /
            weightedStiffness;

        let effectiveBendingStiffness = 0;

        const layerProperties =
            geometricLayers.map((entry) => {
                const {
                    layer,
                    centroid,
                    gammaCoefficient
                } = entry;

                const elasticModulus =
                    layer.getElasticModulusForBending();

                const distanceToNeutralAxis =
                    Math.abs(centroid - neutralAxis);

                const localMomentOfInertia =
                    effectiveWidth *
                    Math.pow(layer.thickness, 3) /
                    12;

                const parallelAxisTerm =
                    effectiveWidth *
                    layer.thickness *
                    Math.pow(
                        distanceToNeutralAxis,
                        2
                    );

                const bendingStiffness =
                    elasticModulus *
                    (
                        localMomentOfInertia +
                        gammaCoefficient *
                            parallelAxisTerm
                    );

                effectiveBendingStiffness +=
                    bendingStiffness;

                return new CLTLayerPropertiesType({
                    layerIndex: layer.index,
                    thickness: layer.thickness,
                    orientation: layer.orientation,
                    centroid,
                    distanceToNeutralAxis,
                    elasticModulus,
                    localMomentOfInertia,
                    parallelAxisTerm,
                    gammaCoefficient,
                    bendingStiffness
                });
            });

        return new PanelPropertiesType({
            analyticalMethod:
                AnalyticalMethod.GAMMA,
            totalThickness,
            neutralAxis,
            effectiveBendingStiffness,
            layers: layerProperties
        });
    }

    static calculateGammaCoefficient({
        layers,
        layerIndex,
        panelLengthMm,
        effectiveWidth
    }) {
        const layer = layers[layerIndex];

        if (layer.orientation !== 0) {
            return 0;
        }

        /*
         * The middle longitudinal layer is treated
         * as fully composite.
         */
        const middleIndex =
            Math.floor(layers.length / 2);

        if (layerIndex === middleIndex) {
            return 1;
        }

        /*
         * Find the cross layer adjacent to the
         * longitudinal layer.
         */
        const adjacentIndex =
            layerIndex < middleIndex
                ? layerIndex + 1
                : layerIndex - 1;

        const crossLayer =
            layers[adjacentIndex];

        if (
            !crossLayer ||
            crossLayer.orientation !== 90
        ) {
            throw new Error(
                `Layer ${layer.index} must be adjacent ` +
                "to a cross layer for Gamma calculation."
            );
        }

        const elasticModulus =
            layer.getElasticModulusForBending();

        const rollingShearModulus =
            crossLayer.materialGrade
                .rollingShearModulus;

        if (
            elasticModulus <= 0 ||
            rollingShearModulus <= 0
        ) {
            throw new Error(
                "Material stiffness must be greater than zero."
            );
        }

        /*
         * Formula translated from the workbook:
         *
         * γ = 1 /
         *     (
         *       1 +
         *       π² E t /
         *       ((beff / tcross) GR L²)
         *     )
         */
        const denominator =
            (
                effectiveWidth /
                crossLayer.thickness
            ) *
            rollingShearModulus *
            Math.pow(panelLengthMm, 2);

        return (
            1 /
            (
                1 +
                Math.pow(Math.PI, 2) *
                    elasticModulus *
                    layer.thickness /
                    denominator
            )
        );
    }
}

