import { CLTLayerType } from "./clt-layer-type.js";

export const AnalyticalMethod = Object.freeze({
    SHEAR_ANALOGY: "shear-analogy",
    GAMMA: "gamma"
});

export class CLTLayupType {
    constructor({
        name = "CLT Layup",
        analyticalMethod,
        effectiveWidth,
        panelLength,
        layers
    }) {
        this.name = name;
        this.analyticalMethod = analyticalMethod;
        this.effectiveWidth = Number(effectiveWidth);
        this.panelLength = Number(panelLength);
        this.layers = layers;

        this.validateBasicData();
    }

    validateBasicData() {
        if (
            !Object.values(AnalyticalMethod).includes(
                this.analyticalMethod
            )
        ) {
            throw new Error("Analytical method is invalid.");
        }

        if (
            !Number.isFinite(this.effectiveWidth) ||
            this.effectiveWidth <= 0
        ) {
            throw new Error(
                "Effective width must be greater than zero."
            );
        }

        if (
            !Number.isFinite(this.panelLength) ||
            this.panelLength <= 0
        ) {
            throw new Error(
                "Panel length must be greater than zero."
            );
        }

        if (
            !Array.isArray(this.layers) ||
            this.layers.length === 0 ||
            this.layers.some(
                (layer) => !(layer instanceof CLTLayerType)
            )
        ) {
            throw new Error(
                "CLT layup must contain valid CLT layers."
            );
        }
    }

    getLayers() {
        return this.layers;
    }

    getLayerCount() {
        return this.layers.length;
    }

    getTotalThickness() {
        return this.layers.reduce(
            (total, layer) => total + layer.thickness,
            0
        );
    }

    getNeutralAxis() {
        return this.getTotalThickness() / 2;
    }
}