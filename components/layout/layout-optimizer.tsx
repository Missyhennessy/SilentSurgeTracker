import { useState, useEffect } from "react";
import { 
  Maximize, 
  Minimize, 
  Monitor,
  Grid3x3,
  Sidebar,
  Eye,
  Settings,
  Palette,
  Layout,
  Fullscreen,
  LayoutGrid,
  PanelLeftOpen,
  PanelLeftClose,
  Zap,
  Moon,
  Sun,
  Contrast
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface LayoutOptimizerProps {
  onLayoutChange?: (layout: LayoutConfig) => void;
  onFullscreenToggle?: (isFullscreen: boolean) => void;
  onSidebarToggle?: (isVisible: boolean) => void;
}

interface LayoutConfig {
  density: 'compact' | 'comfortable' | 'spacious';
  sidebarWidth: number;
  headerHeight: number;
  cardSpacing: number;
  animationSpeed: number;
  colorScheme: 'auto' | 'light' | 'dark' | 'blue' | 'green';
  fontSize: number;
  showAnimations: boolean;
  autoHideSidebar: boolean;
  fullscreenMode: 'off' | 'content' | 'immersive' | 'zen';
  gridDensity: 'loose' | 'normal' | 'dense';
  focusMode: boolean;
}

const defaultLayout: LayoutConfig = {
  density: 'comfortable',
  sidebarWidth: 256,
  headerHeight: 80,
  cardSpacing: 16,
  animationSpeed: 200,
  colorScheme: 'auto',
  fontSize: 14,
  showAnimations: true,
  autoHideSidebar: false,
  fullscreenMode: 'off',
  gridDensity: 'normal',
  focusMode: false,
};

export default function LayoutOptimizer({ 
  onLayoutChange, 
  onFullscreenToggle, 
  onSidebarToggle 
}: LayoutOptimizerProps) {
  const [layout, setLayout] = useState<LayoutConfig>(defaultLayout);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [savedLayouts, setSavedLayouts] = useState<Array<{name: string, config: LayoutConfig}>>([]);

  // Apply layout changes to CSS variables
  useEffect(() => {
    const root = document.documentElement;
    
    // Apply spacing and sizing
    root.style.setProperty('--sidebar-width', `${layout.sidebarWidth}px`);
    root.style.setProperty('--header-height', `${layout.headerHeight}px`);
    root.style.setProperty('--card-spacing', `${layout.cardSpacing}px`);
    root.style.setProperty('--animation-speed', `${layout.animationSpeed}ms`);
    root.style.setProperty('--font-size-base', `${layout.fontSize}px`);
    
    // Apply density classes
    root.className = root.className.replace(/density-\w+/, '');
    root.classList.add(`density-${layout.density}`);
    
    // Apply fullscreen mode
    root.className = root.className.replace(/fullscreen-\w+/, '');
    if (layout.fullscreenMode !== 'off') {
      root.classList.add(`fullscreen-${layout.fullscreenMode}`);
    }
    
    // Apply grid density
    root.className = root.className.replace(/grid-\w+/, '');
    root.classList.add(`grid-${layout.gridDensity}`);
    
    // Toggle animations
    if (!layout.showAnimations) {
      root.classList.add('no-animations');
    } else {
      root.classList.remove('no-animations');
    }
    
    // Focus mode
    if (layout.focusMode) {
      root.classList.add('focus-mode');
    } else {
      root.classList.remove('focus-mode');
    }

    onLayoutChange?.(layout);
  }, [layout, onLayoutChange]);

  const presets = [
    {
      name: 'Default',
      description: 'Standard professional layout',
      config: defaultLayout,
      icon: Monitor,
    },
    {
      name: 'Compact Pro',
      description: 'Maximum information density',
      config: {
        ...defaultLayout,
        density: 'compact' as const,
        sidebarWidth: 200,
        headerHeight: 60,
        cardSpacing: 8,
        gridDensity: 'dense' as const,
        fontSize: 13,
      },
      icon: Grid3x3,
    },
    {
      name: 'Focus Mode',
      description: 'Distraction-free analysis',
      config: {
        ...defaultLayout,
        fullscreenMode: 'zen' as const,
        autoHideSidebar: true,
        focusMode: true,
        showAnimations: false,
      },
      icon: Eye,
    },
    {
      name: 'Presentation',
      description: 'Large screen optimized',
      config: {
        ...defaultLayout,
        density: 'spacious' as const,
        sidebarWidth: 300,
        headerHeight: 100,
        cardSpacing: 24,
        fontSize: 16,
        gridDensity: 'loose' as const,
      },
      icon: Fullscreen,
    },
  ];

  const handleFullscreenToggle = () => {
    const newState = !isFullscreen;
    setIsFullscreen(newState);
    
    if (newState) {
      document.documentElement.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
    
    onFullscreenToggle?.(newState);
  };

  const saveCurrentLayout = () => {
    const name = `Layout ${savedLayouts.length + 1}`;
    setSavedLayouts(prev => [...prev, { name, config: layout }]);
  };

  const loadLayout = (config: LayoutConfig) => {
    setLayout(config);
  };

  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold text-white">Layout Optimizer</h2>
          <Badge variant="outline" className="text-blue-400">
            {layout.fullscreenMode !== 'off' ? 'Optimized' : 'Standard'}
          </Badge>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleFullscreenToggle}
            className="border-gray-600 hover:bg-gray-700"
          >
            {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
            {isFullscreen ? 'Exit' : 'Fullscreen'}
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPreviewMode(!previewMode)}
            className="border-gray-600 hover:bg-gray-700"
          >
            <Eye className="w-4 h-4" />
            Preview
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={saveCurrentLayout}
            className="border-gray-600 hover:bg-gray-700"
          >
            <Settings className="w-4 h-4" />
            Save Layout
          </Button>
        </div>
      </div>

      <Tabs defaultValue="presets" className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-gray-800">
          <TabsTrigger value="presets">Presets</TabsTrigger>
          <TabsTrigger value="layout">Layout</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>

        {/* Layout Presets */}
        <TabsContent value="presets" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {presets.map((preset) => {
              const IconComponent = preset.icon;
              const isActive = JSON.stringify(layout) === JSON.stringify(preset.config);
              
              return (
                <Card 
                  key={preset.name}
                  className={cn(
                    "cursor-pointer transition-all hover:scale-105 bg-gray-800 border-gray-700",
                    isActive && "ring-2 ring-blue-500 bg-blue-900/20"
                  )}
                  onClick={() => loadLayout(preset.config)}
                >
                  <CardHeader className="text-center pb-2">
                    <IconComponent className="w-8 h-8 mx-auto text-blue-400" />
                    <CardTitle className="text-sm text-white">{preset.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <p className="text-xs text-gray-400">{preset.description}</p>
                    {isActive && (
                      <Badge className="mt-2 bg-blue-600">Current</Badge>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Saved Layouts */}
          {savedLayouts.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-white">Saved Layouts</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {savedLayouts.map((saved, index) => (
                  <Card
                    key={index}
                    className="cursor-pointer bg-gray-800 border-gray-700 hover:bg-gray-700"
                    onClick={() => loadLayout(saved.config)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between">
                        <span className="text-white font-medium">{saved.name}</span>
                        <LayoutGrid className="w-4 h-4 text-gray-400" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </TabsContent>

        {/* Layout Controls */}
        <TabsContent value="layout" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Layout className="w-5 h-5" />
                  Spacing & Density
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-300 mb-2 block">
                    Layout Density
                  </label>
                  <Select value={layout.density} onValueChange={(value: any) => 
                    setLayout(prev => ({ ...prev, density: value }))
                  }>
                    <SelectTrigger className="bg-gray-700 border-gray-600">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="compact">Compact</SelectItem>
                      <SelectItem value="comfortable">Comfortable</SelectItem>
                      <SelectItem value="spacious">Spacious</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-300 mb-2 block">
                    Sidebar Width: {layout.sidebarWidth}px
                  </label>
                  <Slider
                    value={[layout.sidebarWidth]}
                    onValueChange={([value]) => setLayout(prev => ({ ...prev, sidebarWidth: value }))}
                    min={180}
                    max={400}
                    step={20}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-300 mb-2 block">
                    Card Spacing: {layout.cardSpacing}px
                  </label>
                  <Slider
                    value={[layout.cardSpacing]}
                    onValueChange={([value]) => setLayout(prev => ({ ...prev, cardSpacing: value }))}
                    min={4}
                    max={32}
                    step={4}
                    className="w-full"
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Fullscreen className="w-5 h-5" />
                  Display Modes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-300 mb-2 block">
                    Fullscreen Mode
                  </label>
                  <Select value={layout.fullscreenMode} onValueChange={(value: any) => 
                    setLayout(prev => ({ ...prev, fullscreenMode: value }))
                  }>
                    <SelectTrigger className="bg-gray-700 border-gray-600">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="off">Standard</SelectItem>
                      <SelectItem value="content">Content Focus</SelectItem>
                      <SelectItem value="immersive">Immersive</SelectItem>
                      <SelectItem value="zen">Zen Mode</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-300 mb-2 block">
                    Grid Density
                  </label>
                  <Select value={layout.gridDensity} onValueChange={(value: any) => 
                    setLayout(prev => ({ ...prev, gridDensity: value }))
                  }>
                    <SelectTrigger className="bg-gray-700 border-gray-600">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="loose">Loose</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="dense">Dense</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-300">
                    Auto-hide Sidebar
                  </label>
                  <Switch
                    checked={layout.autoHideSidebar}
                    onCheckedChange={(checked) => 
                      setLayout(prev => ({ ...prev, autoHideSidebar: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-300">
                    Focus Mode
                  </label>
                  <Switch
                    checked={layout.focusMode}
                    onCheckedChange={(checked) => 
                      setLayout(prev => ({ ...prev, focusMode: checked }))
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Appearance Controls */}
        <TabsContent value="appearance" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Palette className="w-5 h-5" />
                  Color & Theme
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-300 mb-2 block">
                    Color Scheme
                  </label>
                  <Select value={layout.colorScheme} onValueChange={(value: any) => 
                    setLayout(prev => ({ ...prev, colorScheme: value }))
                  }>
                    <SelectTrigger className="bg-gray-700 border-gray-600">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="auto">Auto</SelectItem>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="blue">Blue</SelectItem>
                      <SelectItem value="green">Green</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-300 mb-2 block">
                    Font Size: {layout.fontSize}px
                  </label>
                  <Slider
                    value={[layout.fontSize]}
                    onValueChange={([value]) => setLayout(prev => ({ ...prev, fontSize: value }))}
                    min={12}
                    max={18}
                    step={1}
                    className="w-full"
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  Performance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-300 mb-2 block">
                    Animation Speed: {layout.animationSpeed}ms
                  </label>
                  <Slider
                    value={[layout.animationSpeed]}
                    onValueChange={([value]) => setLayout(prev => ({ ...prev, animationSpeed: value }))}
                    min={0}
                    max={500}
                    step={50}
                    className="w-full"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-300">
                    Show Animations
                  </label>
                  <Switch
                    checked={layout.showAnimations}
                    onCheckedChange={(checked) => 
                      setLayout(prev => ({ ...prev, showAnimations: checked }))
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Advanced Controls */}
        <TabsContent value="advanced" className="space-y-6">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Advanced Layout Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-300 mb-2 block">
                  Header Height: {layout.headerHeight}px
                </label>
                <Slider
                  value={[layout.headerHeight]}
                  onValueChange={([value]) => setLayout(prev => ({ ...prev, headerHeight: value }))}
                  min={60}
                  max={120}
                  step={10}
                  className="w-full"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Button
                  variant="outline"
                  onClick={() => setLayout(defaultLayout)}
                  className="border-gray-600 hover:bg-gray-700"
                >
                  Reset to Default
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => {
                    navigator.clipboard.writeText(JSON.stringify(layout, null, 2));
                  }}
                  className="border-gray-600 hover:bg-gray-700"
                >
                  Export Config
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Live Preview Indicator */}
      {previewMode && (
        <div className="fixed bottom-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4" />
            <span className="text-sm">Live Preview Active</span>
          </div>
        </div>
      )}
    </div>
  );
}