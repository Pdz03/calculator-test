import test from "node:test";
import assert from "node:assert/strict";

import {
    MaterialGradeType
} from "../type/material-grade-type.js";

import {
    CLTLayerType
} from "../type/clt-layer-type.js";

import {
    AnalyticalMethod,
    CLTLayupType
} from "../type/clt-layup-type.js";

import {
    PanelProperties
} from "../calculation/panel-properties.js";

const MGP10 = new MaterialGradeType({
    name: "MGP10",
    elasticModulus: 1100,
    transverseElasticModulus: 110,
    shearModulus: 687.5,
    rollingShearModulus: 62.5
});

function createLayer(index, orientation, thickness = 35) {
    return new CLTLayerType({
        index,
        thickness,
        orientation,
        materialGrade: MGP10
    });
}

function createLayup({
    analyticalMethod,
    orientations,
    thicknesses = [],
    effectiveWidth = 1000,
    panelLength = 5
}) {
    const layers = orientations.map(
        (orientation, index) =>
            createLayer(
                index + 1,
                orientation,
                thicknesses[index] ?? 35
            )
    );

    return new CLTLayupType({
        name: "Test Layup",
        analyticalMethod,
        effectiveWidth,
        panelLength,
        layers
    });
}

function assertApproximatelyEqual(
    actual,
    expected,
    tolerance = 0.01
) {
    const difference = Math.abs(actual - expected);

    assert.ok(
        difference <= tolerance,
        `Expected ${actual} to be within ${tolerance} of ${expected}`
    );
}

test(
    "calculates five-layer Shear Analogy",
    () => {
        const layup = createLayup({
            analyticalMethod:
                AnalyticalMethod.SHEAR_ANALOGY,
            orientations: [0, 90, 0, 90, 0]
        });

        const result =
            PanelProperties.calculate(layup);

        assert.equal(result.totalThickness, 175);
        assert.equal(result.neutralAxis, 87.5);

        assertApproximatelyEqual(
            result.effectiveBendingStiffness,
            389090625000,
            0.01
        );
    }
);

test(
    "calculates five-layer Gamma Method",
    () => {
        const layup = createLayup({
            analyticalMethod:
                AnalyticalMethod.GAMMA,
            orientations: [0, 90, 0, 90, 0]
        });

        const result =
            PanelProperties.calculate(layup);

        assert.equal(result.totalThickness, 175);
        assertApproximatelyEqual(
            result.neutralAxis,
            87.5,
            0.000001
        );

        assertApproximatelyEqual(
            result.effectiveBendingStiffness,
            389087413620.713,
            0.01
        );

        assertApproximatelyEqual(
            result.layers[0].gammaCoefficient,
            result.layers[4].gammaCoefficient,
            0.000000001
        );
    }
);

test(
    "calculates three-layer Gamma Method",
    () => {
        const layup = createLayup({
            analyticalMethod:
                AnalyticalMethod.GAMMA,
            orientations: [0, 90, 0]
        });

        const result =
            PanelProperties.calculate(layup);

        assert.equal(result.totalThickness, 105);
        assertApproximatelyEqual(
            result.neutralAxis,
            52.5,
            0.000001
        );

        assertApproximatelyEqual(
            result.effectiveBendingStiffness,
            102184613821.845,
            0.01
        );
    }
);

test(
    "rejects asymmetric Shear Analogy layup",
    () => {
        const layup = createLayup({
            analyticalMethod:
                AnalyticalMethod.SHEAR_ANALOGY,
            orientations: [0, 90, 0, 90, 0],
            thicknesses: [40, 35, 35, 35, 35]
        });

        assert.throws(
            () => PanelProperties.calculate(layup),
            /symmetric layup/i
        );
    }
);

test(
    "rejects Gamma Method with four layers",
    () => {
        const layup = createLayup({
            analyticalMethod:
                AnalyticalMethod.GAMMA,
            orientations: [0, 90, 90, 0]
        });

        assert.throws(
            () => PanelProperties.calculate(layup),
            /3 or 5 layers/i
        );
    }
);

test(
    "longer panel produces a higher Gamma stiffness",
    () => {
        const shortPanel = createLayup({
            analyticalMethod:
                AnalyticalMethod.GAMMA,
            orientations: [0, 90, 0, 90, 0],
            panelLength: 1
        });

        const longPanel = createLayup({
            analyticalMethod:
                AnalyticalMethod.GAMMA,
            orientations: [0, 90, 0, 90, 0],
            panelLength: 10
        });

        const shortResult =
            PanelProperties.calculate(shortPanel);

        const longResult =
            PanelProperties.calculate(longPanel);

        assert.ok(
            longResult.effectiveBendingStiffness >
            shortResult.effectiveBendingStiffness
        );
    }
);