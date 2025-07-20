export interface Receipt {
  id: string;
  vendor: string;
  date: string;
  amount: number;
  category: string;
  fileName: string;
  fileType: string;
  confidence: number; // OCR extraction confidence
}

export interface ReceiptStats {
  totalReceipts: number;
  totalAmount: number;
  averageAmount: number;
  medianAmount: number;
  topVendor: string;
  currentMonthSpend: number;
  lastMonthSpend: number;
  categoryBreakdown: Record<string, number>;
  monthlyTrend: { month: string; amount: number }[];
}

export const receiptCategories: Record<string, { name: string; color: string; icon: string }> = {
  'groceries': { name: 'Groceries', color: 'bg-green-500', icon: '🛒' },
  'utilities': { name: 'Utilities', color: 'bg-blue-500', icon: '⚡' },
  'internet': { name: 'Internet', color: 'bg-purple-500', icon: '🌐' },
  'dining': { name: 'Dining', color: 'bg-orange-500', icon: '🍽️' },
  'transportation': { name: 'Transportation', color: 'bg-red-500', icon: '🚗' },
  'shopping': { name: 'Shopping', color: 'bg-pink-500', icon: '🛍️' },
  'healthcare': { name: 'Healthcare', color: 'bg-teal-500', icon: '🏥' },
  'entertainment': { name: 'Entertainment', color: 'bg-indigo-500', icon: '🎬' },
  'education': { name: 'Education', color: 'bg-amber-500', icon: '📚' },
  'other': { name: 'Other', color: 'bg-gray-500', icon: '📋' }
};

// Mock data generation helper
export const generateMockReceipt = (file: File): Receipt => {
  const vendors = [
    'Walmart', 'Target', 'Amazon', 'Costco', 'Home Depot', 'Starbucks',
    'McDonald\'s', 'Shell', 'Verizon', 'AT&T', 'Netflix', 'Spotify',
    'Best Buy', 'CVS Pharmacy', 'Whole Foods', 'Safeway', 'Kroger'
  ];
  
  const getRandomCategory = (vendor: string): string => {
    const vendorCategories: Record<string, string> = {
      'Walmart': 'groceries',
      'Target': 'shopping',
      'Amazon': 'shopping',
      'Costco': 'groceries',
      'Home Depot': 'other',
      'Starbucks': 'dining',
      'McDonald\'s': 'dining',
      'Shell': 'transportation',
      'Verizon': 'utilities',
      'AT&T': 'utilities',
      'Netflix': 'entertainment',
      'Spotify': 'entertainment',
      'Best Buy': 'shopping',
      'CVS Pharmacy': 'healthcare',
      'Whole Foods': 'groceries',
      'Safeway': 'groceries',
      'Kroger': 'groceries'
    };
    return vendorCategories[vendor] || 'other';
  };

  const randomVendor = vendors[Math.floor(Math.random() * vendors.length)];
  const randomAmount = Math.round((Math.random() * 200 + 5) * 100) / 100;
  const randomDaysAgo = Math.floor(Math.random() * 365);
  const date = new Date();
  date.setDate(date.getDate() - randomDaysAgo);

  return {
    id: Math.random().toString(36).substring(7),
    vendor: randomVendor,
    date: date.toISOString().split('T')[0],
    amount: randomAmount,
    category: getRandomCategory(randomVendor),
    fileName: file.name,
    fileType: file.type,
    confidence: Math.round((Math.random() * 0.3 + 0.7) * 100) / 100 // 70-100% confidence
  };
};