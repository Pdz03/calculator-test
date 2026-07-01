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
        const effectiveWidth =
            cltLayup.effectiveWidth;
        const panelLengthMm =
            cltLayup.panelLength * 1000;

        const totalThickness =
            cltLayup.getTotalThickness();

        const neutralAxis =
            totalThickness / 2;

        let currentPosition = 0;

        const geometricLayers = layers.map((layer) => {
            const centroid =
                currentPosition + layer.thickness / 2;

            currentPosition += layer.thickness;

            return {
                layer,
                centroid,
                distance:
                    Math.abs(centroid - neutralAxis)
            };
        });

        const longitudinalIndexes =
            geometricLayers
                .map((entry, index) => ({
                    ...entry,
                    index
                }))
                .filter(
                    ({ layer }) =>
                        layer.orientation === 0
                );

        const layerProperties =
            geometricLayers.map(
                ({ layer, centroid, distance }, index) => {
                    const elasticModulus =
                        layer.getElasticModulusForBending();

                    const localMomentOfInertia =
                        effectiveWidth *
                        Math.pow(layer.thickness, 3) /
                        12;

                    const parallelAxisTerm =
                        effectiveWidth *
                        layer.thickness *
                        Math.pow(distance, 2);

                    let gammaCoefficient = 0;

                    if (layer.orientation === 0) {
                        gammaCoefficient =
                            this.calculateGammaCoefficient({
                                layers,
                                layerIndex: index,
                                elasticModulus,
                                panelLengthMm,
                                effectiveWidth
                            });
                    }

                    const bendingStiffness =
                        elasticModulus *
                        (
                            localMomentOfInertia +
                            gammaCoefficient *
                            parallelAxisTerm
                        );

                    return new CLTLayerPropertiesType({
                        layerIndex: layer.index,
                        thickness: layer.thickness,
                        orientation: layer.orientation,
                        centroid,
                        distanceToNeutralAxis: distance,
                        elasticModulus,
                        localMomentOfInertia,
                        parallelAxisTerm,
                        gammaCoefficient,
                        bendingStiffness
                    });
                }
            );

        const effectiveBendingStiffness =
            layerProperties.reduce(
                (total, layer) =>
                    total + layer.bendingStiffness,
                0
            );

        return new PanelPropertiesType({
            analyticalMethod: AnalyticalMethod.GAMMA,
            totalThickness,
            neutralAxis,
            effectiveBendingStiffness,
            layers: layerProperties
        });
    }

    static calculateGammaCoefficient({
        layers,
        layerIndex,
        elasticModulus,
        panelLengthMm,
        effectiveWidth
    }) {
        const adjacentCrossLayers = [];

        if (
            layerIndex > 0 &&
            layers[layerIndex - 1].orientation === 90
        ) {
            adjacentCrossLayers.push(
                layers[layerIndex - 1]
            );
        }

        if (
            layerIndex < layers.length - 1 &&
            layers[layerIndex + 1].orientation === 90
        ) {
            adjacentCrossLayers.push(
                layers[layerIndex + 1]
            );
        }

        if (adjacentCrossLayers.length === 0) {
            return 1;
        }

        const connectionFlexibility =
            adjacentCrossLayers.reduce(
                (total, crossLayer) => {
                    const rollingShearModulus =
                        crossLayer.materialGrade
                            .rollingShearModulus;

                    if (rollingShearModulus <= 0) {
                        return total;
                    }

                    return (
                        total +
                        crossLayer.thickness /
                            (
                                rollingShearModulus *
                                effectiveWidth
                            )
                    );
                },
                0
            );

        if (
            connectionFlexibility <= 0 ||
            elasticModulus <= 0
        ) {
            return 1;
        }

        const longitudinalLayer =
            layers[layerIndex];

        const axialStiffness =
            elasticModulus *
            effectiveWidth *
            longitudinalLayer.thickness;

        return (
            1 /
            (
                1 +
                Math.pow(Math.PI, 2) *
                    axialStiffness *
                    connectionFlexibility /
                    Math.pow(panelLengthMm, 2)
            )
        );
    }
}

