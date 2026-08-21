/**
 * 3:4 Canvas Boundary & Layout Calculator
 * Real-time text layout, line-wrapping, and vertical overflow calculation for Xiaohongshu standard (450 x 600) covers.
 */

export interface CanvasBoundaryReport {
  isOverflow: boolean;
  overflowType: 'none' | 'vertical' | 'collision' | 'excessive_lines';
  canvasWidth: number;
  canvasHeight: number;
  safeWidth: number;
  safeHeight: number;
  totalHeightNeeded: number;
  heightUsagePercent: number;
  titleLines: string[];
  subtitleLines: string[];
  titleHeight: number;
  subtitleHeight: number;
  titleStartY: number;
  subtitleStartY: number;
  overflowAmountPx: number;
  suggestedTitleSize: number;
  suggestedSubtitleSize: number;
  warningLevel: 'safe' | 'warning' | 'danger';
  warningMessage: string;
  actionableTip: string;
}

// Offscreen canvas context for precise measurement
let cachedCtx: CanvasRenderingContext2D | null = null;
function getMeasureContext(): CanvasRenderingContext2D | null {
  if (typeof document === 'undefined') return null;
  if (!cachedCtx) {
    const canvas = document.createElement('canvas');
    cachedCtx = canvas.getContext('2d');
  }
  return cachedCtx;
}

/**
 * Accurately wrap text into lines based on canvas width constraint
 */
export function wrapCanvasText(
  text: string,
  maxWidth: number,
  fontSize: number,
  fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
): string[] {
  if (!text) return [];

  const ctx = getMeasureContext();
  if (ctx) {
    ctx.font = `bold ${fontSize}px ${fontFamily}`;
  }

  // Split by explicit user line breaks first
  const explicitParagraphs = text.split('\n');
  const allLines: string[] = [];

  for (const para of explicitParagraphs) {
    if (!para.trim()) {
      continue;
    }

    const chars = Array.from(para);
    let currentLine = '';

    for (let i = 0; i < chars.length; i++) {
      const char = chars[i];
      const testLine = currentLine + char;

      let measuredWidth = 0;
      if (ctx) {
        measuredWidth = ctx.measureText(testLine).width;
      } else {
        // Fallback approximation: CJK characters ~ fontSize, ASCII ~ 0.55 * fontSize
        let approxW = 0;
        for (const c of testLine) {
          approxW += c.charCodeAt(0) > 255 ? fontSize : fontSize * 0.55;
        }
        measuredWidth = approxW;
      }

      if (measuredWidth > maxWidth && currentLine.length > 0) {
        allLines.push(currentLine);
        currentLine = char;
      } else {
        currentLine = testLine;
      }
    }

    if (currentLine.length > 0) {
      allLines.push(currentLine);
    }
  }

  return allLines;
}

/**
 * Calculate if text layout exceeds 3:4 canvas (450 x 600 px) bounds
 */
export function calculate3x4CanvasBoundary(params: {
  mainTitle: string;
  subTitle?: string;
  badgeText?: string;
  titleSize?: number;
  subTitleSize?: number;
  canvasWidth?: number;
  canvasHeight?: number;
  paddingX?: number;
  paddingY?: number;
}): CanvasBoundaryReport {
  const canvasWidth = params.canvasWidth || 450;
  const canvasHeight = params.canvasHeight || 600;
  const paddingX = params.paddingX || 32;
  const paddingY = params.paddingY || 32;

  const safeWidth = canvasWidth - paddingX * 2; // 386px
  const safeHeight = canvasHeight - paddingY * 2; // 536px

  const titleSize = params.titleSize || 36;
  const subTitleSize = params.subTitleSize || 18;
  const titleLineHeight = titleSize * 1.35;
  const subLineHeight = subTitleSize * 1.4;

  const titleLines = wrapCanvasText(params.mainTitle || '', safeWidth, titleSize);
  const subtitleLines = wrapCanvasText(params.subTitle || '', safeWidth, subTitleSize);

  const titleHeight = titleLines.length * titleLineHeight;
  const subtitleHeight = subtitleLines.length * subLineHeight;

  const hasBadge = Boolean(params.badgeText && params.badgeText.trim());
  const badgeHeight = hasBadge ? 42 : 0;
  const badgeEndY = hasBadge ? 48 + 30 : 32;

  // Dynamic start positions
  // If title has many lines, it shifts up to make room, but not colliding with badge
  const idealTitleStartY = Math.max(badgeEndY + 20, canvasHeight * 0.35);
  const titleEndY = idealTitleStartY + titleHeight;

  // Subtitle starts below title with at least 20px gap, or at 72% height
  const idealSubtitleStartY = Math.max(titleEndY + 20, canvasHeight * 0.72);
  const totalContentBottomY = idealSubtitleStartY + subtitleHeight;

  const maxSafeBottomY = canvasHeight - paddingY; // 568px
  const totalHeightNeeded = (totalContentBottomY - paddingY);
  const heightUsagePercent = Math.min(150, Math.round((totalHeightNeeded / safeHeight) * 100));

  const overflowAmountPx = Math.max(0, Math.round(totalContentBottomY - maxSafeBottomY));
  const isOverflow = overflowAmountPx > 0 || titleLines.length > 5;

  // Calculate recommended font size if overflow
  let suggestedTitleSize = titleSize;
  let suggestedSubtitleSize = subTitleSize;

  if (isOverflow) {
    // Binary search or stepped reduction for optimal title size
    let testSize = titleSize;
    while (testSize > 18) {
      testSize -= 2;
      const testLines = wrapCanvasText(params.mainTitle || '', safeWidth, testSize);
      const testTitleH = testLines.length * (testSize * 1.35);
      const testSubY = Math.max(idealTitleStartY + testTitleH + 16, canvasHeight * 0.72);
      const testBottom = testSubY + subtitleHeight;
      if (testBottom <= maxSafeBottomY && testLines.length <= 4) {
        suggestedTitleSize = testSize;
        break;
      }
    }
    if (suggestedTitleSize === titleSize) {
      suggestedTitleSize = Math.max(20, Math.round(titleSize * 0.75));
      suggestedSubtitleSize = Math.max(14, Math.round(subTitleSize * 0.85));
    }
  }

  let warningLevel: 'safe' | 'warning' | 'danger' = 'safe';
  let warningMessage = '3:4 封面画框内容空间充裕，视觉呈现处于黄金比例';
  let actionableTip = '当前文字大小与排版符合呼吸感要求，文字易读性高。';
  let overflowType: 'none' | 'vertical' | 'collision' | 'excessive_lines' = 'none';

  if (isOverflow) {
    warningLevel = 'danger';
    if (titleLines.length > 5) {
      overflowType = 'excessive_lines';
      warningMessage = `文案行数过多（主标题已折行 ${titleLines.length} 行），严重压缩画面视觉冲击力`;
      actionableTip = `建议点击【自动缩放字号】至 ${suggestedTitleSize}px，或点击【智能拆解/精简】将长文本拆入正文。`;
    } else {
      overflowType = 'vertical';
      warningMessage = `文案已超出 3:4 画布下边界约 ${overflowAmountPx}px (占用率 ${heightUsagePercent}%)`;
      actionableTip = `建议将主标题字号从 ${titleSize}px 调小至 ${suggestedTitleSize}px，或缩减副标题文本。`;
    }
  } else if (heightUsagePercent > 82) {
    warningLevel = 'warning';
    overflowType = 'vertical';
    warningMessage = `文案容量接近 3:4 画布安全红线 (空间占用率 ${heightUsagePercent}%)`;
    actionableTip = `建议保持主标题在 2-3 行以内，避免被小红书底部标题覆盖栏遮挡。`;
  }

  return {
    isOverflow,
    overflowType,
    canvasWidth,
    canvasHeight,
    safeWidth,
    safeHeight,
    totalHeightNeeded,
    heightUsagePercent,
    titleLines,
    subtitleLines,
    titleHeight,
    subtitleHeight,
    titleStartY: idealTitleStartY,
    subtitleStartY: idealSubtitleStartY,
    overflowAmountPx,
    suggestedTitleSize,
    suggestedSubtitleSize,
    warningLevel,
    warningMessage,
    actionableTip
  };
}
