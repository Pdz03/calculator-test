# CLT Floor Panel Properties Calculator

A browser-based calculator for determining CLT floor panel properties using the **Shear Analogy** and **Gamma Method** analytical approaches.

This project was developed as a technical assignment for PT CLT Toolbox Indonesia.

## Features

- Dynamic CLT layer configuration
- Shear Analogy calculation for 3 to 9 layers
- Gamma Method calculation for 3 or 5 layers
- Symmetric layup validation for Shear Analogy
- Individual thickness, orientation, and material-grade inputs for every layer
- Effective bending stiffness calculation
- Neutral-axis calculation
- Detailed calculation output for each layer
- Responsive browser interface
- Automated calculation tests
- Automatic scrolling to validation errors

## Technology

- HTML5
- CSS3
- Bootstrap 5
- Vanilla JavaScript
- JavaScript ES Modules
- Node.js built-in test runner

No database or backend service is required.

## Running the Application

Because the application uses JavaScript ES Modules, run it through a local web server instead of opening `index.html` directly.

### Option 1: Python

From the project directory, run:

```bash
python3 -m http.server 5500
```

On Windows, this may also work:

```bash
python -m http.server 5500
```

Then open:

```text
http://localhost:5500
```

### Option 2: Visual Studio Code Live Server

1. Install the **Live Server** extension.
2. Right-click `index.html`.
3. Select **Open with Live Server**.

## Running the Tests

Node.js 18 or newer is required.

Run:

```bash
npm test
```

The test suite covers:

- Five-layer Shear Analogy calculation
- Five-layer Gamma Method calculation
- Three-layer Gamma Method calculation
- Rejection of asymmetric Shear Analogy layouts
- Rejection of unsupported Gamma layer counts
- Verification that panel length affects Gamma stiffness

## Project Structure

```text
.
├── assets/
│   └── calculator.css
├── calculation/
│   └── panel-properties.js
├── test/
│   └── panel-properties.test.js
├── type/
│   ├── material-grade-type.js
│   ├── clt-layer-type.js
│   ├── clt-layup-type.js
│   ├── clt-layer-properties-type.js
│   └── panel-properties-type.js
├── calculator.js
├── index.html
├── floor-panel-properties.xlsx
├── package.json
└── README.md
```

## Data Model

### `MaterialGradeType`

Represents the engineering properties of a timber material grade.

Properties include:

- Grade name
- Elastic modulus
- Transverse elastic modulus
- Shear modulus
- Rolling shear modulus

### `CLTLayerType`

Represents one CLT panel layer.

Properties include:

- Layer index
- Layer thickness
- Layer orientation
- Material grade

The supported orientations are:

```text
0°
90°
```

### `CLTLayupType`

Represents the complete CLT panel configuration.

Properties include:

- Layup name
- Analytical method
- Effective panel width
- Panel length
- Collection of CLT layers

### `CLTLayerPropertiesType`

Represents the calculated properties of an individual layer.

Properties include:

- Layer index
- Thickness
- Orientation
- Centroid position
- Distance from the neutral axis
- Elastic modulus
- Local moment of inertia
- Parallel-axis contribution
- Gamma coefficient
- Layer bending stiffness

### `PanelPropertiesType`

Represents the complete calculation result.

Properties include:

- Analytical method
- Total panel thickness
- Neutral axis
- Effective bending stiffness
- Detailed calculated properties for every layer

## Main Calculation Entry Point

The application calculates panel properties through:

```javascript
PanelProperties.calculate(cltLayup);
```

The method validates the layup and delegates the calculation to either:

- Shear Analogy
- Gamma Method

## Validation Rules

### Shear Analogy

- Supports 3 to 9 layers
- The layup must be symmetric from top to bottom
- Mirrored layers must have the same thickness
- Mirrored layers must have the same orientation
- Mirrored layers must use the same material grade

Example of a valid five-layer layup:

```text
0° / 90° / 0° / 90° / 0°
```

Example of an invalid asymmetric layout:

```text
Layer 1 thickness: 40 mm
Layer 5 thickness: 35 mm
```

### Gamma Method

- Supports only 3 or 5 layers
- Longitudinal layers contribute to bending stiffness
- Cross layers provide rolling-shear interaction
- Panel length affects the Gamma coefficient
- The weighted neutral axis is calculated from longitudinal-layer stiffness

## Units

| Property | Unit |
|---|---|
| Thickness | mm |
| Effective width | mm |
| Panel length | m |
| Elastic modulus | MPa |
| Shear modulus | MPa |
| Moment of inertia | mm⁴ |
| Parallel-axis term | mm⁴ |
| Effective bending stiffness | N-mm²/m |

## Calculation Notes

The supplied spreadsheet contains some external workbook and cell references that are not included in the repository.

The implementation therefore uses the provided material values and reconstructs the calculations using consistent geometric and engineering relationships.

For symmetric panels, mirrored layers are treated identically. The Gamma Method also uses a weighted neutral axis and applies the same Gamma coefficient to mirrored longitudinal layers when their geometry and material properties are equal.

## Example Input

```text
Effective width : 1000 mm
Panel length    : 5 m
Layer thickness : 35 mm
Material grade  : MGP10
```

Five-layer layout:

```text
0° / 90° / 0° / 90° / 0°
```

## Example Results

| Method | Effective bending stiffness |
|---|---:|
| Shear Analogy | 389,090,625,000 N-mm²/m |
| Gamma Method | 389,087,413,620.713 N-mm²/m |

Three-layer Gamma example:

```text
0° / 90° / 0°
```

Expected result:

```text
102,184,613,821.845 N-mm²/m
```

## Usage

1. Select the analytical method.
2. Select the number of layers.
3. Enter the effective width and panel length.
4. Configure each layer's thickness, orientation, and material grade.
5. Click **Calculate Panel Properties**.
6. Review the summary and detailed per-layer calculation output.

## Error Handling

The application validates user input and layout rules before performing calculations.

When a validation error occurs:

- The output section is hidden
- An error alert is displayed
- The page automatically scrolls to the alert
- Keyboard focus is moved to the alert for accessibility

## Browser Support

The application requires a modern browser with support for:

- JavaScript ES Modules
- `class`
- `const` and `let`
- `Array.prototype.map`
- `Array.prototype.reduce`
- `Intl.NumberFormat`

Recent versions of Chrome, Edge, Firefox, and Safari are supported.

## Author

**Syaifudin Fendi**

## Assignment Branch

```text
assignment-syaifudin-fendi
```



### Calculator Test - Floor Panel Properties
----------------------------------------------------------------------------------------------------------------------------------------
<span style="font-size: 18px">
  Based On The Excel. Please Convert the excel become calculator in web.
</span>

#### 1. Please Follow this illustration to build Datatype CLT Layup

<img width="2816" height="1536" alt="clt-layup" src="https://github.com/user-attachments/assets/66c3569f-e169-4bb7-9b03-2a4644d166f6" />

<span style="font-size: 18px">
  On the illustration above we have Layer 1, Layer 2 etc. Each Layer will be covered on datatype CLTLayerType. For combination of layers, we will store on CLTLayupType. So please Build the Data Structure as the illustration above.
</span>

#### 2. Use The Datatype as Parameter to calculate Panel Properties
<span style="font-size: 18px">
  PanelProperties.calculate(CLTLayupType) => Return PanelPropertiesType
</span>

#### 3. Show The Calculation to Front View
<span style="font-size: 18px">
  After Getting the Data Panel Properties and CLT Layup, you can render the data to html in front view of calculator
</span>

#### 4. Detail Information
<span style="font-size: 18px">
  <ul>
    <li>
      Shear Analogy can calculate 3-9 layers. Gamma can calculate 3-5 layers.
    </li>
    <li>
      When Analytical method choose Shear Analogy. Please only show the section of shear analogy and hide the Gamma. When Gamma choose, please hide shear analogy
    </li>
    <li>
      Show the Input Section and Output Render only.
    </li>
    <li>
      Please implement the calculation with Data Structure and Object Oriented Programming
    </li>
    <li>
      The Candidate freely to delete, update, add the code to implement executing this test
    </li>
    <li>
      Tambahkan limitasi untuk shear analogy simetric dari atas ke bawah. Lalu untuk Gamma Hanya bisa 3 dan 5 layer saja.
    </li>
    <li>
      Please fork this branch and make branch <b>assignment-"name"</b> and add https://github.com/NurAfianto and https://github.com/ikhsan017 as contributor
    </li>
  </ul>
</span>
