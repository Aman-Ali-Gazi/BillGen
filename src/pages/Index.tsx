import { useState } from 'react';
import { Receipt, generateMockReceipt } from '@/types/receipt';
import { ReceiptUpload } from '@/components/ReceiptUpload';
import { ReceiptTable } from '@/components/ReceiptTable';
import { Dashboard } from '@/components/Dashboard';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { FileText, BarChart3, Upload as UploadIcon } from 'lucide-react';

const Index = () => {
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState('upload');
  const { toast } = useToast();

  const handleFileUpload = async (files: File[]) => {
    setIsProcessing(true);
    
    try {
      // Simulate OCR processing with delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generate mock receipt data for each file
      const newReceipts = files.map(file => generateMockReceipt(file));
      
      setReceipts(prev => [...prev, ...newReceipts]);
      
      toast({
        title: "Files processed successfully!",
        description: `Extracted data from ${files.length} file${files.length > 1 ? 's' : ''}`,
        variant: "default"
      });
      
      // Switch to records tab after successful upload
      setActiveTab('records');
      
    } catch (error) {
      toast({
        title: "Processing failed",
        description: "There was an error processing your files. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExport = () => {
    if (receipts.length === 0) {
      toast({
        title: "No data to export",
        description: "Upload some receipts first.",
        variant: "destructive"
      });
      return;
    }

    // Generate CSV content
    const headers = ['Date', 'Vendor', 'Amount', 'Category', 'File', 'Confidence'];
    const csvContent = [
      headers.join(','),
      ...receipts.map(receipt => [
        receipt.date,
        `"${receipt.vendor}"`,
        receipt.amount.toFixed(2),
        receipt.category,
        `"${receipt.fileName}"`,
        receipt.confidence.toFixed(2)
      ].join(','))
    ].join('\n');

    // Download file
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `receipt-data-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    toast({
      title: "Export successful",
      description: "Receipt data has been downloaded as CSV.",
      variant: "default"
    });
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-primary rounded-lg">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                  Receipt Tracker
                </h1>
                <p className="text-sm text-muted-foreground">
                  Smart expense management with OCR extraction
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <FileText className="h-4 w-4" />
              <span>{receipts.length} receipts processed</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-[400px] mx-auto">
            <TabsTrigger value="upload" className="flex items-center space-x-2">
              <UploadIcon className="h-4 w-4" />
              <span>Upload</span>
            </TabsTrigger>
            <TabsTrigger value="records" className="flex items-center space-x-2">
              <FileText className="h-4 w-4" />
              <span>Records</span>
            </TabsTrigger>
            <TabsTrigger value="dashboard" className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4" />
              <span>Dashboard</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="space-y-6">
            <div className="text-center space-y-2 mb-8">
              <h2 className="text-3xl font-bold">Upload Your Receipts</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Upload receipt images, PDFs, or text files. Our advanced OCR system will automatically 
                extract vendor information, amounts, dates, and categorize your expenses.
              </p>
            </div>
            <div className="max-w-2xl mx-auto">
              <ReceiptUpload onUpload={handleFileUpload} isProcessing={isProcessing} />
            </div>
            
            {receipts.length > 0 && (
              <div className="text-center">
                <Button 
                  variant="outline" 
                  onClick={() => setActiveTab('records')}
                  className="hover:bg-primary/10"
                >
                  View {receipts.length} Processed Receipt{receipts.length > 1 ? 's' : ''}
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="records" className="space-y-6">
            {receipts.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No receipts uploaded yet</h3>
                <p className="text-muted-foreground mb-6">
                  Start by uploading your first receipt to see the magic happen!
                </p>
                <Button 
                  variant="gradient" 
                  onClick={() => setActiveTab('upload')}
                >
                  Upload First Receipt
                </Button>
              </div>
            ) : (
              <ReceiptTable receipts={receipts} onExport={handleExport} />
            )}
          </TabsContent>

          <TabsContent value="dashboard" className="space-y-6">
            {receipts.length === 0 ? (
              <div className="text-center py-12">
                <BarChart3 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No data to analyze yet</h3>
                <p className="text-muted-foreground mb-6">
                  Upload some receipts to see insightful analytics and spending trends.
                </p>
                <Button 
                  variant="gradient" 
                  onClick={() => setActiveTab('upload')}
                >
                  Get Started
                </Button>
              </div>
            ) : (
              <>
                <div className="text-center space-y-2 mb-8">
                  <h2 className="text-3xl font-bold">Analytics Dashboard</h2>
                  <p className="text-muted-foreground">
                    Insights and trends from your receipt data
                  </p>
                </div>
                <Dashboard receipts={receipts} />
              </>
            )}
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="border-t bg-background/50 mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-sm text-muted-foreground">
            <p>
              Advanced receipt processing with OCR • Search & Filter • Statistical Analysis • Export Capabilities
            </p>
            <p className="mt-2">
              Built with React, TypeScript, and modern algorithms for optimal performance
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;