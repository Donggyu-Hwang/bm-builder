/**
 * Export Modal Component
 * Allows users to export the node canvas as PNG, SVG, or PDF
 */

import { useState, useRef } from 'react';
import { toPng, toSvg } from 'html-to-image';
import jsPDF from 'jspdf';

interface ExportOptions {
  format: 'png' | 'svg' | 'pdf';
  resolution: 1 | 2 | 3;
  includeBackground: boolean;
  includeGrid: boolean;
  includeLegend: boolean;
}

interface ExportModalProps {
  onClose: () => void;
  canvasRef?: React.RefObject<HTMLDivElement>;
}

export const ExportModal: React.FC<ExportModalProps> = ({ onClose, canvasRef }) => {
  const [options, setOptions] = useState<ExportOptions>({
    format: 'png',
    resolution: 2,
    includeBackground: true,
    includeGrid: false,
    includeLegend: false,
  });
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    try {
      // Get the canvas element
      const canvasElement = canvasRef?.current || document.querySelector('.react-flow');

      if (!canvasElement) {
        alert('캔버스를 찾을 수 없습니다.');
        return;
      }

      // Apply styles based on options
      const originalStyle = canvasElement.getAttribute('style');
      const backgroundElement = canvasElement.querySelector('.react-flow__background');
      const controlsElement = canvasElement.querySelector('.react-flow__controls');

      // Show/hide background based on options
      if (backgroundElement) {
        backgroundElement.setAttribute('data-show-background', options.includeBackground.toString());
        (backgroundElement as HTMLElement).style.opacity = options.includeBackground ? '1' : '0';
      }

      // Hide controls during export
      if (controlsElement) {
        (controlsElement as HTMLElement).style.opacity = '0';
      }

      const date = new Date().toISOString().split('T')[0];

      try {
        switch (options.format) {
          case 'png':
            await exportAsPng(canvasElement as HTMLElement, options.resolution, date);
            break;
          case 'svg':
            await exportAsSvg(canvasElement as HTMLElement, date);
            break;
          case 'pdf':
            await exportAsPdf(canvasElement as HTMLElement, options.resolution, date);
            break;
        }

        onClose();
      } finally {
        // Restore original styles
        if (backgroundElement) {
          (backgroundElement as HTMLElement).style.opacity = '1';
        }
        if (controlsElement) {
          (controlsElement as HTMLElement).style.opacity = '1';
        }
        if (originalStyle) {
          canvasElement.setAttribute('style', originalStyle);
        }
      }
    } catch (error) {
      console.error('Export failed:', error);
      alert('내보내기에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setExporting(false);
    }
  };

  const exportAsPng = async (element: HTMLElement, scale: number, date: string) => {
    const dataUrl = await toPng(element, {
      width: element.offsetWidth * scale,
      height: element.offsetHeight * scale,
      style: {
        transform: `scale(${scale})`,
        transformOrigin: 'top left',
      },
      quality: 1,
      pixelRatio: scale,
    });

    downloadFile(dataUrl, `workflow-${date}.png`);
  };

  const exportAsSvg = async (element: HTMLElement, date: string) => {
    const dataUrl = await toSvg(element, {
      width: element.offsetWidth,
      height: element.offsetHeight,
    });

    downloadFile(dataUrl, `workflow-${date}.svg`);
  };

  const exportAsPdf = async (element: HTMLElement, scale: number, date: string) => {
    const dataUrl = await toPng(element, {
      width: element.offsetWidth * scale,
      height: element.offsetHeight * scale,
      quality: 1,
      pixelRatio: scale,
    });

    // Calculate PDF dimensions based on canvas size
    const imgWidth = element.offsetWidth * scale;
    const imgHeight = element.offsetHeight * scale;

    // Determine orientation
    const orientation = imgWidth > imgHeight ? 'landscape' : 'portrait';

    // Create PDF with A4 size
    const pdf = new jsPDF({
      orientation,
      unit: 'px',
      format: 'a4',
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    // Calculate scale to fit PDF page
    const scaleX = pdfWidth / imgWidth;
    const scaleY = pdfHeight / imgHeight;
    const pdfScale = Math.min(scaleX, scaleY) * 0.9; // 90% to leave margins

    const scaledWidth = imgWidth * pdfScale;
    const scaledHeight = imgHeight * pdfScale;

    // Center the image on the page
    const x = (pdfWidth - scaledWidth) / 2;
    const y = (pdfHeight - scaledHeight) / 2;

    pdf.addImage(dataUrl, 'PNG', x, y, scaledWidth, scaledHeight);
    pdf.save(`workflow-${date}.pdf`);
  };

  const downloadFile = (dataUrl: string, filename: string) => {
    const link = document.createElement('a');
    link.download = filename;
    link.href = dataUrl;
    link.click();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">내보내기</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="닫기"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Format Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              형식
            </label>
            <select
              value={options.format}
              onChange={(e) => setOptions({ ...options, format: e.target.value as 'png' | 'svg' | 'pdf' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="png">PNG (이미지)</option>
              <option value="svg">SVG (벡터)</option>
              <option value="pdf">PDF (문서)</option>
            </select>
          </div>

          {/* Resolution Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              해상도
            </label>
            <select
              value={options.resolution.toString()}
              onChange={(e) => setOptions({ ...options, resolution: parseInt(e.target.value) as 1 | 2 | 3 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="1">1x (표준)</option>
              <option value="2">2x (Retina)</option>
              <option value="3">3x (인쇄)</option>
            </select>
          </div>

          {/* Include Options */}
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={options.includeBackground}
                onChange={(e) => setOptions({ ...options, includeBackground: e.target.checked })}
                className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
              />
              <span className="ml-2 text-sm text-gray-700">배경 포함</span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={options.includeGrid}
                onChange={(e) => setOptions({ ...options, includeGrid: e.target.checked })}
                className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
              />
              <span className="ml-2 text-sm text-gray-700">격자 포함</span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={options.includeLegend}
                onChange={(e) => setOptions({ ...options, includeLegend: e.target.checked })}
                className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
              />
              <span className="ml-2 text-sm text-gray-700">범례 포함</span>
            </label>
          </div>
        </div>

        <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            disabled={exporting}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            취소
          </button>
          <button
            onClick={handleExport}
            disabled={exporting}
            className="px-4 py-2 text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
          >
            {exporting ? '내보내는 중...' : '내보내기'}
          </button>
        </div>
      </div>
    </div>
  );
};
