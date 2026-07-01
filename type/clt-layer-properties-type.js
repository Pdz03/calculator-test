export class CLTLayerPropertiesType {
    constructor({
        layerIndex,
        thickness,
        orientation,
        centroid,
        distanceToNeutralAxis,
        elasticModulus,
        localMomentOfInertia,
        parallelAxisTerm,
        gammaCoefficient = null,
        bendingStiffness
    }) {
        this.layerIndex = layerIndex;
        this.thickness = thickness;
        this.orientation = orientation;
        this.centroid = centroid;
        this.distanceToNeutralAxis =
            distanceToNeutralAxis;
        this.elasticModulus = elasticModulus;
        this.localMomentOfInertia =
            localMomentOfInertia;
        this.parallelAxisTerm =
            parallelAxisTerm;
        this.gammaCoefficient = gammaCoefficient;
        this.bendingStiffness = bendingStiffness;
    }
}