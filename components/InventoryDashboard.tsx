import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { InventoryService, InventorySummary, InventoryItem } from '@/lib/inventory'
import { Package, AlertTriangle, TrendingUp, DollarSign, Activity } from 'lucide-react'

export function InventoryDashboard() {
  const [summary, setSummary] = useState<InventorySummary | null>(null)
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [isLive, setIsLive] = useState(false)
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    // Initial fetch
    const fetchData = async () => {
      const summaryData = await InventoryService.getInventorySummary()
      const inventoryData = await InventoryService.getAllInventory()
      setSummary(summaryData)
      setInventory(inventoryData)
    }

    fetchData()

    // Subscribe to realtime changes
    const summaryChannel = InventoryService.subscribeToInventorySummaryChanges((payload) => {
      setIsConnected(true)
      setIsLive(true)
      setTimeout(() => setIsLive(false), 2000)
      
      if (payload.eventType === 'UPDATE') {
        setSummary(payload.new)
      }
    })

    const inventoryChannel = InventoryService.subscribeToInventoryChanges((payload) => {
      setIsConnected(true)
      setIsLive(true)
      setTimeout(() => setIsLive(false), 2000)
      
      if (payload.eventType === 'INSERT') {
        setInventory(prev => [...prev, payload.new])
      } else if (payload.eventType === 'UPDATE') {
        setInventory(prev => prev.map(item => 
          item.id === payload.new.id ? payload.new : item
        ))
      } else if (payload.eventType === 'DELETE') {
        setInventory(prev => prev.filter(item => item.id !== payload.old.id))
      }
    })

    // Set connected after channels are set up
    setTimeout(() => setIsConnected(true), 1000)

    return () => {
      summaryChannel.unsubscribe()
      inventoryChannel.unsubscribe()
    }
  }, [])

  const backorderedItems = inventory.filter(item => item.stock_left < 0)
  const outOfStockItems = inventory.filter(item => item.stock_left === 0)
  const lowStockItems = inventory.filter(item => item.stock_left > 0 && item.stock_left <= 10)
  const inStockItems = inventory.filter(item => item.stock_left > 10)

  return (
    <div className="space-y-6">
      {/* Realtime Indicator */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Inventory Overview</h2>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-background border">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
          <Activity className={`w-4 h-4 ${isLive ? 'text-green-500' : isConnected ? 'text-green-500/60' : 'text-red-500'}`} />
          <span className="text-sm font-medium">
            {isLive ? 'Live Update' : isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-red-500/10 to-red-600/10 border-red-500/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Backordered</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{backorderedItems.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Negative stock
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/10 to-green-600/10 border-green-500/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Stock</CardTitle>
            <Package className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{inStockItems.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {summary?.total_quantity || 0} units total
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/10 border-yellow-500/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
            <TrendingUp className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{lowStockItems.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              ≤10 units left
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-gray-500/10 to-gray-600/10 border-gray-500/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
            <Package className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{outOfStockItems.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              0 units
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Alerts */}
      {(backorderedItems.length > 0 || outOfStockItems.length > 0 || lowStockItems.length > 0) && (
        <div className="space-y-3">
          {backorderedItems.length > 0 && (
            <Card className="border-red-500/50 bg-red-500/5">
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                  Backordered ({backorderedItems.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {backorderedItems.map(item => (
                    <Badge key={item.id} variant="destructive">
                      {item.sku}: {item.stock_left}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {outOfStockItems.length > 0 && (
            <Card className="border-gray-500/50 bg-gray-500/5">
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Package className="w-4 h-4 text-gray-500" />
                  Out of Stock ({outOfStockItems.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {outOfStockItems.map(item => (
                    <Badge key={item.id} variant="outline" className="border-gray-500/50">
                      {item.sku}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {lowStockItems.length > 0 && (
            <Card className="border-yellow-500/50 bg-yellow-500/5">
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-500" />
                  Low Stock ({lowStockItems.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {lowStockItems.map(item => (
                    <Badge key={item.id} variant="outline" className="border-yellow-500/50">
                      {item.sku}: {item.stock_left} left
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}
