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
class PanelProperties {
    calculate(cltLayup) {
        
    }
}

class ShearAnalogyMethod extends PanelProperties {
    calculate(cltLayup) {
        for (let layer of cltLayup.getLayers()) {
        
        }
    }
}

class GammaMethod extends PanelProperties {
    calculate(cltLayup) {
        // do calculation for Gamma Method
    }
}

