import { Node, Edge } from 'reactflow';
import type { CustomNodeData } from '../components/canvas/CustomNode';
import html2canvas from 'html-to-image';
import jsPDF from 'jspdf';

export interface ExportOptions {
  format: 'pdf' | 'docx' | 'png';
  includeIncomplete?: boolean;
  template?: 'pitch-deck' | 'business-plan' | 'grant-application';
}

export interface ExportResult {
  success: boolean;
  url?: string;
  filename: string;
  error?: string;
}

class DocumentExportService {
  private baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

  /**
   * Export canvas to various formats
   * Story 6.1: 부분 내보내기 (3개 노드)
   * Story 6.2: AI 문서 변환
   */
  async exportCanvas(nodes: Node[], edges: Edge[], options: ExportOptions): Promise<ExportResult> {
    // Check minimum requirement (Story 6.1: 3+ nodes)
    if (nodes.length < 3) {
      return {
        success: false,
        filename: '',
        error: '최소 3개 이상의 노드가 필요합니다',
      };
    }

    try {
      switch (options.format) {
        case 'pdf':
          return await this.exportToPDF(nodes, edges, options);
        case 'docx':
          return await this.exportToDOCX(nodes, edges, options);
        case 'png':
          return await this.exportToPNG(nodes, edges);
        default:
          return {
            success: false,
            filename: '',
            error: '지원하지 않는 형식입니다',
          };
      }
    } catch (error) {
      console.error('Export error:', error);
      return {
        success: false,
        filename: '',
        error: '내보내기 중 오류가 발생했습니다',
      };
    }
  }

  /**
   * Export to PDF format
   */
  private async exportToPDF(
    nodes: Node[],
    edges: Edge[],
    options: ExportOptions
  ): Promise<ExportResult> {
    try {
      // Generate content based on template
      const content = this.generateDocumentContent(nodes, edges, options);

      // Create PDF
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 20;
      const maxWidth = pageWidth - 2 * margin;
      let yPosition = margin;

      // Title
      pdf.setFontSize(20);
      pdf.setFont('helvetica', 'bold');
      pdf.text('린스타트업 캔버스', pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 15;

      // Add timestamp
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`생성일: ${new Date().toLocaleString('ko-KR')}`, pageWidth / 2, yPosition, {
        align: 'center',
      });
      yPosition += 15;

      // Add content for each node
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');

      for (const node of nodes) {
        const nodeData = node.data as CustomNodeData;

        // Check if incomplete sections should be included
        if (!options.includeIncomplete && !nodeData.completed && !nodeData.inProgress) {
          continue;
        }

        // Check page break
        if (yPosition > pageHeight - 40) {
          pdf.addPage();
          yPosition = margin;
        }

        // Node title
        pdf.setTextColor(
          parseInt(nodeData.color.slice(1, 3), 16),
          parseInt(nodeData.color.slice(3, 5), 16),
          parseInt(nodeData.color.slice(5, 7), 16)
        );
        pdf.text(`${nodeData.icon} ${nodeData.label}`, margin, yPosition);
        yPosition += 10;

        // Node content
        pdf.setTextColor(0, 0, 0);
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(10);

        const content = nodeData.content || '내용 없음';
        const lines = pdf.splitTextToSize(content, maxWidth);

        for (const line of lines) {
          if (yPosition > pageHeight - 20) {
            pdf.addPage();
            yPosition = margin;
          }
          pdf.text(line, margin, yPosition);
          yPosition += 5;
        }

        yPosition += 5;
      }

      // Mark incomplete sections if needed
      if (options.includeIncomplete) {
        const incompleteNodes = nodes.filter((n) => !(n.data as CustomNodeData).completed);

        if (incompleteNodes.length > 0) {
          yPosition += 10;
          pdf.setFontSize(10);
          pdf.setTextColor(255, 0, 0);
          pdf.text('미완성 섹션:', margin, yPosition);
          yPosition += 5;

          for (const node of incompleteNodes) {
            const nodeData = node.data as CustomNodeData;
            pdf.text(`- ${nodeData.label}`, margin + 5, yPosition);
            yPosition += 5;
          }
        }
      }

      // Save PDF
      const filename = `린스타트업_캔버스_${Date.now()}.pdf`;
      pdf.save(filename);

      return {
        success: true,
        filename,
      };
    } catch (error) {
      console.error('PDF export error:', error);
      return {
        success: false,
        filename: '',
        error: 'PDF 생성 중 오류가 발생했습니다',
      };
    }
  }

  /**
   * Export to DOCX format
   */
  private async exportToDOCX(
    nodes: Node[],
    edges: Edge[],
    options: ExportOptions
  ): Promise<ExportResult> {
    try {
      // Call backend API for DOCX generation
      const response = await fetch(`${this.baseUrl}/export/docx`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nodes,
          edges,
          options,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate DOCX');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const filename = `린스타트업_캔버스_${Date.now()}.docx`;

      // Trigger download
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();

      return {
        success: true,
        url,
        filename,
      };
    } catch (error) {
      console.error('DOCX export error:', error);
      return {
        success: false,
        filename: '',
        error: 'DOCX 생성 중 오류가 발생했습니다',
      };
    }
  }

  /**
   * Export canvas as PNG image
   */
  private async exportToPNG(nodes: Node[], edges: Edge[]): Promise<ExportResult> {
    try {
      // This would capture the ReactFlow canvas
      // Implementation depends on actual DOM structure
      const canvas = document.querySelector('.react-flow') as HTMLElement;
      if (!canvas) {
        throw new Error('Canvas not found');
      }

      const dataUrl = await html2canvas.toPng(canvas);
      const filename = `린스타트업_캔버스_${Date.now()}.png`;

      // Trigger download
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = filename;
      a.click();

      return {
        success: true,
        url: dataUrl,
        filename,
      };
    } catch (error) {
      console.error('PNG export error:', error);
      return {
        success: false,
        filename: '',
        error: '이미지 생성 중 오류가 발생했습니다',
      };
    }
  }

  /**
   * Generate document content based on template
   * Story 6.2: AI 문서 변환
   */
  private generateDocumentContent(nodes: Node[], edges: Edge[], options: ExportOptions): string {
    // Sort nodes by stage
    const sortedNodes = [...nodes].sort(
      (a, b) => ((a.data as CustomNodeData).stage || 0) - ((b.data as CustomNodeData).stage || 0)
    );

    let content = '';

    for (const node of sortedNodes) {
      const nodeData = node.data as CustomNodeData;
      content += `## ${nodeData.icon} ${nodeData.label}\n\n`;
      content += `${nodeData.description}\n\n`;
      content += `${nodeData.content || '내용이 작성되지 않았습니다.'}\n\n`;
      content += '---\n\n';
    }

    return content;
  }

  /**
   * Check if export requirements are met
   */
  canExport(nodes: Node[], format: ExportOptions['format']): boolean {
    if (format === 'pdf' || format === 'docx') {
      return nodes.length >= 3;
    }
    return nodes.length > 0;
  }

  /**
   * Get export progress info
   */
  getExportProgress(nodes: Node[]): {
    total: number;
    completed: number;
    inProgress: number;
    notStarted: number;
  } {
    const completed = nodes.filter((n) => (n.data as CustomNodeData).completed).length;
    const inProgress = nodes.filter(
      (n) => !(n.data as CustomNodeData).completed && (n.data as CustomNodeData).inProgress
    ).length;
    const notStarted = nodes.filter(
      (n) => !(n.data as CustomNodeData).completed && !(n.data as CustomNodeData).inProgress
    ).length;

    return {
      total: nodes.length,
      completed,
      inProgress,
      notStarted,
    };
  }
}

export default new DocumentExportService();
