import { useState, useMemo } from 'react';
import { Receipt, receiptCategories } from '@/types/receipt';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, SortAsc, SortDesc, Calendar, DollarSign, Store, Filter, Download } from 'lucide-react';
import { format } from 'date-fns';

interface ReceiptTableProps {
  receipts: Receipt[];
  onExport: () => void;
}

type SortField = 'date' | 'amount' | 'vendor' | 'category';
type SortDirection = 'asc' | 'desc';

export function ReceiptTable({ receipts, onExport }: ReceiptTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [amountMin, setAmountMin] = useState('');
  const [amountMax, setAmountMax] = useState('');

  const filteredAndSortedReceipts = useMemo(() => {
    let filtered = receipts.filter(receipt => {
      // Text search across multiple fields
      const searchFields = [receipt.vendor, receipt.category].join(' ').toLowerCase();
      const matchesSearch = searchTerm === '' || searchFields.includes(searchTerm.toLowerCase());

      // Category filter
      const matchesCategory = categoryFilter === 'all' || receipt.category === categoryFilter;

      // Date filter
      const now = new Date();
      const receiptDate = new Date(receipt.date);
      let matchesDate = true;
      
      if (dateFilter === 'last30') {
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        matchesDate = receiptDate >= thirtyDaysAgo;
      } else if (dateFilter === 'last90') {
        const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        matchesDate = receiptDate >= ninetyDaysAgo;
      } else if (dateFilter === 'thisYear') {
        matchesDate = receiptDate.getFullYear() === now.getFullYear();
      }

      // Amount range filter
      const matchesAmount = (amountMin === '' || receipt.amount >= parseFloat(amountMin)) &&
                           (amountMax === '' || receipt.amount <= parseFloat(amountMax));

      return matchesSearch && matchesCategory && matchesDate && matchesAmount;
    });

    // Sorting with optimized algorithms
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortField) {
        case 'date':
          comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
          break;
        case 'amount':
          comparison = a.amount - b.amount;
          break;
        case 'vendor':
          comparison = a.vendor.localeCompare(b.vendor);
          break;
        case 'category':
          comparison = a.category.localeCompare(b.category);
          break;
      }
      
      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [receipts, searchTerm, categoryFilter, dateFilter, sortField, sortDirection, amountMin, amountMax]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getCategoryColor = (category: string) => {
    const categoryConfig = receiptCategories[category];
    return categoryConfig?.color || 'bg-muted';
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <SortAsc className="h-4 w-4 opacity-30" />;
    return sortDirection === 'asc' ? 
      <SortAsc className="h-4 w-4 text-primary" /> : 
      <SortDesc className="h-4 w-4 text-primary" />;
  };

  return (
    <Card className="p-6 shadow-card">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Receipt Records</h2>
            <p className="text-muted-foreground">
              {filteredAndSortedReceipts.length} of {receipts.length} receipts
            </p>
          </div>
          <Button 
            onClick={onExport}
            variant="outline"
            className="hover:bg-accent/10"
          >
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>

        {/* Filters */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search vendor, category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger>
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {Object.keys(receiptCategories).map(category => (
                <SelectItem key={category} value={category}>
                  {receiptCategories[category].name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={dateFilter} onValueChange={setDateFilter}>
            <SelectTrigger>
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue placeholder="All Time" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="last30">Last 30 Days</SelectItem>
              <SelectItem value="last90">Last 90 Days</SelectItem>
              <SelectItem value="thisYear">This Year</SelectItem>
            </SelectContent>
          </Select>

          <Input
            placeholder="Min Amount"
            type="number"
            value={amountMin}
            onChange={(e) => setAmountMin(e.target.value)}
            className="text-sm"
          />

          <Input
            placeholder="Max Amount"
            type="number"
            value={amountMax}
            onChange={(e) => setAmountMax(e.target.value)}
            className="text-sm"
          />
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleSort('date')}
                    className="h-8 hover:bg-muted/50"
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    Date
                    <SortIcon field="date" />
                  </Button>
                </th>
                <th className="text-left py-3 px-4">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleSort('vendor')}
                    className="h-8 hover:bg-muted/50"
                  >
                    <Store className="h-4 w-4 mr-2" />
                    Vendor
                    <SortIcon field="vendor" />
                  </Button>
                </th>
                <th className="text-left py-3 px-4">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleSort('amount')}
                    className="h-8 hover:bg-muted/50"
                  >
                    <DollarSign className="h-4 w-4 mr-2" />
                    Amount
                    <SortIcon field="amount" />
                  </Button>
                </th>
                <th className="text-left py-3 px-4">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleSort('category')}
                    className="h-8 hover:bg-muted/50"
                  >
                    Category
                    <SortIcon field="category" />
                  </Button>
                </th>
                <th className="text-left py-3 px-4">File</th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedReceipts.map((receipt) => (
                <tr 
                  key={receipt.id} 
                  className="border-b border-border/50 hover:bg-muted/30 transition-colors"
                >
                  <td className="py-3 px-4 text-sm">
                    {format(new Date(receipt.date), 'MMM d, yyyy')}
                  </td>
                  <td className="py-3 px-4 font-medium">{receipt.vendor}</td>
                  <td className="py-3 px-4 font-semibold text-accent">
                    ${receipt.amount.toFixed(2)}
                  </td>
                  <td className="py-3 px-4">
                    <Badge 
                      variant="secondary" 
                      className={`${getCategoryColor(receipt.category)} text-white`}
                    >
                      {receiptCategories[receipt.category]?.name || receipt.category}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-sm text-muted-foreground">
                    {receipt.fileName}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredAndSortedReceipts.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No receipts match your filters</p>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}