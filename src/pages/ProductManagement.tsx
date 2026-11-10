import React, { useMemo, useState, useEffect } from 'react'
import { AnalyticsDashboard } from '@/components/AnalyticsDashboard'
import { SocialPostsManager } from '@/components/SocialPostsManager'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ProductService, Product } from '@/services/ProductService'
import { supabase } from '@/lib/supabase'

// Type definitions (moved from supabase.ts)
export type ProductInsert = Partial<Product>
export type ProductUpdate = Partial<Product>
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import {
  List,
  Grid as GridIcon,
  Plus,
  Search,
  Filter,
  ArrowUpDown,
  MoreVertical,
  Check,
  X,
  Boxes,
  History,
  AlertTriangle,
  Database,
  Pencil,
  Trash2 as Trash,
  Image as ImageIcon,
  MoveUp,
  MoveDown,
  Sparkles,
  Wrench,
  Rocket,
  Bug,
  Zap,
  CheckSquare,
  Square,
  Edit,
  Trash2,
  RefreshCw,
  Package,
  BarChart3,
  Tag,
  FileText,
  ShieldCheck,
} from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { changelogData } from '@/data/changelog'

// Helper to parse specifications - handles both string and object
// Compute only the fields that changed between the original product and the updated form data.
// This enables conflict-free concurrent editing: each save only touches its own changed fields,
// so two users editing different fields simultaneously will never overwrite each other.
const PRODUCT_FIELDS = [
  'name', 'description', 'category', 'status', 'sku', 'price',
  'buy_link', 'image_url', 'secondary_image_url', 'group_name',
  'color', 'hex_color', 'secondary_hex_color', 'specifications',
  'variant_order', 'clearance_price',
] as const;

function computeProductDiff(original: Product, updated: Record<string, any>): Record<string, any> {
  const diff: Record<string, any> = {};
  for (const field of PRODUCT_FIELDS) {
    const origVal = (original as any)[field] ?? null;
    const newVal = updated[field] ?? null;
    if (JSON.stringify(origVal) !== JSON.stringify(newVal)) {
      diff[field] = updated[field];
    }
  }
  return diff;
}

const parseSpecifications = (specs: any): Record<string, any> => {
  if (!specs) return {};
  if (typeof specs === 'object' && !Array.isArray(specs)) return specs;
  if (typeof specs === 'string') {
    try {
      const parsed = JSON.parse(specs);
      if (typeof parsed === 'object' && !Array.isArray(parsed)) return parsed;
    } catch (e) {
      console.error('Failed to parse specifications:', e);
    }
  }
  return {};
};

const ProductManagement = () => {
  const [activeTab, setActiveTab] = useState<'d1' | 'inventory' | 'analytics' | 'categories' | 'changelog' | 'posts'>('d1')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isBulkCreateModalOpen, setIsBulkCreateModalOpen] = useState(false)
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isEditorOpen, setIsEditorOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>('')
  const [secondaryImageFile, setSecondaryImageFile] = useState<File | null>(null)
  const [secondaryImagePreview, setSecondaryImagePreview] = useState<string>('')
  const [addProductTab, setAddProductTab] = useState<'single' | 'dual'>('single')
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [manualOrders, setManualOrders] = useState<Record<string, Product[]>>({})
  const [specKeys, setSpecKeys] = useState<string[]>([])
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set())
  const [bulkEditMode, setBulkEditMode] = useState(false)
  const [dataSource, setDataSource] = useState<'d1' | 'cache' | null>(null)
  const [isNewCategory, setIsNewCategory] = useState(false)
  const [bulkCreateText, setBulkCreateText] = useState('')
  const [scrollPosition, setScrollPosition] = useState(0)

  const [inventoryDeltaById, setInventoryDeltaById] = useState<Record<string, string>>({})
  const [inventorySubTab, setInventorySubTab] = useState<'stock' | 'records'>('stock')
  const [stockBoughtById, setStockBoughtById] = useState<Record<string, string>>({})
  const [inventorySearch, setInventorySearch] = useState('')
  const [inlineEditStockId, setInlineEditStockId] = useState<string | null>(null)
  const [inlineEditStockValue, setInlineEditStockValue] = useState('')
  const [inlineEditPriceId, setInlineEditPriceId] = useState<string | null>(null)
  const [inlineEditPriceValue, setInlineEditPriceValue] = useState('')
  const [inlineEditStatusId, setInlineEditStatusId] = useState<string | null>(null)

  // Session management - auto logout after 30 minutes of inactivity
  React.useEffect(() => {
    let timeout: NodeJS.Timeout

    const resetTimeout = () => {
      clearTimeout(timeout)
      timeout = setTimeout(() => {
        toast.error('Session expired due to inactivity')
        window.location.href = '/login'
      }, 30 * 60 * 1000) // 30 minutes
    }

    const events = ['mousedown', 'keydown', 'scroll', 'touchstart']
    events.forEach(event => window.addEventListener(event, resetTimeout))
    resetTimeout()

    return () => {
      clearTimeout(timeout)
      events.forEach(event => window.removeEventListener(event, resetTimeout))
    }
  }, [])

  const queryClient = useQueryClient()

  // Form state
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    slug: '',
    hero_color: 'blue',
    description: '',
    nav_font: 'sans',
    nav_font_size: 'base',
    nav_color: '',
  })

  const [formData, setFormData] = useState<ProductInsert & { secondary_hex_color?: string; secondary_image_url?: string; clearance_price?: number | null }>({
    name: '',
    description: '',
    category: 'Accessories',
    status: 'In Store',
    sku: '',
    price: 0,
    clearance_price: null,
    buy_link: '',
    image_url: '',
    secondary_image_url: '',
    group_name: '',
    color: '',
    hex_color: '',
    secondary_hex_color: '',
    specifications: {}
  })

  const updateVariantOrderMutation = useMutation({
    mutationFn: async ({ updates }: { updates: Array<{ id: string; variant_order: number | null }> }) => {
      // Update each product's variant_order via D1 API
      const results = await Promise.all(
        updates.map(({ id, variant_order }) =>
          ProductService.updateProduct(id, { variant_order })
        )
      )

      const firstError = results.find(r => r.error)?.error
      if (firstError) throw firstError
    },
    onSuccess: () => {
      ProductService.clearCache(); // Clear product cache
      queryClient.invalidateQueries({ queryKey: ['products'] })
      toast.success('Variant order saved!')
    },
    onError: (error: any) => {
      toast.error(`Error saving variant order: ${error.message}`)
    }
  })

  // Fetch products from D1 API
  const { data: products = [], isLoading, error } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const products = await ProductService.getAllProducts()
      setDataSource('d1') // Always D1 now, no getLastDataSource
      return products as Product[]
    }
  })



  // Fetch inventory from Supabase directly
  const { data: inventory = [], isLoading: inventoryLoading, error: inventoryError } = useQuery({
    queryKey: ['inventory'],
    queryFn: async () => {
      console.log('→ Fetching inventory from Supabase')
      const { data, error } = await supabase
        .from('inventory')
        .select('*')
        .order('sku', { ascending: true })

      if (error) {
        console.error('❌ Supabase inventory fetch error:', error)
        throw error
      }

      console.log(`✅ Supabase inventory loaded: ${data.length} items`)
      return data || []
    }
  })

  // Create a map of SKU to stock_left for quick lookup
  const inventoryMap = useMemo(() => {
    const map: Record<string, number> = {}
    inventory.forEach((item: any) => {
      if (item.sku) {
        map[item.sku] = item.stock_left || 0
      }
    })
    return map
  }, [inventory])

  // Realtime subscription - DISABLED (D1 doesn't support realtime)
  // SUPABASE PHASED OUT
  React.useEffect(() => {
    console.log('⚠️ Realtime subscription disabled (D1 only mode)')
    // D1 doesn't support realtime subscriptions
    // Manual refresh required after changes
  }, [queryClient])

  // Realtime subscription for inventory - DISABLED
  React.useEffect(() => {
    console.log('⚠️ Inventory realtime disabled (D1 only mode)')
  }, [queryClient])

  // Create product mutation (D1 ONLY)
  const createProductMutation = useMutation({
    mutationFn: async (product: ProductInsert) => {
      const result = await ProductService.addProduct(product);
      if (result.error) throw result.error;
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      toast.success('✅ Product created in D1!')
      resetForm()
      setIsCreateModalOpen(false)
      setIsEditorOpen(false)
      triggerAutoSync()
    },
    onError: (error: any) => {
      toast.error(`Error creating product: ${error.message}`)
    }
  })

  // Update mutation (D1 ONLY) - Save scroll position
  const updateProductMutation = useMutation({
    mutationFn: async ({ id, ...product }: ProductUpdate & { id: string }) => {
      // Save current scroll position before update
      setScrollPosition(window.scrollY)
      const result = await ProductService.updateProduct(id, product);
      if (result.error) throw result.error;
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      toast.success('✅ Product updated in D1!')
      setEditingProduct(null)
      setIsEditModalOpen(false)
      setIsCreateModalOpen(false)
      setIsEditorOpen(false)
      // Restore scroll position after a brief delay
      setTimeout(() => {
        window.scrollTo({ top: scrollPosition, behavior: 'instant' })
      }, 100)
      triggerAutoSync()
    },
    onError: (error: any) => {
      toast.error(`Error updating product: ${error.message}`)
    }
  })

  // Delete mutation (D1 ONLY)
  const deleteProductMutation = useMutation({
    mutationFn: async (id: string) => {
      const result = await ProductService.deleteProduct(id);
      if (result.error) throw result.error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      toast.success('✅ Product deleted from D1!')
      triggerAutoSync()
    },
    onError: (error: any) => {
      toast.error(`Error deleting: ${error.message}`)
    }
  })

  // Bulk update mutation
  const bulkUpdateMutation = useMutation({
    mutationFn: async ({ ids, updates }: { ids: string[], updates: Partial<Product> }) => {
      const results = await Promise.all(
        ids.map(id => ProductService.updateProduct(id, updates))
      )
      const firstError = results.find(r => r.error)?.error
      if (firstError) throw firstError
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      toast.success('✅ Products updated successfully!')
      setSelectedProducts(new Set())
      setBulkEditMode(false)
      triggerAutoSync()
    },
    onError: (error: any) => {
      toast.error(`Error updating products: ${error.message}`)
    }
  })

  // Bulk create mutation
  const [bulkRows, setBulkRows] = useState<Array<{
    category: string;
    name: string;
    status: string;
    sku: string;
    price: string;
    buyLink: string;
    description: string;
    specifications: string;
    imageUrl: string;
    group_name: string;
    color: string;
    hex_color: string;
    secondary_hex_color: string;
  }>>([
    { category: '', name: '', status: 'In Store', sku: '', price: '', buyLink: '', description: '', specifications: '', imageUrl: '', group_name: '', color: '', hex_color: '', secondary_hex_color: '' }
  ]);

  const [uploadingImages, setUploadingImages] = useState<Set<number>>(new Set());

  const [bulkActiveCell, setBulkActiveCell] = useState<{ row: number; col: number } | null>(null);
  const [bulkSelection, setBulkSelection] = useState<{ r1: number; c1: number; r2: number; c2: number } | null>(null);
  const [isBulkSelecting, setIsBulkSelecting] = useState(false);

  const bulkFieldOrder = useMemo(
    () => [
      'category',
      'name',
      'status',
      'sku',
      'price',
      'imageUrl',
      'buyLink',
      'description',
      'specifications',
      'group_name',
      'color',
      'hex_color',
      'secondary_hex_color'
    ] as const,
    []
  );

  const bulkFieldIndex = useMemo(() => {
    const map = new Map<string, number>();
    bulkFieldOrder.forEach((f, i) => map.set(f, i));
    return map;
  }, [bulkFieldOrder]);

  const addBulkRow = () => {
    setBulkRows([
      ...bulkRows,
      { category: '', name: '', status: 'In Store', sku: '', price: '', buyLink: '', description: '', specifications: '', imageUrl: '', group_name: '', color: '', hex_color: '', secondary_hex_color: '' }
    ]);
  };

  const removeBulkRow = (index: number) => {
    setBulkRows(bulkRows.filter((_, i) => i !== index));
  };

  const updateBulkRow = (index: number, field: string, value: string) => {
    const newRows = [...bulkRows];
    newRows[index] = { ...newRows[index], [field]: value };
    setBulkRows(newRows);
  };

  const ensureBulkRowCount = (count: number) => {
    if (bulkRows.length >= count) return;
    const next = [...bulkRows];
    while (next.length < count) {
      next.push({ category: '', name: '', status: 'In Store', sku: '', price: '', buyLink: '', description: '', specifications: '', imageUrl: '', group_name: '', color: '', hex_color: '', secondary_hex_color: '' });
    }
    setBulkRows(next);
  };

  const parseGridText = (text: string) => {
    const normalized = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    const rows = normalized.split('\n').filter(r => r.trim() !== '');
    return rows.map(r => r.split('\t'));
  };

  const normalizeBulkRange = (range: { r1: number; c1: number; r2: number; c2: number }) => {
    const rMin = Math.min(range.r1, range.r2);
    const rMax = Math.max(range.r1, range.r2);
    const cMin = Math.min(range.c1, range.c2);
    const cMax = Math.max(range.c1, range.c2);
    return { r1: rMin, r2: rMax, c1: cMin, c2: cMax };
  };

  const isBulkCellSelected = (rowIndex: number, colIndex: number) => {
    if (!bulkSelection) return false;
    const s = normalizeBulkRange(bulkSelection);
    return rowIndex >= s.r1 && rowIndex <= s.r2 && colIndex >= s.c1 && colIndex <= s.c2;
  };

  const startBulkSelection = (rowIndex: number, colIndex: number) => {
    setBulkActiveCell({ row: rowIndex, col: colIndex });
    setBulkSelection({ r1: rowIndex, c1: colIndex, r2: rowIndex, c2: colIndex });
    setIsBulkSelecting(true);
  };

  const extendBulkSelection = (rowIndex: number, colIndex: number) => {
    setBulkSelection((prev) => {
      if (!prev) return { r1: rowIndex, c1: colIndex, r2: rowIndex, c2: colIndex };
      return { ...prev, r2: rowIndex, c2: colIndex };
    });
  };

  const stopBulkSelection = () => {
    setIsBulkSelecting(false);
  };

  const getBulkCellValue = (rowIndex: number, colIndex: number) => {
    const row = bulkRows[rowIndex];
    const field = bulkFieldOrder[colIndex];
    if (!row || !field) return '';
    return String((row as any)[field] ?? '');
  };

  const clearBulkRange = (range: { r1: number; c1: number; r2: number; c2: number }) => {
    const sel = normalizeBulkRange(range);
    setBulkRows((prev) => {
      const next = [...prev];

      for (let r = sel.r1; r <= sel.r2; r++) {
        const existing = next[r] ?? { category: '', name: '', status: 'In Store', sku: '', price: '', buyLink: '', description: '', specifications: '', imageUrl: '', group_name: '', color: '', hex_color: '', secondary_hex_color: '' };
        const updated: any = { ...existing };

        for (let c = sel.c1; c <= sel.c2; c++) {
          const field = bulkFieldOrder[c];
          if (!field) continue;
          if (field === 'status') updated[field] = 'In Store';
          else updated[field] = '';
        }

        next[r] = updated;
      }

      return next;
    });
  };

  const handleBulkKeyDown = async (e: React.KeyboardEvent) => {
    if (!bulkSelection) return;
    const isMac = /Mac|iPhone|iPad|iPod/i.test(navigator.userAgent);
    const cmdOrCtrl = isMac ? e.metaKey : e.ctrlKey;
    const sel = normalizeBulkRange(bulkSelection);

    if (cmdOrCtrl && e.key.toLowerCase() === 'c') {
      e.preventDefault();

      const lines: string[] = [];
      for (let r = sel.r1; r <= sel.r2; r++) {
        const rowCells: string[] = [];
        for (let c = sel.c1; c <= sel.c2; c++) {
          rowCells.push(getBulkCellValue(r, c));
        }
        lines.push(rowCells.join('\t'));
      }

      const text = lines.join('\n');
      try {
        await navigator.clipboard.writeText(text);
      } catch {
        // Ignore clipboard errors
      }
    }

    if (e.key === 'Backspace' || e.key === 'Delete') {
      e.preventDefault();
      clearBulkRange(sel);
    }
  };

  const uploadImageViaApi = async (file: File, sku?: string): Promise<string> => {
    const fd = new FormData();
    fd.append('file', file);

    // Use proxy server for development (port 3001)
    // In production, this will use the Cloudflare Function at /api/upload
    const isDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const uploadUrl = isDev
      ? `http://localhost:3001/api/upload${sku ? `?sku=${encodeURIComponent(sku)}` : ''}`
      : `/api/upload${sku ? `?sku=${encodeURIComponent(sku)}` : ''}`;

    console.log('Uploading to:', uploadUrl);

    const resp = await fetch(uploadUrl, {
      method: 'POST',
      body: fd,
    });

    console.log('Upload response status:', resp.status);

    let data: any = null;
    try {
      data = await resp.json();
      console.log('Upload response data:', data);
    } catch (e) {
      console.error('Failed to parse upload response:', e);
      data = null;
    }

    if (!resp.ok) {
      const errorMsg = data?.error || `Upload failed (${resp.status})`;
      console.error('Upload failed:', errorMsg);

      // Show more helpful error message
      if (resp.status === 502) {
        throw new Error(`Upload service unavailable. ${data?.error || 'The image hosting service may be blocking requests. Please try uploading the image separately and paste the URL instead.'}`);
      }

      throw new Error(errorMsg);
    }

    if (!data?.success || !data?.url) {
      throw new Error(data?.error || 'Upload failed - no URL returned');
    }

    return String(data.url);
  };

  const handleBulkPaste = (
    e: React.ClipboardEvent,
    startRowIndex: number,
    startField: string
  ) => {
    const clipboard = e.clipboardData.getData('text');
    if (!clipboard) return;

    const startCol = bulkFieldIndex.get(startField);
    if (startCol === undefined) return;

    const grid = parseGridText(clipboard);
    if (grid.length === 0) return;

    e.preventDefault();

    const requiredRows = startRowIndex + grid.length;
    ensureBulkRowCount(requiredRows);

    setBulkRows(prev => {
      const next = [...prev];
      for (let r = 0; r < grid.length; r++) {
        const rowIndex = startRowIndex + r;
        const cells = grid[r];
        const existing = next[rowIndex] ?? { category: '', name: '', status: 'In Store', sku: '', price: '', buyLink: '', description: '', specifications: '', imageUrl: '', group_name: '', color: '', hex_color: '', secondary_hex_color: '' };
        let updated: any = { ...existing };

        for (let c = 0; c < cells.length; c++) {
          const colIndex = startCol + c;
          if (colIndex >= bulkFieldOrder.length) break;
          const field = bulkFieldOrder[colIndex];
          const value = (cells[c] ?? '').trim();

          if (field === 'status') {
            const allowed = ['In Store', 'Out of Stock', 'Coming Soon', 'Removal Requested', 'Removal Pending', 'Phased Out'];
            updated[field] = allowed.includes(value) ? value : (value ? value : updated[field]);
          } else {
            updated[field] = value;
          }
        }

        next[rowIndex] = updated;
      }
      return next;
    });
  };

  const uploadBulkImage = async (index: number, file: File) => {
    setUploadingImages(prev => new Set(prev).add(index));

    try {
      const sku = (bulkRows[index]?.sku || '').trim();
      const imageUrl = await uploadImageViaApi(file, sku || undefined);
      updateBulkRow(index, 'imageUrl', imageUrl);
      toast.success('Image uploaded successfully!');
    } catch (error: any) {
      toast.error(`Image upload failed: ${error.message}`);
    } finally {
      setUploadingImages(prev => {
        const newSet = new Set(prev);
        newSet.delete(index);
        return newSet;
      });
    }
  };

  const bulkCreateMutation = useMutation({
    mutationFn: async () => {
      const products: ProductInsert[] = bulkRows
        .filter(row => row.name && row.sku && row.price && row.category)
        .map(row => {
          let specs: any = {};
          if (row.specifications?.trim()) {
            try {
              specs = JSON.parse(row.specifications);
            } catch {
              specs = {};
            }
          }

          return {
            name: row.name,
            sku: row.sku,
            price: parseFloat(row.price) || 0,
            category: row.category,
            status: row.status || 'In Store',
            buy_link: row.buyLink || '',
            description: row.description || '',
            image_url: row.imageUrl || '',
            group_name: row.group_name || '',
            color: row.color || '',
            hex_color: row.hex_color || '',
            secondary_hex_color: row.secondary_hex_color || '',
            specifications: specs
          };
        });

      if (products.length === 0) {
        throw new Error('No valid products found. Please fill in at least Category, Name, SKU, and Price.');
      }

      const results = await Promise.all(
        products.map(p => ProductService.addProduct(p))
      );

      const errors = results.filter(r => r.error);
      if (errors.length > 0) {
        throw new Error(`${errors.length} products failed to create`);
      }

      return products.length;
    },
    onSuccess: (count) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success(`✅ ${count} products created successfully!`);
      setBulkRows([{ category: '', name: '', status: 'In Store', sku: '', price: '', buyLink: '', description: '', specifications: '', imageUrl: '', group_name: '', color: '', hex_color: '', secondary_hex_color: '' }]);
      setIsBulkCreateModalOpen(false);
      triggerAutoSync()
    },
    onError: (error: any) => {
      toast.error(`Error: ${error.message}`);
    }
  });

  // Sync D1 to Supabase mutation - Uses API endpoint
  const syncToSupabaseMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Sync failed');
      }

      return result.stats;
    },
    onSuccess: (stats) => {
      const totalSynced = stats.products.synced + stats.inventory.synced;
      const totalErrors = stats.products.errors + stats.inventory.errors;

      if (totalErrors === 0) {
        toast.success(`✅ Successfully synced ${totalSynced} items from D1 to Supabase!`);
      } else {
        toast.warning(`⚠️ Synced ${totalSynced} items with ${totalErrors} errors`);
      }

      setIsSyncModalOpen(false);
    },
    onError: (error: any) => {
      toast.error(`Sync failed: ${error.message}`);
    }
  })

  // Fire-and-forget background sync: D1 → Supabase after any write
  const triggerAutoSync = () => {
    fetch('/api/sync', { method: 'POST', headers: { 'Content-Type': 'application/json' } })
      .then(r => r.json())
      .then(result => {
        if (result.success) {
          const total = (result.stats?.products?.synced ?? 0) + (result.stats?.inventory?.synced ?? 0);
          if (total > 0) toast.info(`Synced ${total} items to Supabase`, { duration: 2000 });
        }
      })
      .catch(() => { /* silent – manual sync button is always available */ });
  };

  // Compress image before upload with 100KB target
  const compressImage = async (file: File, targetSizeKB: number = 100): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const img = new Image()
        img.onload = () => {
          const canvas = document.createElement('canvas')
          const ctx = canvas.getContext('2d')

          // Max dimensions
          const maxWidth = 1200
          const maxHeight = 1200

          let width = img.width
          let height = img.height

          // Calculate new dimensions
          if (width > height) {
            if (width > maxWidth) {
              height = (height * maxWidth) / width
              width = maxWidth
            }
          } else {
            if (height > maxHeight) {
              width = (width * maxHeight) / height
              height = maxHeight
            }
          }

          canvas.width = width
          canvas.height = height

          ctx?.drawImage(img, 0, 0, width, height)

          // Try different quality levels to hit target size
          let quality = 0.8
          const targetBytes = targetSizeKB * 1024

          const tryCompress = (q: number) => {
            canvas.toBlob(
              (blob) => {
                if (blob) {
                  // If still too large and quality can be reduced, try again
                  if (blob.size > targetBytes && q > 0.3) {
                    tryCompress(q - 0.1)
                  } else {
                    resolve(blob)
                  }
                } else {
                  reject(new Error('Failed to compress image'))
                }
              },
              'image/jpeg',
              q
            )
          }

          tryCompress(quality)
        }
        img.onerror = () => reject(new Error('Failed to load image'))
        img.src = e.target?.result as string
      }
      reader.onerror = () => reject(new Error('Failed to read file'))
      reader.readAsDataURL(file)
    })
  }

  // Handle image upload with SKU-based naming and compression
  // SUPABASE PHASED OUT - getProductImageUrl no longer needed
  // Images are now stored via MagicAPI/CloudFront only
  // const getProductImageUrl = (sku: string): string => { ... }

  const handleImageUpload = async (file: File, sku: string): Promise<string | null> => {
    try {
      toast.info('Compressing image...')

      // Compress the image with 100KB target
      const compressedBlob = await compressImage(file, 100)
      const originalSize = (file.size / 1024).toFixed(2)
      const compressedSize = (compressedBlob.size / 1024).toFixed(2)
      const savings = (((file.size - compressedBlob.size) / file.size) * 100).toFixed(1)

      console.log(`Image compressed: ${originalSize}KB → ${compressedSize}KB (${savings}% reduction)`)

      // Check if still over 100KB and warn
      if (compressedBlob.size > 100 * 1024) {
        toast.warning(`⚠️ Image is ${compressedSize}KB (over 100KB limit). Consider using a smaller image.`, {
          duration: 8000
        })
      } else {
        toast.success(`✓ Image compressed to ${compressedSize}KB`)
      }

      // Use SKU as filename with .jpg extension
      const fileName = `${sku}.jpg`

      toast.info('Uploading image...')

      const compressedFile = new File([compressedBlob], fileName, { type: 'image/jpeg' })
      const finalUrl = await uploadImageViaApi(compressedFile, sku)

      // Clear product cache so new image shows up
      ProductService.clearCache()

      return finalUrl
    } catch (error) {
      console.error('Error uploading image:', error)
      toast.error('Failed to upload image: ' + (error as Error).message)
      return null
    }
  }

  // Form handlers
  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      category: 'Accessories',
      status: 'In Store',
      sku: '',
      price: 0,
      clearance_price: null,
      buy_link: '',
      image_url: '',
      secondary_image_url: '',
      group_name: '',
      color: '',
      hex_color: '',
      secondary_hex_color: '',
      specifications: {}
    })
    setImageFile(null)
    setImagePreview('')
    setSecondaryImageFile(null)
    setSecondaryImagePreview('')
    setAddProductTab('single')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate SKU is provided
    if (!formData.sku) {
      toast.error('SKU is required for image upload')
      return
    }

    let imageUrl = formData.image_url

    if (imageFile) {
      const uploadedUrl = await handleImageUpload(imageFile, formData.sku)
      if (uploadedUrl) {
        imageUrl = uploadedUrl
      } else {
        if (!imageUrl?.trim()) {
          // If upload failed and no URL provided, don't proceed
          return
        }
        toast.warning('Image upload failed — using the provided Image URL instead.')
      }
    }

    let secondaryImageUrl = formData.secondary_image_url
    if (secondaryImageFile) {
      const uploadedUrl = await handleImageUpload(secondaryImageFile, `${formData.sku}-2`)
      if (uploadedUrl) {
        secondaryImageUrl = uploadedUrl
      } else {
        toast.warning('Secondary image upload failed — using the provided URL instead.')
      }
    }

    const productData = {
      ...formData,
      image_url: imageUrl,
      secondary_image_url: secondaryImageUrl,
      specifications: formData.specifications || {}
    }

    if (editingProduct) {
      // Only send changed fields — allows concurrent edits to different fields
      // without overwriting each other (field-level merge / delta update)
      const delta = computeProductDiff(editingProduct, productData);
      if (Object.keys(delta).length === 0) {
        toast.info('No changes detected');
        return;
      }
      updateProductMutation.mutate({ id: editingProduct.id, ...delta });
    } else {
      createProductMutation.mutate(productData)
    }
  }

  const handleEdit = (product: Product) => {
    setEditingProduct(product)
    const secImg = (product as any).secondary_image_url || ''
    setFormData({
      name: product.name,
      description: product.description || '',
      category: product.category,
      status: product.status || 'In Store',
      sku: product.sku,
      price: product.price,
      clearance_price: product.clearance_price ?? null,
      buy_link: product.buy_link || '',
      image_url: product.image_url || '',
      secondary_image_url: secImg,
      group_name: product.group_name || '',
      color: product.color || '',
      hex_color: product.hex_color || '',
      secondary_hex_color: product.secondary_hex_color || '',
      specifications: parseSpecifications(product.specifications)
    })
    setImagePreview(product.image_url || '')
    setSecondaryImagePreview(secImg)
    setAddProductTab(secImg ? 'dual' : 'single')
    setIsCreateModalOpen(true)
  }

  const openSideEditor = (product: Product) => {
    setEditingProduct(product)
    const secImg = (product as any).secondary_image_url || ''
    setFormData({
      name: product.name,
      description: product.description || '',
      category: product.category,
      status: product.status || 'In Store',
      sku: product.sku,
      price: product.price,
      clearance_price: product.clearance_price ?? null,
      buy_link: product.buy_link || '',
      image_url: product.image_url || '',
      secondary_image_url: secImg,
      group_name: product.group_name || '',
      color: product.color || '',
      hex_color: product.hex_color || '',
      secondary_hex_color: product.secondary_hex_color || '',
      specifications: parseSpecifications(product.specifications)
    })
    setImagePreview(product.image_url || '')
    setSecondaryImagePreview(secImg)
    setAddProductTab(secImg ? 'dual' : 'single')
    setIsEditorOpen(true)
  }

  const closeSideEditor = () => {
    setIsEditorOpen(false)
    setEditingProduct(null)
  }

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      deleteProductMutation.mutate(id)
    }
  }

  const toggleProductSelection = (id: string) => {
    const newSelection = new Set(selectedProducts)
    if (newSelection.has(id)) {
      newSelection.delete(id)
    } else {
      newSelection.add(id)
    }
    setSelectedProducts(newSelection)
  }

  const selectAllProducts = () => {
    const allIds = new Set(filteredProducts.map(p => p.id))
    setSelectedProducts(allIds)
  }

  const deselectAllProducts = () => {
    setSelectedProducts(new Set())
  }

  const handleBulkUpdate = (field: string, value: any) => {
    if (selectedProducts.size === 0) {
      toast.error('No products selected')
      return
    }

    if (window.confirm(`Update ${field} for ${selectedProducts.size} products?`)) {
      bulkUpdateMutation.mutate({
        ids: Array.from(selectedProducts),
        updates: { [field]: value }
      })
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const filteredProducts = useMemo(() => {
    // Only show products, not inventory
    const base = selectedCategory === 'all'
      ? products
      : products.filter(p => p.category === selectedCategory)

    if (!searchTerm.trim()) return base
    const term = searchTerm.toLowerCase()
    return base.filter((p) => {
      const haystack = [
        p.name,
        p.sku,
        p.category,
        p.group_name || '',
        p.color || '',
        p.status || ''
      ].join(' ').toLowerCase()
      return haystack.includes(term)
    })
  }, [products, searchTerm, selectedCategory])

  // Products grouped by category for Overview
  const productsByCategory = useMemo(() => {
    const groups: Record<string, Product[]> = {};
    products.forEach(p => {
      if (!groups[p.category]) groups[p.category] = [];
      groups[p.category].push(p);
    });
    return groups;
  }, [products]);

  const handleAddCategory = async () => {
    try {
      if (!categoryForm.name.trim()) {
        toast.error('Category name is required');
        return;
      }
      const slug = (categoryForm.slug || categoryForm.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
      const { error } = await ProductService.addCategory({
        ...categoryForm,
        slug
      });
      if (error) throw error;
      toast.success('Category added successfully');
      setCategoryForm({ name: '', slug: '', hero_color: 'blue', description: '', nav_font: 'sans', nav_font_size: 'base', nav_color: '' });
      setIsCreateModalOpen(false); // Reuse this state or separate? Wait, I added a separate dialog trigger in my previous plan.
      // But I should just invalidate queries
      queryClient.invalidateQueries({ queryKey: ['products'] });
      // Force reload to update navbar
      window.location.reload();
    } catch (e: any) {
      toast.error('Failed to add category: ' + e.message);
      console.error(e);
    }
  };

  // Group products by group_name for better organization
  const groupedProducts = useMemo(() => {
    const groups: { [key: string]: Product[] } = {}
    filteredProducts.forEach(product => {
      const groupName = product.group_name || product.name
      if (!groups[groupName]) {
        groups[groupName] = []
      }
      groups[groupName].push(product)
    })

    // Always sort by manual order (variant_order)
    Object.keys(groups).forEach(groupName => {
      if (manualOrders[groupName]?.length) {
        groups[groupName] = manualOrders[groupName]
        return
      }

      groups[groupName].sort((a, b) => {
        const aOrder = a.variant_order ?? Number.POSITIVE_INFINITY
        const bOrder = b.variant_order ?? Number.POSITIVE_INFINITY
        return aOrder - bOrder
      })
    })

    return groups
  }, [filteredProducts, manualOrders])

  const reorderGroup = (groupName: string, targetId: string) => {
    if (!draggingId || draggingId === targetId) return null

    const current = manualOrders[groupName] ?? groupedProducts[groupName]
    if (!current) return null

    const fromIndex = current.findIndex(p => p.id === draggingId)
    const toIndex = current.findIndex(p => p.id === targetId)
    if (fromIndex === -1 || toIndex === -1) return null

    const next = [...current]
    const [moved] = next.splice(fromIndex, 1)
    next.splice(toIndex, 0, moved)
    setManualOrders(prev => ({ ...prev, [groupName]: next }))
    return next
  }

  const saveGroupOrder = (groupName: string, listOverride?: Product[]) => {
    const list = listOverride ?? manualOrders[groupName]
    if (!list?.length) return

    updateVariantOrderMutation.mutate({
      updates: list.map((p, idx) => ({ id: p.id, variant_order: idx }))
    })
  }

  const reorderGroupAndPersist = (groupName: string, targetId: string) => {
    const next = reorderGroup(groupName, targetId)
    if (next) {
      saveGroupOrder(groupName, next)
    }
  }

  const moveVariant = (groupName: string, productId: string, direction: 'up' | 'down') => {
    const current = manualOrders[groupName] ?? groupedProducts[groupName]
    if (!current) return

    const index = current.findIndex(p => p.id === productId)
    if (index === -1) return

    const newIndex = direction === 'up' ? index - 1 : index + 1
    if (newIndex < 0 || newIndex >= current.length) return

    const next = [...current]
    const [moved] = next.splice(index, 1)
    next.splice(newIndex, 0, moved)

    setManualOrders(prev => ({ ...prev, [groupName]: next }))
    saveGroupOrder(groupName, next)
  }

  // Fetch all categories including empty ones for management
  const { data: fetchedCategories = [] } = useQuery({
    queryKey: ['categories-all'],
    queryFn: async () => {
      const cats = await ProductService.getCategories({ includeEmpty: true });
      return cats;
    }
  });

  const categories = useMemo(() => {
    return fetchedCategories.filter(c => c !== 'all' && c !== 'All');
  }, [fetchedCategories]);

  const mainDatabaseLabel = useMemo(() => {
    if (dataSource === 'd1') return 'Products';
    return 'Products';
  }, [dataSource]);

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-6">
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 max-w-md w-full">
          <div className="flex items-center gap-3 mb-2">
            <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0" />
            <h2 className="text-red-400 font-semibold">Error loading products</h2>
          </div>
          <p className="text-red-300/70 text-sm">{(error as Error).message}</p>
        </div>
      </div>
    )
  }

  const tabMeta: Record<string, { label: string; icon: any; desc: string }> = {
    d1:        { label: 'Products',   icon: Package,     desc: 'Manage your product catalog' },
    categories:{ label: 'Categories', icon: Tag,         desc: 'Manage product categories' },
    inventory: { label: 'Inventory',  icon: Boxes,       desc: 'Monitor and update stock levels' },
    analytics: { label: 'Analytics',  icon: BarChart3,   desc: 'Live traffic and historical trends' },
    changelog: { label: 'Changelog',  icon: FileText,    desc: 'Review recent system updates' },
    posts:     { label: 'Social Posts', icon: ImageIcon, desc: 'Manage landing page social media posts' },
  };

  return (
    <div className="min-h-screen bg-black flex flex-col">

      <div className="container mx-auto px-4 lg:px-8 pt-24 pb-20 flex-grow">

        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-1">
              {React.createElement(tabMeta[activeTab]?.icon ?? Package, { className: 'w-6 h-6 text-cyan-400' })}
              <h1 className="font-display text-3xl md:text-4xl font-bold text-white">
                {tabMeta[activeTab]?.label}
              </h1>
              <span className="hidden sm:inline-flex items-center gap-1 text-xs bg-cyan-400/10 text-cyan-400 border border-cyan-400/20 px-2 py-0.5 rounded-full">
                <ShieldCheck className="w-3 h-3" /> Admin
              </span>
            </div>
            <p className="text-white/40 text-sm">{tabMeta[activeTab]?.desc}</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            {activeTab === 'd1' && (
              <>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant={bulkEditMode ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        setBulkEditMode(!bulkEditMode)
                        if (bulkEditMode) setSelectedProducts(new Set())
                      }}
                      className="border-white/10 bg-white/5 hover:bg-white/10 text-white"
                    >
                      {bulkEditMode ? 'Exit Bulk Edit' : 'Bulk Edit'}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">Select multiple products to edit or delete at once</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => syncToSupabaseMutation.mutate()}
                      disabled={syncToSupabaseMutation.isPending}
                      className="flex items-center gap-2 border-white/10 bg-white/5 hover:bg-white/10 text-white"
                    >
                      <RefreshCw className={`h-4 w-4 ${syncToSupabaseMutation.isPending ? 'animate-spin' : ''}`} />
                      {syncToSupabaseMutation.isPending ? 'Syncing...' : 'Sync DB'}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">Sync all D1 data to Supabase</TooltipContent>
                </Tooltip>
                <Dialog
                  open={isCreateModalOpen}
                  onOpenChange={(open) => {
                    setIsCreateModalOpen(open)
                    if (!open) {
                      setEditingProduct(null)
                      resetForm()
                    }
                  }}
                >
                  <DialogTrigger asChild>
                    <Button className="flex items-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-black font-semibold">
                      <Plus className="h-4 w-4" />
                      Add Product
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>{editingProduct ? 'Edit Product' : 'Add New Product'}</DialogTitle>
                    </DialogHeader>

                    {/* Product type tabs — only show when adding new (not editing) */}
                    {!editingProduct && (
                      <div className="flex rounded-lg border border-border overflow-hidden mb-1">
                        <button
                          type="button"
                          onClick={() => setAddProductTab('single')}
                          className={`flex-1 py-2 text-sm font-medium transition-colors ${addProductTab === 'single' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-[#111111] border border-white/10'}`}
                        >
                          Single Image
                        </button>
                        <button
                          type="button"
                          onClick={() => setAddProductTab('dual')}
                          className={`flex-1 py-2 text-sm font-medium transition-colors ${addProductTab === 'dual' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-[#111111] border border-white/10'}`}
                        >
                          Dual Image <span className="ml-1 text-xs opacity-70">(slideshow)</span>
                        </button>
                      </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="name">Product Name</Label>
                          <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="sku">SKU</Label>
                          <Input
                            id="sku"
                            value={formData.sku}
                            onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                          id="description"
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          rows={3}
                        />
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <div>


                          <div className="flex items-center justify-between mb-2">
                            <Label htmlFor="category">Category</Label>
                            {formData.category === 'Wellness' && (
                              <a
                                href="/shop/supplements"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-glacier hover:underline"
                              >
                                View Supplements →
                              </a>
                            )}
                          </div>

                          {isNewCategory ? (
                            <div className="flex items-center gap-2">
                              <Input
                                placeholder="Enter new category name"
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                className="border-glacier ring-1 ring-glacier/20"
                                autoFocus
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => setIsNewCategory(false)}
                                title="Select existing category"
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          ) : (
                            <Select
                              value={categories.includes(formData.category) ? formData.category : 'custom'}
                              onValueChange={(value) => {
                                if (value === 'new_custom_category') {
                                  setIsNewCategory(true);
                                  setFormData({ ...formData, category: '' });
                                } else {
                                  setFormData({ ...formData, category: value });
                                }
                              }}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select Category" />
                              </SelectTrigger>
                              <SelectContent>
                                {categories.map(cat => (
                                  <SelectItem key={cat} value={cat}>
                                    {cat === 'Wellness' ? 'Wellness (Supplements)' : cat}
                                  </SelectItem>
                                ))}
                                <SelectItem value="new_custom_category" className="text-glacier font-medium">
                                  <span className="flex items-center gap-2">
                                    <Plus className="w-3 h-3" /> Create New Category...
                                  </span>
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                        </div>
                        <div>
                          <Label htmlFor="status">Status</Label>
                          <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="In Store">In Store</SelectItem>
                              <SelectItem value="Removal Requested">Removal Requested</SelectItem>
                              <SelectItem value="Removal Pending">Removal Pending</SelectItem>
                              <SelectItem value="Phased Out">Phased Out</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="price">Price</Label>
                          <Input
                            id="price"
                            type="number"
                            step="0.01"
                            value={formData.price}
                            onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="clearance_price">Clearance Price <span className="text-white/40 font-normal">(optional)</span></Label>
                          <Input
                            id="clearance_price"
                            type="number"
                            step="0.01"
                            placeholder="Leave blank if not on clearance"
                            value={formData.clearance_price ?? ''}
                            onChange={(e) => setFormData({ ...formData, clearance_price: e.target.value === '' ? null : parseFloat(e.target.value) })}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="group_name">Group Name</Label>
                          <Input
                            id="group_name"
                            value={formData.group_name}
                            onChange={(e) => setFormData({ ...formData, group_name: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label htmlFor="color">Color/Variant</Label>
                          <Input
                            id="color"
                            value={formData.color}
                            onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="hex_color">Primary Hex Color</Label>
                          <div className="flex items-center gap-2">
                            <Input
                              id="hex_color"
                              value={formData.hex_color}
                              onChange={(e) => setFormData({ ...formData, hex_color: e.target.value })}
                              placeholder="#000000"
                              className="flex-1"
                            />
                            {formData.hex_color && (
                              <div
                                className="w-10 h-10 rounded border border-border flex-shrink-0"
                                style={{ backgroundColor: formData.hex_color }}
                              />
                            )}
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="secondary_hex_color">Secondary Hex Color (Optional)</Label>
                          <div className="flex items-center gap-2">
                            <Input
                              id="secondary_hex_color"
                              value={formData.secondary_hex_color || ''}
                              onChange={(e) => setFormData({ ...formData, secondary_hex_color: e.target.value })}
                              placeholder="#FFFFFF"
                              className="flex-1"
                            />
                            {formData.secondary_hex_color && (
                              <div
                                className="w-10 h-10 rounded border border-border flex-shrink-0"
                                style={{ backgroundColor: formData.secondary_hex_color }}
                              />
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">Creates a split color swatch</p>
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="buy_link">Buy Link</Label>
                        <Input
                          id="buy_link"
                          value={formData.buy_link}
                          onChange={(e) => setFormData({ ...formData, buy_link: e.target.value })}
                          placeholder="https://..."
                        />
                      </div>

                      <div>
                        <Label htmlFor="image">{addProductTab === 'dual' ? 'Primary Image' : 'Product Image'}</Label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div className="flex items-center gap-4">
                            <Input
                              id="image"
                              type="file"
                              accept="image/*"
                              onChange={handleImageChange}
                              className="flex-1"
                            />
                            {imagePreview && (
                              <div className="w-16 h-16 border rounded overflow-hidden">
                                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                              </div>
                            )}
                          </div>
                          <Input
                            value={formData.image_url}
                            onChange={(e) => {
                              const next = e.target.value;
                              setFormData({ ...formData, image_url: next });
                              if (next?.trim()) setImagePreview(next);
                            }}
                            placeholder="Or paste an image URL (recommended if upload is blocked)"
                          />
                        </div>
                      </div>

                      {/* Secondary Image — only shown in Dual Image tab or when editing a dual product */}
                      {(addProductTab === 'dual' || editingProduct) && (
                        <div className={addProductTab === 'dual' || secondaryImagePreview || formData.secondary_image_url ? '' : 'opacity-50'}>
                          <div className="flex items-center gap-2 mb-1">
                            <Label htmlFor="secondary_image">Secondary Image</Label>
                            {addProductTab === 'single' && !editingProduct && (
                              <span className="text-xs text-muted-foreground">(switch to Dual Image tab to enable)</span>
                            )}
                            {(formData.secondary_image_url || secondaryImagePreview) && (
                              <span className="ml-auto text-xs text-emerald-500 font-medium">✓ Slideshow enabled</span>
                            )}
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="flex items-center gap-4">
                              <Input
                                id="secondary_image"
                                type="file"
                                accept="image/*"
                                disabled={addProductTab === 'single' && !editingProduct}
                                onChange={(e) => {
                                  const file = e.target.files?.[0]
                                  if (file) {
                                    setSecondaryImageFile(file)
                                    const reader = new FileReader()
                                    reader.onloadend = () => setSecondaryImagePreview(reader.result as string)
                                    reader.readAsDataURL(file)
                                  }
                                }}
                                className="flex-1"
                              />
                              {secondaryImagePreview && (
                                <div className="w-16 h-16 border rounded overflow-hidden">
                                  <img src={secondaryImagePreview} alt="Secondary preview" className="w-full h-full object-cover" />
                                </div>
                              )}
                            </div>
                            <div className="flex gap-2 items-center">
                              <Input
                                value={formData.secondary_image_url || ''}
                                disabled={addProductTab === 'single' && !editingProduct}
                                onChange={(e) => {
                                  const next = e.target.value;
                                  setFormData({ ...formData, secondary_image_url: next });
                                  if (next?.trim()) setSecondaryImagePreview(next);
                                }}
                                placeholder="Or paste a secondary image URL"
                              />
                              {(formData.secondary_image_url || secondaryImageFile) && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSecondaryImageFile(null)
                                    setSecondaryImagePreview('')
                                    setFormData({ ...formData, secondary_image_url: '' })
                                  }}
                                  className="flex-shrink-0 text-muted-foreground hover:text-destructive"
                                  title="Remove secondary image"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Specifications Editor */}
                      <div>
                        <Label>Specifications</Label>
                        <div className="space-y-2 mt-2">
                          {formData.specifications && Object.entries(formData.specifications).map(([key, value], index) => {
                            const specKey = `spec-item-${index}`
                            return (
                              <div key={specKey} className="flex gap-2">
                                <Input
                                  placeholder="Specification name (e.g., capacity, material)"
                                  value={key}
                                  onChange={(e) => {
                                    const newSpecs = { ...formData.specifications }
                                    const oldKey = key
                                    const newKey = e.target.value
                                    if (oldKey !== newKey) {
                                      delete newSpecs[oldKey]
                                      newSpecs[newKey] = value
                                    }
                                    setFormData({ ...formData, specifications: newSpecs })
                                  }}
                                  className="flex-1"
                                  autoComplete="off"
                                />
                                <Input
                                  placeholder="Value (e.g., 40 oz, Stainless Steel)"
                                  value={Array.isArray(value) ? value.join(', ') : String(value)}
                                  onChange={(e) => {
                                    setFormData({
                                      ...formData,
                                      specifications: { ...formData.specifications, [key]: e.target.value }
                                    })
                                  }}
                                  className="flex-1"
                                  autoComplete="off"
                                />
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    const newSpecs = { ...formData.specifications }
                                    delete newSpecs[key]
                                    setFormData({ ...formData, specifications: newSpecs })
                                  }}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            )
                          })}
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              setFormData({
                                ...formData,
                                specifications: {
                                  ...formData.specifications,
                                  ['']: ''
                                }
                              })
                            }}
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Specification
                          </Button>
                        </div>
                      </div>

                      <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          disabled={
                            editingProduct
                              ? updateProductMutation.isPending
                              : createProductMutation.isPending
                          }
                        >
                          {editingProduct
                            ? (updateProductMutation.isPending ? 'Saving...' : 'Save Changes')
                            : (createProductMutation.isPending ? 'Creating...' : 'Create Product')}
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </>
            )}
          </div>
        </div>

        {/* Tab Bar */}
        <div className="flex items-center gap-1 p-1 bg-white/5 border border-white/10 rounded-xl mb-8 overflow-x-auto">
          {(Object.keys(tabMeta) as Array<keyof typeof tabMeta>).map((key) => {
            const { label, icon: Icon, desc } = tabMeta[key];
            const isActive = activeTab === (key as typeof activeTab);
            return (
              <Tooltip key={key}>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => setActiveTab(key as typeof activeTab)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                      isActive
                        ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                        : 'text-white/40 hover:text-white/80 hover:bg-white/5'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {label}
                  </button>
                </TooltipTrigger>
                <TooltipContent side="bottom">{desc}</TooltipContent>
              </Tooltip>
            );
          })}
        </div>

        {activeTab === 'categories' ? (
          <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">Category Overview</h2>
              <Dialog>
                <DialogTrigger asChild>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button className="bg-cyan-500 hover:bg-cyan-400 text-black font-semibold gap-2">
                        <Plus className="w-4 h-4" /> Add Category
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Create a new product category with its own page and styling</TooltipContent>
                  </Tooltip>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Category</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>Category Name</Label>
                      <Input
                        placeholder="e.g. Gym Gear"
                        value={categoryForm.name}
                        onChange={e => setCategoryForm({ ...categoryForm, name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Slug (optional)</Label>
                      <Input
                        placeholder="gym-gear"
                        value={categoryForm.slug}
                        onChange={e => setCategoryForm({ ...categoryForm, slug: e.target.value })}
                      />
                      <p className="text-xs text-muted-foreground">URL friendly name. Leave empty to auto-generate.</p>
                    </div>
                    <div className="space-y-2">
                      <Label>Description / Subtitle</Label>
                      <Textarea
                        placeholder="Subtitle for the hero section..."
                        value={categoryForm.description}
                        onChange={e => setCategoryForm({ ...categoryForm, description: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Theme Color</Label>
                      <Select
                        value={categoryForm.hero_color}
                        onValueChange={v => setCategoryForm({ ...categoryForm, hero_color: v })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="blue">Blue</SelectItem>
                          <SelectItem value="red">Red</SelectItem>
                          <SelectItem value="green">Green</SelectItem>
                          <SelectItem value="purple">Purple</SelectItem>
                          <SelectItem value="orange">Orange</SelectItem>
                          <SelectItem value="cyan">Cyan</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label>Nav Font</Label>
                        <Select value={categoryForm.nav_font} onValueChange={v => setCategoryForm({ ...categoryForm, nav_font: v })}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="sans">Sans (default)</SelectItem>
                            <SelectItem value="display">Display</SelectItem>
                            <SelectItem value="mono">Mono</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Nav Text Size</Label>
                        <Select value={categoryForm.nav_font_size} onValueChange={v => setCategoryForm({ ...categoryForm, nav_font_size: v })}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="xs">XS</SelectItem>
                            <SelectItem value="sm">SM</SelectItem>
                            <SelectItem value="base">Base (default)</SelectItem>
                            <SelectItem value="lg">LG</SelectItem>
                            <SelectItem value="xl">XL</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Nav Link Color</Label>
                      <div className="flex items-center gap-3">
                        <input
                          type="color"
                          value={categoryForm.nav_color || '#ffffff'}
                          onChange={e => setCategoryForm({ ...categoryForm, nav_color: e.target.value })}
                          className="w-10 h-10 rounded cursor-pointer border border-white/20 bg-transparent"
                        />
                        <Input
                          placeholder="#ffffff (leave empty for default)"
                          value={categoryForm.nav_color}
                          onChange={e => setCategoryForm({ ...categoryForm, nav_color: e.target.value })}
                          className="flex-1"
                        />
                        {categoryForm.nav_color && (
                          <button type="button" onClick={() => setCategoryForm({ ...categoryForm, nav_color: '' })} className="text-xs text-white/50 hover:text-white">Reset</button>
                        )}
                      </div>
                    </div>
                    <Button onClick={handleAddCategory} className="w-full bg-glacier">Create Category</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid gap-8">
              {categories.filter(c => c !== 'all' && c !== 'All').map(cat => (
                <CategoryCard key={cat} categoryName={cat} products={productsByCategory[cat] || []} />
              ))}
              {categories.length === 0 && (
                <div className="text-center py-12 text-slate-500">
                  <p>No categories found. Add one to get started.</p>
                </div>
              )}
            </div>
          </div>
        ) : activeTab === 'changelog' ? (
          <ChangelogContent />
        ) : activeTab === 'inventory' ? (
          <div className="space-y-4">
            {/* Inventory toolbar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-2">
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30" />
                  <Input
                    value={inventorySearch}
                    onChange={e => setInventorySearch(e.target.value)}
                    placeholder="Filter items…"
                    className="pl-8 h-8 w-52 bg-white/5 border-white/10 text-white text-sm placeholder:text-white/30 focus:border-cyan-500/50"
                  />
                </div>
                <div className="flex items-center gap-1 p-0.5 bg-white/5 border border-white/10 rounded-md">
                  <button
                    onClick={() => setInventorySubTab('stock')}
                    className={`px-3 py-1.5 text-xs font-medium transition-all rounded whitespace-nowrap ${inventorySubTab === 'stock' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'text-white/40 hover:text-white/70'}`}
                  >
                    Stock
                  </button>
                  <button
                    onClick={() => setInventorySubTab('records')}
                    className={`px-3 py-1.5 text-xs font-medium transition-all rounded whitespace-nowrap ${inventorySubTab === 'records' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'text-white/40 hover:text-white/70'}`}
                  >
                    Records
                  </button>
                </div>
              </div>
              <p className="text-xs text-white/30 font-mono">
                {inventory.filter((i: any) => !inventorySearch || i.item_name?.toLowerCase().includes(inventorySearch.toLowerCase()) || i.sku?.toLowerCase().includes(inventorySearch.toLowerCase())).length} / {inventory.length} items
              </p>
            </div>

            {inventoryLoading ? (
              <div className="text-center py-12 text-white/40 font-mono text-sm">Loading inventory...</div>
            ) : inventoryError ? (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6">
                <h3 className="text-red-400 font-semibold mb-2 flex items-center gap-2"><AlertTriangle className="w-4 h-4" /> Error Loading Inventory</h3>
                <p className="text-red-300/70 text-sm">{(inventoryError as Error).message}</p>
              </div>
            ) : inventory.length === 0 ? (
              <div className="text-center py-12 text-white/40 font-mono text-sm">No inventory items found.</div>
            ) : inventorySubTab === 'stock' ? (
              <div className="border border-white/10 rounded-lg overflow-hidden">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-white/5 border-b border-white/10">
                      <th className="text-left px-3 py-2 text-xs font-semibold text-white/40 uppercase tracking-wider w-[35%]">Item</th>
                      <th className="text-left px-3 py-2 text-xs font-semibold text-white/40 uppercase tracking-wider w-[18%] font-mono">SKU</th>
                      <th className="text-center px-3 py-2 text-xs font-semibold text-white/40 uppercase tracking-wider w-[12%]">Status</th>
                      <th className="text-center px-3 py-2 text-xs font-semibold text-white/40 uppercase tracking-wider w-[10%] font-mono">Stock</th>
                      <th className="text-center px-3 py-2 text-xs font-semibold text-white/40 uppercase tracking-wider">Delta / Quick</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inventory
                      .filter((item: any) => !inventorySearch || item.item_name?.toLowerCase().includes(inventorySearch.toLowerCase()) || item.sku?.toLowerCase().includes(inventorySearch.toLowerCase()))
                      .map((item: any, idx: number) => {
                        const stockLeft = item.stock_left ?? 0;
                        const isEditing = inlineEditStockId === item.id;
                        const statusColor = stockLeft < 0 ? 'text-red-400 bg-red-500/10 border-red-500/30'
                          : stockLeft === 0 ? 'text-red-400 bg-red-500/10 border-red-500/30'
                          : stockLeft <= 10 ? 'text-orange-400 bg-orange-500/10 border-orange-500/30'
                          : 'text-green-400 bg-green-500/10 border-green-500/30';
                        const statusLabel = stockLeft < 0 ? 'Backordered' : stockLeft === 0 ? 'Out' : stockLeft <= 10 ? 'Low' : 'OK';
                        return (
                          <tr key={item.id} className={`border-b border-white/5 hover:bg-white/[0.03] transition-colors ${idx % 2 === 0 ? '' : 'bg-white/[0.015]'}`}>
                            <td className="px-3 py-2 text-white font-medium truncate max-w-0">
                              <span className="block truncate">{item.item_name || '—'}</span>
                            </td>
                            <td className="px-3 py-2 font-mono text-white/50 text-xs">{item.sku || '—'}</td>
                            <td className="px-3 py-2 text-center">
                              <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold border font-mono tracking-wide ${statusColor}`}>
                                {statusLabel}
                              </span>
                            </td>
                            <td className="px-3 py-2 text-center">
                              {isEditing ? (
                                <input
                                  autoFocus
                                  type="number"
                                  value={inlineEditStockValue}
                                  onChange={e => setInlineEditStockValue(e.target.value)}
                                  onKeyDown={async (e) => {
                                    if (e.key === 'Enter') {
                                      const val = Number(inlineEditStockValue);
                                      if (!Number.isFinite(val)) return;
                                      try {
                                        const { error } = await supabase.from('inventory').update({ stock_left: val }).eq('id', item.id);
                                        if (error) throw error;
                                        queryClient.invalidateQueries({ queryKey: ['inventory'] });
                                        toast.success(`Stock → ${val}`);
                                      } catch { toast.error('Error saving'); }
                                      setInlineEditStockId(null);
                                    } else if (e.key === 'Escape') {
                                      setInlineEditStockId(null);
                                    }
                                  }}
                                  onBlur={async () => {
                                    const val = Number(inlineEditStockValue);
                                    if (Number.isFinite(val)) {
                                      try {
                                        const { error } = await supabase.from('inventory').update({ stock_left: val }).eq('id', item.id);
                                        if (error) throw error;
                                        queryClient.invalidateQueries({ queryKey: ['inventory'] });
                                      } catch { toast.error('Error saving'); }
                                    }
                                    setInlineEditStockId(null);
                                  }}
                                  className="w-16 h-7 bg-cyan-500/10 border border-cyan-500/50 text-cyan-300 text-center text-sm font-mono rounded outline-none focus:border-cyan-400"
                                />
                              ) : (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <button
                                      className={`font-mono font-bold text-sm px-2 py-0.5 rounded hover:bg-white/10 transition-colors cursor-text ${stockLeft < 0 ? 'text-red-400' : stockLeft === 0 ? 'text-red-400' : stockLeft <= 10 ? 'text-orange-400' : 'text-white'}`}
                                      onClick={() => { setInlineEditStockId(item.id); setInlineEditStockValue(String(stockLeft)); }}
                                    >
                                      {stockLeft}
                                    </button>
                                  </TooltipTrigger>
                                  <TooltipContent>Click to set stock directly</TooltipContent>
                                </Tooltip>
                              )}
                            </td>
                            <td className="px-3 py-2">
                              <div className="flex items-center justify-center gap-1.5">
                                <Input
                                  value={inventoryDeltaById[item.id] ?? ''}
                                  onChange={e => setInventoryDeltaById(prev => ({ ...prev, [item.id]: e.target.value }))}
                                  onKeyDown={async (e) => {
                                    if (e.key === 'Enter') {
                                      const delta = Number(inventoryDeltaById[item.id]);
                                      if (!Number.isFinite(delta) || delta === 0) return;
                                      const newStock = stockLeft + delta;
                                      try {
                                        const { error } = await supabase.from('inventory').update({ stock_left: newStock }).eq('id', item.id);
                                        if (error) throw error;
                                        queryClient.invalidateQueries({ queryKey: ['inventory'] });
                                        setInventoryDeltaById(prev => { const n = { ...prev }; delete n[item.id]; return n; });
                                        toast.success(`${delta > 0 ? '+' : ''}${delta} → ${newStock}`);
                                      } catch { toast.error('Error'); }
                                    }
                                  }}
                                  placeholder="±qty"
                                  className="w-16 h-7 bg-white/5 border-white/10 text-white text-center text-xs font-mono"
                                  inputMode="numeric"
                                />
                                <button
                                  className="h-7 w-7 flex items-center justify-center rounded bg-red-500/10 hover:bg-red-500/25 text-red-400 border border-red-500/20 text-xs font-bold transition-colors"
                                  title="Subtract"
                                  onClick={async () => {
                                    const delta = Number(inventoryDeltaById[item.id] ?? 1);
                                    const safeDelta = Number.isFinite(delta) && delta !== 0 ? Math.abs(delta) : 1;
                                    const newStock = stockLeft - safeDelta;
                                    try {
                                      const { error } = await supabase.from('inventory').update({ stock_left: newStock }).eq('id', item.id);
                                      if (error) throw error;
                                      queryClient.invalidateQueries({ queryKey: ['inventory'] });
                                      toast.success(`−${safeDelta} → ${newStock}`);
                                    } catch { toast.error('Error'); }
                                  }}
                                >−</button>
                                <button
                                  className="h-7 w-7 flex items-center justify-center rounded bg-green-500/10 hover:bg-green-500/25 text-green-400 border border-green-500/20 text-xs font-bold transition-colors"
                                  title="Add"
                                  onClick={async () => {
                                    const delta = Number(inventoryDeltaById[item.id] ?? 1);
                                    const safeDelta = Number.isFinite(delta) && delta !== 0 ? Math.abs(delta) : 1;
                                    const newStock = stockLeft + safeDelta;
                                    try {
                                      const { error } = await supabase.from('inventory').update({ stock_left: newStock }).eq('id', item.id);
                                      if (error) throw error;
                                      queryClient.invalidateQueries({ queryKey: ['inventory'] });
                                      toast.success(`+${safeDelta} → ${newStock}`);
                                    } catch { toast.error('Error'); }
                                  }}
                                >+</button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            ) : (
              /* Adjust Records — update stock_bought */
              <div className="border border-white/10 rounded-lg overflow-hidden">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-white/5 border-b border-white/10">
                      <th className="text-left px-3 py-2 text-xs font-semibold text-white/40 uppercase tracking-wider w-[35%]">Item</th>
                      <th className="text-left px-3 py-2 text-xs font-semibold text-white/40 uppercase tracking-wider w-[18%] font-mono">SKU</th>
                      <th className="text-center px-3 py-2 text-xs font-semibold text-white/40 uppercase tracking-wider font-mono">Purchased</th>
                      <th className="text-center px-3 py-2 text-xs font-semibold text-white/40 uppercase tracking-wider">Set New Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inventory
                      .filter((item: any) => !inventorySearch || item.item_name?.toLowerCase().includes(inventorySearch.toLowerCase()) || item.sku?.toLowerCase().includes(inventorySearch.toLowerCase()))
                      .map((item: any, idx: number) => (
                        <tr key={item.id} className={`border-b border-white/5 hover:bg-white/[0.03] transition-colors ${idx % 2 === 0 ? '' : 'bg-white/[0.015]'}`}>
                          <td className="px-3 py-2 text-white font-medium truncate max-w-0">
                            <span className="block truncate">{item.item_name || '—'}</span>
                          </td>
                          <td className="px-3 py-2 font-mono text-white/50 text-xs">{item.sku || '—'}</td>
                          <td className="px-3 py-2 text-center font-mono text-white/70 font-semibold">{item.stock_bought ?? 0}</td>
                          <td className="px-3 py-2">
                            <div className="flex items-center justify-center gap-1.5">
                              <Input
                                value={stockBoughtById[item.id] ?? ''}
                                onChange={e => setStockBoughtById(prev => ({ ...prev, [item.id]: e.target.value }))}
                                onKeyDown={async (e) => {
                                  if (e.key === 'Enter') {
                                    const val = Number(stockBoughtById[item.id]);
                                    if (!Number.isFinite(val)) { toast.error('Enter a valid number'); return; }
                                    try {
                                      const { error } = await supabase.from('inventory').update({ stock_bought: val }).eq('id', item.id);
                                      if (error) throw error;
                                      queryClient.invalidateQueries({ queryKey: ['inventory'] });
                                      setStockBoughtById(prev => { const n = { ...prev }; delete n[item.id]; return n; });
                                      toast.success('Record updated!');
                                    } catch { toast.error('Error updating record'); }
                                  }
                                }}
                                placeholder={String(item.stock_bought ?? 0)}
                                className="w-20 h-7 bg-white/5 border-white/10 text-white text-center text-xs font-mono"
                                inputMode="numeric"
                              />
                              <button
                                className="h-7 px-2 flex items-center justify-center rounded bg-cyan-500/10 hover:bg-cyan-500/25 text-cyan-400 border border-cyan-500/20 text-xs font-semibold transition-colors"
                                onClick={async () => {
                                  const val = Number(stockBoughtById[item.id]);
                                  if (!Number.isFinite(val)) { toast.error('Enter a valid number'); return; }
                                  try {
                                    const { error } = await supabase.from('inventory').update({ stock_bought: val }).eq('id', item.id);
                                    if (error) throw error;
                                    queryClient.invalidateQueries({ queryKey: ['inventory'] });
                                    setStockBoughtById(prev => { const n = { ...prev }; delete n[item.id]; return n; });
                                    toast.success('Record updated!');
                                  } catch { toast.error('Error updating record'); }
                                }}
                              >Set</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : activeTab === 'analytics' ? (
          <AnalyticsDashboard />
        ) : activeTab === 'posts' ? (
          <SocialPostsManager />
        ) : (
          <>
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-6">
              <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="relative w-full sm:w-[320px]">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                      <Input
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search name, SKU, category…"
                        className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-cyan-500/50"
                      />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>Search by name, SKU, category, color, or status</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <div>
                      <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                        <SelectTrigger className="w-full sm:w-56 bg-white/5 border-white/10 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map(category => (
                            <SelectItem key={category} value={category}>
                              {category === 'all' ? 'All Categories' : category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>Filter products by category</TooltipContent>
                </Tooltip>
              </div>
            </div>

            {bulkEditMode && (
              <Card className="p-4 bg-[#0a0a0a] border border-cyan-500/20 shadow-[0_0_20px_rgba(6,182,212,0.05)]">
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30">{selectedProducts.size} selected</Badge>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button type="button" variant="ghost" size="sm" onClick={selectAllProducts} className="text-white/60 hover:text-white">
                            Select All ({filteredProducts.length})
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Select all visible products</TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button type="button" variant="ghost" size="sm" onClick={deselectAllProducts} disabled={selectedProducts.size === 0} className="text-white/60 hover:text-white">
                            Deselect All
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Clear selection</TooltipContent>
                      </Tooltip>
                    </div>
                  </div>

                  {selectedProducts.size > 0 && (
                    <div className="flex flex-wrap gap-2">
                      <Select onValueChange={(value) => handleBulkUpdate('status', value)}>
                        <SelectTrigger className="w-[200px]">
                          <SelectValue placeholder="Change Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="In Store">In Store</SelectItem>
                          <SelectItem value="Removal Requested">Removal Requested</SelectItem>
                          <SelectItem value="Removal Pending">Removal Pending</SelectItem>
                          <SelectItem value="Phased Out">Phased Out</SelectItem>
                        </SelectContent>
                      </Select>

                      <Select onValueChange={(value) => handleBulkUpdate('category', value)}>
                        <SelectTrigger className="w-[200px]">
                          <SelectValue placeholder="Change Category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((c) => (
                            <SelectItem key={c} value={c}>{c}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            type="button"
                            size="sm"
                            className="bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/20"
                            onClick={() => {
                              if (window.confirm(`Delete ${selectedProducts.size} products?`)) {
                                Promise.all(
                                  Array.from(selectedProducts).map(id => ProductService.deleteProduct(id))
                                ).then(() => {
                                  queryClient.invalidateQueries({ queryKey: ['products'] })
                                  toast.success('Products deleted!')
                                  setSelectedProducts(new Set())
                                })
                              }
                            }}
                          >
                            Delete Selected
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Permanently delete all selected products</TooltipContent>
                      </Tooltip>
                    </div>
                  )}
                </div>
              </Card>
            )}

            {isLoading ? (
              <div className="text-center py-16 text-white/40">Loading products...</div>
            ) : Object.keys(groupedProducts).length === 0 ? (
              <div className="text-center py-16 text-white/40">No products found.</div>
            ) : (
              <div className="space-y-6">
                {Object.entries(groupedProducts).map(([groupName, productsInGroup]) => (
                  <div key={groupName} className="space-y-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-base sm:text-lg font-semibold text-white/90">{groupName}</h2>
                      <Badge variant="secondary" className="text-xs bg-white/5 text-white/40 border-white/10">{productsInGroup.length} variant{productsInGroup.length !== 1 ? 's' : ''}</Badge>
                      <div className="ml-auto flex items-center gap-2 flex-wrap justify-end">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              type="button"
                              size="sm"
                              disabled={updateVariantOrderMutation.isPending}
                              onClick={() => saveGroupOrder(groupName)}
                              className="border-white/10 bg-white/5 hover:bg-white/10 text-white text-xs"
                            >
                              {updateVariantOrderMutation.isPending ? 'Saving…' : 'Save order'}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Persist the current drag-drop order to the database</TooltipContent>
                        </Tooltip>
                      </div>
                    </div>
                    <div className="space-y-2">
                      {productsInGroup.map((product, index) => (
                        <Card key={product.id} className="p-4 group bg-[#0a0a0a] border-white/8 hover:border-white/20 transition-all duration-200">
                          <div
                            className="flex items-center gap-4"
                            draggable
                            onDragStart={() => setDraggingId(product.id)}
                            onDragEnd={() => setDraggingId(null)}
                            onDragOver={(e) => {
                              e.preventDefault()
                            }}
                            onDrop={(e) => {
                              e.preventDefault()
                              reorderGroupAndPersist(groupName, product.id)
                            }}
                          >
                            {bulkEditMode && (
                              <button
                                type="button"
                                onClick={() => toggleProductSelection(product.id)}
                                className="flex-shrink-0"
                              >
                                {selectedProducts.has(product.id) ? (
                                  <CheckSquare className="h-5 w-5 text-primary" />
                                ) : (
                                  <Square className="h-5 w-5 text-muted-foreground" />
                                )}
                              </button>
                            )}
                            <div className="w-8 h-8 rounded-full bg-[#111111] border border-white/10 border flex items-center justify-center text-sm font-semibold flex-shrink-0">
                              {index + 1}
                            </div>
                            <div className="w-16 h-16 bg-black border border-white/10 hover:border-white/30 transition-all duration-300 rounded-lg flex-shrink-0" title="Item Details">
                              {product.image_url && product.status !== 'Phased Out' ? (
                                <img
                                  src={product.image_url}
                                  alt={product.name}
                                  className="w-full h-full object-cover rounded-lg"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <ImageIcon className="h-6 w-6 text-muted-foreground/40" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2 sm:gap-3 flex-wrap">
                                <div className="min-w-0">
                                  <h3 className="font-semibold text-sm sm:text-base truncate">{product.name}</h3>
                                  <p className="text-xs sm:text-sm text-muted-foreground truncate font-mono">{product.sku}</p>
                                  {inventoryMap[product.sku] !== undefined && (
                                    <p className="text-xs font-mono font-medium mt-0.5">
                                      <span className="text-white/30">stk </span>
                                      <span className={
                                        inventoryMap[product.sku] < 0 ? 'text-red-500' :
                                          inventoryMap[product.sku] === 0 ? 'text-red-500' :
                                            inventoryMap[product.sku] <= 10 ? 'text-orange-500' :
                                              'text-green-500'
                                      }>
                                        {inventoryMap[product.sku]}
                                      </span>
                                    </p>
                                  )}
                                  <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                                    <Badge variant="secondary" className="text-xs">{product.category}</Badge>
                                    {/* Inline status editor */}
                                    {inlineEditStatusId === product.id ? (
                                      <select
                                        autoFocus
                                        className="text-xs bg-[#111] border border-white/20 text-white rounded px-1 py-0.5 outline-none focus:border-cyan-500/50"
                                        defaultValue={product.status || 'In Store'}
                                        onChange={async (e) => {
                                          const newStatus = e.target.value;
                                          updateProductMutation.mutate({ id: product.id, status: newStatus });
                                          setInlineEditStatusId(null);
                                        }}
                                        onBlur={() => setInlineEditStatusId(null)}
                                      >
                                        <option value="In Store">In Store</option>
                                        <option value="Removal Requested">Removal Requested</option>
                                        <option value="Removal Pending">Removal Pending</option>
                                        <option value="Phased Out">Phased Out</option>
                                      </select>
                                    ) : (
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <button
                                            type="button"
                                            onClick={() => setInlineEditStatusId(product.id)}
                                            className={`text-xs px-1.5 py-0.5 rounded font-medium border cursor-pointer hover:opacity-80 transition-opacity ${
                                              product.status === 'In Store' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                                              product.status === 'Removal Requested' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                                              product.status === 'Removal Pending' ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' :
                                              product.status === 'Phased Out' ? 'bg-gray-500/20 text-gray-400 border-gray-500/30' :
                                              'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                                            }`}
                                          >
                                            {product.status}
                                          </button>
                                        </TooltipTrigger>
                                        <TooltipContent>Click to change status</TooltipContent>
                                      </Tooltip>
                                    )}
                                    {product.color && (
                                      <div className="flex items-center gap-1">
                                        {product.hex_color && (
                                          <div
                                            className="w-3 h-3 rounded border border-border overflow-hidden"
                                            style={{
                                              background: product.secondary_hex_color
                                                ? `linear-gradient(135deg, ${product.hex_color} 50%, ${product.secondary_hex_color} 50%)`
                                                : product.hex_color
                                            }}
                                          />
                                        )}
                                        <span className="text-xs text-muted-foreground">{product.color}</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                                <div className="text-right flex-shrink-0">
                                  {/* Inline price editor */}
                                  {inlineEditPriceId === product.id ? (
                                    <input
                                      autoFocus
                                      type="number"
                                      step="0.01"
                                      defaultValue={product.clearance_price != null ? Number(product.clearance_price) : product.price}
                                      className="w-20 h-8 bg-cyan-500/10 border border-cyan-500/50 text-cyan-300 text-right text-sm font-bold font-mono rounded px-1 outline-none focus:border-cyan-400"
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                          const val = parseFloat((e.target as HTMLInputElement).value);
                                          if (!isNaN(val)) {
                                            if (product.clearance_price != null) {
                                              updateProductMutation.mutate({ id: product.id, clearance_price: val });
                                            } else {
                                              updateProductMutation.mutate({ id: product.id, price: val });
                                            }
                                          }
                                          setInlineEditPriceId(null);
                                        } else if (e.key === 'Escape') {
                                          setInlineEditPriceId(null);
                                        }
                                      }}
                                      onBlur={(e) => {
                                        const val = parseFloat(e.target.value);
                                        if (!isNaN(val)) {
                                          if (product.clearance_price != null) {
                                            updateProductMutation.mutate({ id: product.id, clearance_price: val });
                                          } else {
                                            updateProductMutation.mutate({ id: product.id, price: val });
                                          }
                                        }
                                        setInlineEditPriceId(null);
                                      }}
                                    />
                                  ) : (
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <button
                                          type="button"
                                          onClick={() => setInlineEditPriceId(product.id)}
                                          className="hover:opacity-70 transition-opacity cursor-text"
                                        >
                                          {product.clearance_price != null ? (
                                            <div className="flex flex-col items-end gap-0.5">
                                              <div className="text-sm sm:text-lg font-bold text-green-400 font-mono">${Number(product.clearance_price).toFixed(2)}</div>
                                              <div className="text-xs text-red-400 line-through font-mono">${product.price.toFixed(2)}</div>
                                            </div>
                                          ) : (
                                            <div className="text-sm sm:text-lg font-bold text-glacier font-mono">${product.price.toFixed(2)}</div>
                                          )}
                                        </button>
                                      </TooltipTrigger>
                                      <TooltipContent>Click to edit {product.clearance_price != null ? 'clearance' : ''} price</TooltipContent>
                                    </Tooltip>
                                  )}
                                  <div className="flex gap-1 mt-2 justify-end">
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="h-7 w-7 p-0 text-white/50 hover:text-white"
                                            onClick={(e) => {
                                              e.stopPropagation()
                                              moveVariant(groupName, product.id, 'up')
                                            }}
                                            disabled={productsInGroup.findIndex(p => p.id === product.id) === 0}
                                          >
                                            <MoveUp className="h-3 w-3" />
                                          </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>Move variant up</TooltipContent>
                                      </Tooltip>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="h-7 w-7 p-0 text-white/50 hover:text-white"
                                            onClick={(e) => {
                                              e.stopPropagation()
                                              moveVariant(groupName, product.id, 'down')
                                            }}
                                            disabled={productsInGroup.findIndex(p => p.id === product.id) === productsInGroup.length - 1}
                                          >
                                            <MoveDown className="h-3 w-3" />
                                          </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>Move variant down</TooltipContent>
                                      </Tooltip>
                                    </div>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button
                                          type="button"
                                          size="sm"
                                          className="h-7 w-7 p-0 bg-white/10 hover:bg-cyan-500/20 text-white hover:text-cyan-400 border border-white/10"
                                          onClick={() => handleEdit(product)}
                                        >
                                          <Edit className="h-3 w-3" />
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent>Edit product</TooltipContent>
                                    </Tooltip>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button
                                          type="button"
                                          variant="destructive"
                                          size="sm"
                                          className="h-7 w-7 p-0 bg-red-500/20 hover:bg-red-500/40 text-red-400 border border-red-500/20"
                                          onClick={() => handleDelete(product.id)}
                                        >
                                          <Trash2 className="h-3 w-3" />
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent>Delete product</TooltipContent>
                                    </Tooltip>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

    </div>
  )
}

// Helper component for Category Card to handle its own metadata fetching
function CategoryCard({ categoryName, products }: { categoryName: string, products: Product[] }) {
  const [metadata, setMetadata] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', slug: '', hero_color: '', description: '', nav_font: 'sans', nav_font_size: 'base', nav_color: '' });

  useEffect(() => {
    ProductService.getCategoryMetadata(categoryName).then(data => {
      if (data) setMetadata(data);
    });
  }, [categoryName]);

  const handleDelete = async () => {
    if (!metadata?.id) {
      toast.error("Cannot delete: Category metadata not found (try creating it explicitly first)");
      return;
    }
    if (confirm(`Are you sure you want to delete category "${categoryName}"? This will NOT delete products, but they will be uncategorized.`)) {
      const { error } = await ProductService.deleteCategory(metadata.id);
      if (error) toast.error("Failed to delete");
      else {
        toast.success("Category deleted");
        window.location.reload();
      }
    }
  }

  const handleUpdate = async () => {
    if (!metadata?.id) return;
    try {
      const { error } = await ProductService.updateCategory(metadata.id, editForm);
      if (error) throw error;
      toast.success("Category updated");
      setIsEditOpen(false);
      window.location.reload();
    } catch (e: any) {
      toast.error("Failed to update: " + e.message);
    }
  }

  const openEdit = () => {
    if (metadata) {
      setEditForm({
        name: metadata.name || categoryName,
        slug: metadata.slug || '',
        hero_color: metadata.hero_color || 'blue',
        description: metadata.description || '',
        nav_font: metadata.nav_font || 'sans',
        nav_font_size: metadata.nav_font_size || 'base',
        nav_color: metadata.nav_color || '',
      });
      setIsEditOpen(true);
    } else {
      toast.error("Metadata not found in DB. This might be a legacy category.");
    }
  }

  return (
    <Card className="p-6 bg-[#0a0a0a] border-white/8 hover:border-white/15 transition-all">
      <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-3">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-white text-base">{categoryName}</span>
          <span className="text-xs text-white/40">{products.length} products</span>
          {metadata && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-white/40">
              {metadata.hero_color} theme
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
            <DialogTrigger asChild>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button size="sm" variant="outline" onClick={openEdit} className="h-8 gap-1 border-white/10 bg-white/5 hover:bg-white/10 text-white">
                    <Pencil className="w-3 h-3" /> Edit
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Edit category name, slug, theme color, and nav settings</TooltipContent>
              </Tooltip>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Edit Category</DialogTitle></DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Slug</Label>
                  <Input value={editForm.slug} onChange={e => setEditForm({ ...editForm, slug: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea value={editForm.description} onChange={e => setEditForm({ ...editForm, description: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Theme Color</Label>
                  <Select value={editForm.hero_color} onValueChange={v => setEditForm({ ...editForm, hero_color: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="blue">Blue</SelectItem>
                      <SelectItem value="red">Red</SelectItem>
                      <SelectItem value="green">Green</SelectItem>
                      <SelectItem value="purple">Purple</SelectItem>
                      <SelectItem value="orange">Orange</SelectItem>
                      <SelectItem value="cyan">Cyan</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Nav Font</Label>
                    <Select value={editForm.nav_font} onValueChange={v => setEditForm({ ...editForm, nav_font: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sans">Sans (default)</SelectItem>
                        <SelectItem value="display">Display</SelectItem>
                        <SelectItem value="mono">Mono</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Nav Text Size</Label>
                    <Select value={editForm.nav_font_size} onValueChange={v => setEditForm({ ...editForm, nav_font_size: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="xs">XS</SelectItem>
                        <SelectItem value="sm">SM</SelectItem>
                        <SelectItem value="base">Base (default)</SelectItem>
                        <SelectItem value="lg">LG</SelectItem>
                        <SelectItem value="xl">XL</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Nav Link Color</Label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={editForm.nav_color || '#ffffff'}
                      onChange={e => setEditForm({ ...editForm, nav_color: e.target.value })}
                      className="w-10 h-10 rounded cursor-pointer border border-white/20 bg-transparent"
                    />
                    <Input
                      placeholder="#ffffff (leave empty for default)"
                      value={editForm.nav_color}
                      onChange={e => setEditForm({ ...editForm, nav_color: e.target.value })}
                      className="flex-1"
                    />
                    {editForm.nav_color && (
                      <button type="button" onClick={() => setEditForm({ ...editForm, nav_color: '' })} className="text-xs text-white/50 hover:text-white">Reset</button>
                    )}
                  </div>
                </div>
                <Button onClick={handleUpdate} className="w-full bg-glacier">Save Changes</Button>
              </div>
            </DialogContent>
          </Dialog>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button size="sm" onClick={handleDelete} className="h-8 gap-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/20">
                <Trash className="w-3 h-3" /> Delete
              </Button>
            </TooltipTrigger>
            <TooltipContent>Delete this category (products are not deleted)</TooltipContent>
          </Tooltip>
        </div>
      </div>

      {products.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {products.map(prod => (
            <div key={prod.id} className="flex items-center gap-3 p-3 rounded-lg border border-white/5 bg-white/3 hover:bg-white/5 transition-colors">
              {prod.image_url ? (
                <img src={prod.image_url} alt={prod.name} className="w-9 h-9 rounded object-cover bg-white/5 flex-shrink-0" />
              ) : (
                <div className="w-9 h-9 rounded bg-white/5 flex items-center justify-center flex-shrink-0">
                  <ImageIcon className="w-4 h-4 text-white/20" />
                </div>
              )}
              <div className="min-w-0">
                <p className="font-medium text-sm truncate text-white/80">{prod.name}</p>
                <p className={`text-xs ${prod.status === 'Phased Out' ? 'text-red-400' : 'text-white/30'}`}>
                  {prod.status}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-white/30 text-sm italic">No products in this category.</p>
      )}
    </Card>
  )
}

// Changelog Content Component
const ChangelogContent = () => {
  const changes = changelogData;

  const typeConfig: { [key: string]: { color: string; icon: any; bg: string } } = {
    "Major Update": { color: "text-purple-400", icon: Rocket, bg: "bg-purple-500/10 border-purple-500/20" },
    "Major Updates": { color: "text-purple-400", icon: Rocket, bg: "bg-purple-500/10 border-purple-500/20" },
    "Infrastructure Migration": { color: "text-indigo-400", icon: Zap, bg: "bg-indigo-500/10 border-indigo-500/20" },
    "UI/UX Improvements": { color: "text-blue-400", icon: Sparkles, bg: "bg-blue-500/10 border-blue-500/20" },
    "Team Page & Infrastructure": { color: "text-emerald-400", icon: Zap, bg: "bg-emerald-500/10 border-emerald-500/20" },
    "Minor Updates": { color: "text-cyan-400", icon: Wrench, bg: "bg-cyan-500/10 border-cyan-500/20" },
    "Minor Fixes": { color: "text-amber-400", icon: Bug, bg: "bg-amber-500/10 border-amber-500/20" },
    "Bug fixes and patches": { color: "text-amber-400", icon: Bug, bg: "bg-amber-500/10 border-amber-500/20" },
    "Stable Release": { color: "text-green-400", icon: Sparkles, bg: "bg-green-500/10 border-green-500/20" },
    "Dev Push": { color: "text-orange-400", icon: Rocket, bg: "bg-orange-500/10 border-orange-500/20" },
    "Initial Launch": { color: "text-pink-400", icon: Rocket, bg: "bg-pink-500/10 border-pink-500/20" },
    "Supabase Tweaks and General Product Management Updates": { color: "text-indigo-400", icon: Wrench, bg: "bg-indigo-500/10 border-indigo-500/20" },
    "Updates": { color: "text-sky-400", icon: Wrench, bg: "bg-sky-500/10 border-sky-500/20" },
    "Mobile Optimization & UI Improvements": { color: "text-blue-400", icon: Sparkles, bg: "bg-blue-500/10 border-blue-500/20" },
    "Mobile Optimization & Infrastructure": { color: "text-blue-400", icon: Zap, bg: "bg-blue-500/10 border-blue-500/20" },
    "Mobile UX & Checkout Improvements": { color: "text-blue-400", icon: Sparkles, bg: "bg-blue-500/10 border-blue-500/20" },
    "Bug Fixes & Cleanup": { color: "text-amber-400", icon: Bug, bg: "bg-amber-500/10 border-amber-500/20" },
    "Minor Tweaks & Patches": { color: "text-cyan-400", icon: Wrench, bg: "bg-cyan-500/10 border-cyan-500/20" },
  };

  return (
    <div className="space-y-12 max-w-4xl">
      <div>
        <h2 className="font-display text-3xl font-bold mb-2">Changelog</h2>
        <p className="text-muted-foreground mb-8">
          Track our latest updates, improvements, and releases.
        </p>
      </div>

      <div className="space-y-12">
        {changes.map((change, index) => {
          const config = typeConfig[change.type] || { color: "text-gray-400", icon: Wrench, bg: "bg-gray-500/10 border-gray-500/20" };
          const Icon = config.icon;
          const isLatest = index === 0;

          return (
            <div key={change.version} className={`relative pl-8 border-l-2 ${isLatest ? 'border-primary' : 'border-border/50'}`}>
              <div className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full ${isLatest ? 'bg-primary' : 'bg-[#111111] border border-white/10'} flex items-center justify-center`}>
                {isLatest && <span className="w-2 h-2 rounded-full bg-black text-white border border-white/10 animate-pulse" />}
              </div>

              <div className="flex flex-wrap items-center gap-3 mb-4">
                <h3 className={`text-2xl font-bold font-display ${isLatest ? 'text-primary' : ''}`}>v{change.version}</h3>
                <Badge variant="outline" className={`text-xs ${config.bg} ${config.color} border`}>
                  <Icon className="w-3 h-3 mr-1" />
                  {change.type}
                </Badge>
                {isLatest && <Badge className="bg-primary/20 text-primary border-primary/30 text-xs">Latest</Badge>}
                <span className="text-sm text-muted-foreground ml-auto">
                  {change.date}
                </span>
              </div>

              <ul className="space-y-2">
                {change.items.map((item, i) => (
                  <li key={i} className="text-muted-foreground flex items-start gap-3">
                    <span className="mt-2 w-1.5 h-1.5 rounded-full bg-[#111111] border border-white/10-foreground/40 shrink-0" />
                    <span className="leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProductManagement
