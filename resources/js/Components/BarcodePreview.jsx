import { useRef, useEffect } from 'react';
import JsBarcode from 'jsbarcode';

export default function BarcodePreview({ value, format = 'CODE128', width = 2, height = 50, displayValue = true, className = '' }) {
    const svgRef = useRef(null);

    useEffect(() => {
        if (svgRef.current && value) {
            try {
                JsBarcode(svgRef.current, value, {
                    format,
                    width,
                    height,
                    displayValue,
                    margin: 5,
                    fontSize: 14,
                    textMargin: 2,
                });
            } catch (e) {
                // Fallback for invalid barcode values
                // Invalid barcode value - silently ignore
            }
        }
    }, [value, format, width, height, displayValue]);

    if (!value) return null;

    return <svg ref={svgRef} className={className} />;
}
