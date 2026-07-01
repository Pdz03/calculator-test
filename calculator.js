/**
 * This class to organize the input data for panel calculation
 * To Render the input data, you can use the following code:
 * 
 * const panelProperties = new PanelProperties();
 */

import {
    MaterialGradeType
} from "./type/material-grade-type.js";

import {
    CLTLayerType
} from "./type/clt-layer-type.js";

import {
    AnalyticalMethod,
    CLTLayupType
} from "./type/clt-layup-type.js";

import {
    PanelProperties
} from "./calculation/panel-properties.js";

const materialGrades = {
    MGP10: new MaterialGradeType({
        name: "MGP10",
        elasticModulus: 1100,
        transverseElasticModulus: 110,
        shearModulus: 687.5,
        rollingShearModulus: 62.5
    }),

    MGP12: new MaterialGradeType({
        name: "MGP12",
        elasticModulus: 1100,
        transverseElasticModulus: 110,
        shearModulus: 687.5,
        rollingShearModulus: 62.5
    })
};

const form =
    document.querySelector("#calculator-form");

const analyticalMethodInput =
    document.querySelector("#analytical-method");

const layerCountInput =
    document.querySelector("#layer-count");

const effectiveWidthInput =
    document.querySelector("#effective-width");

const panelLengthInput =
    document.querySelector("#panel-length");

const layersContainer =
    document.querySelector("#layers-container");

const errorAlert =
    document.querySelector("#error-alert");

const outputSection =
    document.querySelector("#output-section");

const resultSummary =
    document.querySelector("#result-summary");

const resultTableBody =
    document.querySelector("#result-table-body");

analyticalMethodInput.addEventListener(
    "change",
    handleMethodChange
);

layerCountInput.addEventListener(
    "change",
    renderLayerInputs
);

form.addEventListener("submit", handleSubmit);

initialize();

function initialize() {
    updateLayerCountOptions();
    renderLayerInputs();
}

function handleMethodChange() {
    updateLayerCountOptions();
    renderLayerInputs();
    hideOutput();
    hideError();
}

function updateLayerCountOptions() {
    const method = analyticalMethodInput.value;

    const allowedCounts =
        method === AnalyticalMethod.GAMMA
            ? [3, 5]
            : [3, 4, 5, 6, 7, 8, 9];

    layerCountInput.innerHTML =
        allowedCounts
            .map(
                (count) =>
                    `<option value="${count}" ${
                        count === 5 ? "selected" : ""
                    }>${count}</option>`
            )
            .join("");
}

function renderLayerInputs() {
    const layerCount =
        Number(layerCountInput.value);

    layersContainer.innerHTML = "";

    for (
        let layerIndex = 1;
        layerIndex <= layerCount;
        layerIndex += 1
    ) {
        const mirroredPosition = Math.min(
    layerIndex,
    layerCount - layerIndex + 1
);

const defaultOrientation =
    mirroredPosition % 2 === 1 ? 0 : 90;

        const column =
            document.createElement("div");

        column.className =
            "col-md-6 col-xl-4";

        column.innerHTML = `
            <div class="layer-card" data-layer-index="${layerIndex}">
                <h4 class="h6 mb-3">
                    Layer ${layerIndex}
                </h4>

                <div class="mb-3">
                    <label class="form-label">
                        Thickness
                    </label>

                    <div class="input-group">
                        <input
                            type="number"
                            class="form-control layer-thickness"
                            value="35"
                            min="1"
                            step="0.1"
                            required
                        >

                        <span class="input-group-text">
                            mm
                        </span>
                    </div>
                </div>

                <div class="mb-3">
                    <label class="form-label">
                        Orientation
                    </label>

                    <select
                        class="form-select layer-orientation"
                    >
                        <option
                            value="0"
                            ${
                                defaultOrientation === 0
                                    ? "selected"
                                    : ""
                            }
                        >
                            0°
                        </option>

                        <option
                            value="90"
                            ${
                                defaultOrientation === 90
                                    ? "selected"
                                    : ""
                            }
                        >
                            90°
                        </option>
                    </select>
                </div>

                <div>
                    <label class="form-label">
                        Material Grade
                    </label>

                    <select
                        class="form-select layer-grade"
                    >
                        <option value="MGP10">
                            MGP10
                        </option>

                        <option value="MGP12">
                            MGP12
                        </option>
                    </select>
                </div>
            </div>
        `;

        layersContainer.appendChild(column);
    }
}

function handleSubmit(event) {
    event.preventDefault();

    hideError();

    try {
        const layup = buildLayupFromForm();

        const properties =
            PanelProperties.calculate(layup);

        renderResult(properties);
    } catch (error) {
        showError(
            error instanceof Error
                ? error.message
                : "An unexpected calculation error occurred."
        );
    }
}

function buildLayupFromForm() {
    const layerCards =
        document.querySelectorAll("[data-layer-index]");

    const layers =
        Array.from(layerCards).map((card) => {
            const index =
                Number(card.dataset.layerIndex);

            const thickness =
                card.querySelector(
                    ".layer-thickness"
                ).value;

            const orientation =
                card.querySelector(
                    ".layer-orientation"
                ).value;

            const gradeName =
                card.querySelector(
                    ".layer-grade"
                ).value;

            return new CLTLayerType({
                index,
                thickness,
                orientation,
                materialGrade:
                    materialGrades[gradeName]
            });
        });

    return new CLTLayupType({
        name: "Floor Panel",
        analyticalMethod:
            analyticalMethodInput.value,
        effectiveWidth:
            effectiveWidthInput.value,
        panelLength:
            panelLengthInput.value,
        layers
    });
}

function renderResult(properties) {
    const methodLabel =
        properties.analyticalMethod ===
        AnalyticalMethod.SHEAR_ANALOGY
            ? "Shear Analogy"
            : "Gamma Method";

    resultSummary.innerHTML = `
        ${createSummaryCard(
            "Analytical Method",
            methodLabel
        )}

        ${createSummaryCard(
            "Total Thickness",
            `${formatNumber(
                properties.totalThickness,
                3
            )} mm`
        )}

        ${createSummaryCard(
            "Neutral Axis",
            `${formatNumber(
                properties.neutralAxis,
                3
            )} mm`
        )}

        ${createSummaryCard(
            "Effective Bending Stiffness",
            `${formatNumber(
                properties.effectiveBendingStiffness,
                3
            )} N-mm²/m`
        )}
    `;

    resultTableBody.innerHTML =
        properties.layers
            .map(
                (layer) => `
                    <tr>
                        <td>${layer.layerIndex}</td>
                        <td>${formatNumber(
                            layer.thickness,
                            3
                        )}</td>
                        <td>${layer.orientation}°</td>
                        <td>${formatNumber(
                            layer.centroid,
                            3
                        )}</td>
                        <td>${formatNumber(
                            layer.distanceToNeutralAxis,
                            3
                        )}</td>
                        <td>${formatNumber(
                            layer.elasticModulus,
                            3
                        )}</td>
                        <td>${formatNumber(
                            layer.localMomentOfInertia,
                            3
                        )}</td>
                        <td>${formatNumber(
                            layer.parallelAxisTerm,
                            3
                        )}</td>
                        <td>${
                            layer.gammaCoefficient === null
                                ? "-"
                                : formatNumber(
                                      layer.gammaCoefficient,
                                      6
                                  )
                        }</td>
                        <td>${formatNumber(
                            layer.bendingStiffness,
                            3
                        )}</td>
                    </tr>
                `
            )
            .join("");

    outputSection.classList.remove("d-none");
}

function createSummaryCard(label, value) {
    return `
        <div class="col-md-6 col-xl-3">
            <div class="border rounded-3 p-3 h-100 bg-light">
                <div class="result-label">
                    ${label}
                </div>

                <div class="result-value mt-1">
                    ${value}
                </div>
            </div>
        </div>
    `;
}

function formatNumber(value, maximumFractionDigits) {
    return new Intl.NumberFormat("en-US", {
        maximumFractionDigits
    }).format(value);
}

function showError(message) {
    errorAlert.textContent = message;
    errorAlert.classList.remove("d-none");

    hideOutput();

    errorAlert.scrollIntoView({
        behavior: "smooth",
        block: "center"
    });

    errorAlert.focus({
        preventScroll: true
    });
}

function hideError() {
    errorAlert.textContent = "";
    errorAlert.classList.add("d-none");
}

function hideOutput() {
    outputSection.classList.add("d-none");
}