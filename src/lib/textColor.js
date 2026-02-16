/**
 * Calculates the perceived brightness of a color and returns
 * either 'black' or 'white' text color for maximum contrast.
 * Uses the YIQ formula.
 */
export function getContrastText(hexcolor) {
    // If no color provided, fallback to dark text on light background
    if (!hexcolor) return 'black';

    // Remove octothorpe if present
    hexcolor = hexcolor.replace("#", "");

    // Parse RGB components
    var r = parseInt(hexcolor.substr(0, 2), 16);
    var g = parseInt(hexcolor.substr(2, 2), 16);
    var b = parseInt(hexcolor.substr(4, 2), 16);

    // Calculate YIQ ratio
    var yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;

    // Return black or white depending on brightness threshold
    // 128 is standard middle gray
    return (yiq >= 128) ? 'black' : 'white';
}