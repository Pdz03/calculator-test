export class PanelPropertiesType {
    constructor({
        analyticalMethod,
        totalThickness,
        neutralAxis,
        effectiveBendingStiffness,
        layers
    }) {
        this.analyticalMethod = analyticalMethod;
        this.totalThickness = totalThickness;
        this.neutralAxis = neutralAxis;
        this.effectiveBendingStiffness =
            effectiveBendingStiffness;
        this.layers = layers;
    }
}