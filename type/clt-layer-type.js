import { MaterialGradeType } from "./material-grade-type.js";

export class CLTLayerType {
    constructor({
        index,
        thickness,
        orientation,
        materialGrade
    }) {
        this.index = Number(index);
        this.thickness = Number(thickness);
        this.orientation = Number(orientation);
        this.materialGrade = materialGrade;

        this.validate();
    }

    validate() {
        if (!Number.isInteger(this.index) || this.index < 1) {
            throw new Error("Layer index must be a positive integer.");
        }

        if (!Number.isFinite(this.thickness) || this.thickness <= 0) {
            throw new Error(
                `Thickness for layer ${this.index} must be greater than zero.`
            );
        }

        if (![0, 90].includes(this.orientation)) {
            throw new Error(
                `Orientation for layer ${this.index} must be 0° or 90°.`
            );
        }

        if (!(this.materialGrade instanceof MaterialGradeType)) {
            throw new Error(
                `Layer ${this.index} must have a valid material grade.`
            );
        }
    }

    getElasticModulusForBending() {
        return this.orientation === 0
            ? this.materialGrade.elasticModulus
            : 0;
    }

    getShearModulus() {
        return this.orientation === 0
            ? this.materialGrade.shearModulus
            : this.materialGrade.rollingShearModulus;
    }

    isEquivalentTo(otherLayer) {
        return (
            otherLayer instanceof CLTLayerType &&
            this.thickness === otherLayer.thickness &&
            this.orientation === otherLayer.orientation &&
            this.materialGrade.name === otherLayer.materialGrade.name
        );
    }
}