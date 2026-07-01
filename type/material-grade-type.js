export class MaterialGradeType {
    constructor({
        name,
        elasticModulus,
        transverseElasticModulus,
        shearModulus,
        rollingShearModulus
    }) {
        this.name = name;
        this.elasticModulus = Number(elasticModulus);
        this.transverseElasticModulus =
            Number(transverseElasticModulus);
        this.shearModulus = Number(shearModulus);
        this.rollingShearModulus =
            Number(rollingShearModulus);

        this.validate();
    }

    validate() {
        if (!this.name) {
            throw new Error("Material grade name is required.");
        }

        const properties = [
            this.elasticModulus,
            this.transverseElasticModulus,
            this.shearModulus,
            this.rollingShearModulus
        ];

        if (properties.some((value) => !Number.isFinite(value) || value < 0)) {
            throw new Error(
                `Material properties for ${this.name} must be valid non-negative numbers.`
            );
        }
    }
}