// Test produce chromaticity & non-crop rejection heuristics
function isCropPixel(cropName, r, g, b) {
  const norm = cropName.toLowerCase();
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const sat = max === 0 ? 0 : (max - min) / max;
  const y = 0.299 * r + 0.587 * g + 0.114 * b;
  const blueRatio = b / (r + 0.001);

  // Human skin exclusion: peach/tan skin tone with moderate blue and low red-green delta
  const isHumanSkin =
    r > 85 &&
    g > 55 &&
    b > 38 &&
    r > g &&
    g > b &&
    r - g < 65 &&
    blueRatio > 0.42 &&
    blueRatio < 0.78 &&
    sat < 0.52;

  if (isHumanSkin) {
    return false;
  }

  if (norm.includes("tomato") || norm.includes("pomegranate")) {
    // True ripe red tomato/pomegranate: high red dominance and low blue
    const isRed = r > 100 && r > 1.38 * g && r > 1.65 * b && sat > 0.38 && blueRatio < 0.45;
    // True breaker tomato: vibrant yellow-orange with high saturation and very low blue
    const isBreaker = r > 140 && g > 75 && b < 80 && r > g * 1.15 && sat > 0.52 && blueRatio < 0.38;
    // Green tomato: distinct agricultural green
    const isGreenTomato = g > 90 && g > 1.15 * r && g > 1.25 * b && sat > 0.25;
    return isRed || isBreaker || isGreenTomato;
  }
  return false;
}

function evaluateSample(sampleType, width = 64, height = 64) {
  const totalPixels = width * height;
  let cropPixels = 0;
  let whiteDocPixels = 0;
  let darkInkPixels = 0;
  let humanSkinPixels = 0;
  let darkSuitPixels = 0;

  for (let i = 0; i < totalPixels; i++) {
    let r, g, b;
    if (sampleType === "portrait_in_suit") {
      // 30% skin (face), 40% black suit, 30% grey background
      const rand = Math.random();
      if (rand < 0.25) {
        // Skin tone
        r = 180 + Math.random() * 30;
        g = 130 + Math.random() * 25;
        b = 100 + Math.random() * 20;
      } else if (rand < 0.65) {
        // Black suit / tie
        r = 25 + Math.random() * 20;
        g = 25 + Math.random() * 20;
        b = 30 + Math.random() * 20;
      } else {
        // Studio grey background
        r = 170 + Math.random() * 15;
        g = 170 + Math.random() * 15;
        b = 175 + Math.random() * 15;
      }
    } else if (sampleType === "document_paper") {
      // 85% white/off-white paper, 10% blue/black ink lines, 5% margins
      const rand = Math.random();
      if (rand < 0.85) {
        r = 235 + Math.random() * 15;
        g = 235 + Math.random() * 15;
        b = 230 + Math.random() * 15;
      } else {
        r = 30 + Math.random() * 30;
        g = 35 + Math.random() * 30;
        b = 60 + Math.random() * 40;
      }
    } else if (sampleType === "ripe_tomatoes_in_crate") {
      // 70% ripe red/breaker tomato, 15% green calyx/leaf, 15% plastic crate
      const rand = Math.random();
      if (rand < 0.65) {
        // Red tomato
        r = 210 + Math.random() * 35;
        g = 45 + Math.random() * 35;
        b = 30 + Math.random() * 25;
      } else if (rand < 0.80) {
        // Breaker orange
        r = 215 + Math.random() * 25;
        g = 110 + Math.random() * 30;
        b = 40 + Math.random() * 20;
      } else {
        // Crate / stem
        r = 50 + Math.random() * 30;
        g = 110 + Math.random() * 40;
        b = 50 + Math.random() * 30;
      }
    }

    const y = 0.299 * r + 0.587 * g + 0.114 * b;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const sat = max === 0 ? 0 : (max - min) / max;

    if (y > 195 && sat < 0.12) whiteDocPixels++;
    if (y < 85 && sat < 0.25) darkInkPixels++;
    if (r > 85 && g > 55 && b > 40 && r > g && g > b && (r - g) < 70 && sat >= 0.15 && sat <= 0.58) humanSkinPixels++;
    if (y < 55 && sat < 0.22) darkSuitPixels++;
    if (isCropPixel("Tomato", r, g, b)) cropPixels++;
  }

  const cropChromaPct = ((cropPixels / totalPixels) * 100).toFixed(1);
  const whiteDocPct = ((whiteDocPixels / totalPixels) * 100).toFixed(1);
  const darkInkPct = ((darkInkPixels / totalPixels) * 100).toFixed(1);
  const skinPct = ((humanSkinPixels / totalPixels) * 100).toFixed(1);
  const suitPct = ((darkSuitPixels / totalPixels) * 100).toFixed(1);

  const isDoc = (whiteDocPct > 50 && darkInkPct > 1.5 && cropChromaPct < 10) || (whiteDocPct > 70 && cropChromaPct < 8);
  const isPortrait = (skinPct > 8 && suitPct > 15 && cropChromaPct < 12) || (skinPct > 14 && cropChromaPct < 10) || (suitPct > 35 && cropChromaPct < 8);
  const isCropDetected = cropChromaPct >= 12 && !isDoc && !isPortrait;

  return {
    sampleType,
    cropChromaPct: parseFloat(cropChromaPct),
    isDoc,
    isPortrait,
    isCropDetected,
    verdict: isCropDetected ? "PASSED (Grade A/B Crop Harvest)" : "REJECTED (Grade C / Non-Crop Detected)"
  };
}

console.log("=== Testing Produce Verification Heuristics ===");
const portraitResult = evaluateSample("portrait_in_suit");
console.log("1. Portrait in Suit (User's Photo):", portraitResult);

const docResult = evaluateSample("document_paper");
console.log("2. Document Paper (User's Photo):", docResult);

const tomatoResult = evaluateSample("ripe_tomatoes_in_crate");
console.log("3. Real Tomato Harvest:", tomatoResult);

if (!portraitResult.isCropDetected && !docResult.isCropDetected && tomatoResult.isCropDetected) {
  console.log("\n✅ ALL TESTS PASSED: Non-crop portraits and documents are correctly REJECTED! Authentic harvests PASS!");
} else {
  console.error("\n❌ TEST FAILED");
  process.exit(1);
}
