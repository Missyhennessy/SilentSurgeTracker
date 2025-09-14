import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Download, FileText, Image, BarChart3 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ExportButtonProps {
  data: any;
  filename: string;
  type?: 'chart' | 'data' | 'report';
}

export function ExportButton({ data, filename, type = 'data' }: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  const exportAsJSON = () => {
    setIsExporting(true);
    try {
      const jsonData = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${filename}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Export Successful",
        description: "Data exported as JSON file",
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export data",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const exportAsCSV = () => {
    setIsExporting(true);
    try {
      let csvContent = '';
      
      if (Array.isArray(data)) {
        if (data.length > 0) {
          // Get headers from first object
          const headers = Object.keys(data[0]);
          csvContent = headers.join(',') + '\n';
          
          // Add data rows
          data.forEach(row => {
            const values = headers.map(header => {
              const value = row[header];
              // Escape commas and quotes
              if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
                return `"${value.replace(/"/g, '""')}"`;
              }
              return value;
            });
            csvContent += values.join(',') + '\n';
          });
        }
      } else {
        // Convert object to CSV
        csvContent = 'Key,Value\n';
        Object.entries(data).forEach(([key, value]) => {
          csvContent += `${key},${value}\n`;
        });
      }
      
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${filename}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Export Successful",
        description: "Data exported as CSV file",
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export data",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const exportAsPDF = () => {
    setIsExporting(true);
    try {
      // Create a simple HTML report
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>${filename}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 20px; }
            .data-table { width: 100%; border-collapse: collapse; }
            .data-table th, .data-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            .data-table th { background-color: #f2f2f2; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Silent Surge Tracker Report</h1>
            <p>Generated on: ${new Date().toLocaleDateString()}</p>
            <p>Report: ${filename}</p>
          </div>
          <pre>${JSON.stringify(data, null, 2)}</pre>
        </body>
        </html>
      `;
      
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${filename}.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Export Successful",
        description: "Report exported as HTML file",
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export report",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" disabled={isExporting}>
          <Download className="w-4 h-4 mr-2" />
          {isExporting ? 'Exporting...' : 'Export'}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={exportAsJSON}>
          <FileText className="w-4 h-4 mr-2" />
          Export as JSON
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportAsCSV}>
          <BarChart3 className="w-4 h-4 mr-2" />
          Export as CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportAsPDF}>
          <Image className="w-4 h-4 mr-2" />
          Export as HTML Report
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}