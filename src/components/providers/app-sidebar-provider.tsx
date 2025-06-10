'use client'
import React, { useRef, useState, useEffect } from "react";
import { Sidebar, SidebarContent, SidebarFooter, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarHeader, SidebarGroup, SidebarGroupLabel, SidebarGroupContent, SidebarMenuSub, SidebarMenuSubItem, SidebarMenuSubButton } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Pin, PinOff, User2, ChevronUp, ArrowLeft, Home, Settings, FileText, Box, ChevronRight, Terminal, Database, Code } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu";
import { UserCenter } from "@/components/ui/user-center";
import { getCurrentUser } from "@/database/actions/user-actions";
import { User } from "@/payload-types";
import { getDevboxList, getUserToken } from "@/provider/devbox/devbox-provider";
import { DataSchema, DevboxSchema, TemplateSchema } from "@/provider/devbox/schemas/devbox-list-schema";
import { z } from "zod";

type SidebarPath = '/sidebar' | '/sidebar/user-center' | '/sidebar/settings' | '/sidebar/documents' | '/sidebar/devbox' | '/sidebar/devbox/terminal' | '/sidebar/devbox/database' | '/sidebar/devbox/code-editor';

interface DevboxItem {
  name: string;
  namespace: string;
  state: string;
  phase: string;
}

export function AppSidebar() {
  const [open, setOpen] = useState(false);
  const [pinned, setPinned] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(280);
  const [user, setUser] = useState<User | null>(null);
  const [currentPath, setCurrentPath] = useState<SidebarPath>('/sidebar');
  const [devboxExpanded, setDevboxExpanded] = useState(false);
  const [devboxData, setDevboxData] = useState<any>(null);
  const [devboxLoading, setDevboxLoading] = useState(false);
  const [devboxError, setDevboxError] = useState<string | null>(null);
  const [parsedDevboxes, setParsedDevboxes] = useState<DevboxItem[]>([]);
  const closeTimeout = useRef<NodeJS.Timeout | null>(null);
  const resizing = useRef(false);

  // Fetch user data on component mount
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        console.error('Error fetching user:', error);
        setUser(null);
      }
    };

    fetchUser();
  }, []);

  // Open sidebar when mouse enters hot zone
  const handleHotZoneEnter = () => {
    if (closeTimeout.current) {
      clearTimeout(closeTimeout.current);
      closeTimeout.current = null;
    }
    setOpen(true);
  };

  // Start close timer when mouse leaves both sidebar and hot zone
  const handleSidebarLeave = () => {
    if (pinned) return;
    if (closeTimeout.current) clearTimeout(closeTimeout.current);
    closeTimeout.current = setTimeout(() => setOpen(false), 100);
  };

  // Cancel close if mouse re-enters sidebar
  const handleSidebarEnter = () => {
    if (closeTimeout.current) {
      clearTimeout(closeTimeout.current);
      closeTimeout.current = null;
    }
  };

  // Pin/unpin handler
  const handlePinClick = () => {
    setPinned((prev) => {
      const isNowPinned = !prev;
      if (isNowPinned) {
        setOpen(true);
      }
      return isNowPinned;
    });
  };

  // Navigation handlers
  const handleBackClick = () => {
    setCurrentPath('/sidebar');
  };

  const handleNavigate = (path: SidebarPath) => {
    setCurrentPath(path);
    
    // If navigating to devbox, fetch devbox list
    if (path === '/sidebar/devbox' && user) {
      fetchDevboxList();
    }
  };

  // Fetch devbox list function
  const fetchDevboxList = async () => {
    if (!user) return;

    try {
      setDevboxLoading(true);
      setDevboxError(null);

      const kubeconfig = await getUserToken(user, 'kubeconfig');
      const devboxToken = await getUserToken(user, 'app_token');

      if (!kubeconfig) {
        throw new Error('Kubeconfig token not found');
      }

      if (!devboxToken) {
        throw new Error('Devbox token not found');
      }

      const regionUrl = 'devbox.bja.sealos.run';
      const data = await getDevboxList(regionUrl, kubeconfig, devboxToken);
      
      setDevboxData(data);
      console.log('Devbox List Result:', data);
      
      // Parse and extract devbox names
      try {
        const parsedData = DataSchema.parse(data);
        const devboxItems: DevboxItem[] = [];
        
        parsedData.forEach((pair) => {
          // Type guards using proper schema types
          type DevboxType = z.infer<typeof DevboxSchema>;
          type TemplateType = z.infer<typeof TemplateSchema>;
          
          const isDevbox = (item: any): item is DevboxType => item && item.kind === "Devbox";
          const isTemplate = (item: any): item is TemplateType => item && "templateRepository" in item;

          const devbox = pair.find(isDevbox);
          const template = pair.find(isTemplate);

          if (devbox && template) {
            devboxItems.push({
              name: devbox.metadata.name,
              namespace: devbox.metadata.namespace,
              state: devbox.spec.state,
              phase: devbox.status.phase,
            });
            
            console.log({
              name: devbox.metadata.name,
              namespace: devbox.metadata.namespace,
              state: devbox.spec.state,
              phase: devbox.status.phase,
              image: devbox.spec.image,
              cpu: devbox.spec.resource.cpu,
              memory: devbox.spec.resource.memory,
              nodePort: devbox.status.network.nodePort,
              lastCommitStatus: devbox.status.commitHistory[0]?.status,
              lastCommitTime: devbox.status.commitHistory[0]?.time,
              template: template.templateRepository.iconId,
            });
          }
        });
        
        setParsedDevboxes(devboxItems);
      } catch (e) {
        console.error('Devbox data schema validation failed:', e);
        setParsedDevboxes([]);
      }
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setDevboxError(errorMessage);
      setParsedDevboxes([]);
      console.error('Error fetching devbox list:', error);
    } finally {
      setDevboxLoading(false);
    }
  };

  // Get current page title
  const getCurrentTitle = () => {
    switch (currentPath) {
      case '/sidebar':
        return 'Sidebar';
      case '/sidebar/user-center':
        return 'User Center';
      case '/sidebar/settings':
        return 'Settings';
      case '/sidebar/documents':
        return 'Documents';
      case '/sidebar/devbox':
        return 'DevBox';
      case '/sidebar/devbox/terminal':
        return 'Terminal';
      case '/sidebar/devbox/database':
        return 'Database';
      case '/sidebar/devbox/code-editor':
        return 'Code Editor';
      default:
        return 'Sidebar';
    }
  };

  // Define navigation items
  const navigationItems = [
    {
      title: 'User Center',
      icon: User2,
      path: '/sidebar/user-center' as SidebarPath,
    },
    {
      title: 'Settings',
      icon: Settings,
      path: '/sidebar/settings' as SidebarPath,
    },
    {
      title: 'Documents',
      icon: FileText,
      path: '/sidebar/documents' as SidebarPath,
    },
  ];

  // Define devbox sub-items
  const devboxItems = [
    {
      title: 'Terminal',
      icon: Terminal,
      path: '/sidebar/devbox/terminal' as SidebarPath,
    },
    {
      title: 'Database',
      icon: Database,
      path: '/sidebar/devbox/database' as SidebarPath,
    },
    {
      title: 'Code Editor',
      icon: Code,
      path: '/sidebar/devbox/code-editor' as SidebarPath,
    },
  ];

  // Render main sidebar content
  const renderMainSidebarContent = () => (
    <SidebarGroup>
      <SidebarGroupLabel>Application</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {navigationItems.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton onClick={() => handleNavigate(item.path)}>
                <item.icon className="w-4 h-4" />
                <span>{item.title}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
          
          {/* DevBox Collapsible Menu */}
          <SidebarMenuItem>
            <SidebarMenuButton 
              onClick={() => {
                setDevboxExpanded(!devboxExpanded);
                if (!devboxExpanded && user && parsedDevboxes.length === 0) {
                  fetchDevboxList();
                }
              }}
              className="w-full"
            >
              <Box className="w-4 h-4" />
              <span>DevBox</span>
              <ChevronRight 
                className={`ml-auto w-4 h-4 transition-transform ${
                  devboxExpanded ? 'rotate-90' : ''
                }`} 
              />
            </SidebarMenuButton>
            {devboxExpanded && (
              <SidebarMenuSub>
                {devboxLoading && (
                  <SidebarMenuSubItem>
                    <div className="px-3 py-2">
                      <span className="text-xs text-muted-foreground">Loading...</span>
                    </div>
                  </SidebarMenuSubItem>
                )}
                
                {devboxError && (
                  <SidebarMenuSubItem>
                    <div className="px-3 py-2">
                      <span className="text-xs text-red-500">Error loading devboxes</span>
                    </div>
                  </SidebarMenuSubItem>
                )}
                
                {!devboxLoading && !devboxError && parsedDevboxes.length === 0 && (
                  <SidebarMenuSubItem>
                    <div className="px-3 py-2">
                      <span className="text-xs text-muted-foreground">No devboxes found</span>
                    </div>
                  </SidebarMenuSubItem>
                )}
                
                {parsedDevboxes.map((devbox) => (
                  <SidebarMenuSubItem key={`${devbox.namespace}-${devbox.name}`}>
                    <SidebarMenuSubButton onClick={() => handleNavigate('/sidebar/devbox')}>
                      <Box className="w-4 h-4" />
                      <span className="truncate" title={devbox.name}>{devbox.name}</span>
                      <span className={`ml-auto w-2 h-2 rounded-full ${
                        devbox.phase === 'Running' ? 'bg-green-500' : 
                        devbox.phase === 'Pending' ? 'bg-yellow-500' : 'bg-gray-500'
                      }`} />
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                ))}
              </SidebarMenuSub>
            )}
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );

  // Render content based on current path
  const renderContent = () => {
    switch (currentPath) {
      case '/sidebar':
        return renderMainSidebarContent();
      case '/sidebar/user-center':
        return <UserCenter user={user} />;
      case '/sidebar/settings':
        return (
          <div className="p-4">
            <h3 className="text-lg font-semibold mb-4">Settings</h3>
            <p className="text-sm text-muted-foreground">Settings content coming soon...</p>
          </div>
        );
      case '/sidebar/documents':
        return (
          <div className="p-4">
            <h3 className="text-lg font-semibold mb-4">Documents</h3>
            <p className="text-sm text-muted-foreground">Documents content coming soon...</p>
          </div>
        );
      case '/sidebar/devbox':
        return (
          <div className="p-4">
            <h3 className="text-lg font-semibold mb-4">DevBox</h3>
            
            {devboxLoading && (
              <div className="text-sm text-muted-foreground">Loading devbox list...</div>
            )}
            
            {devboxError && (
              <div className="text-sm text-red-500 mb-4">
                Error: {devboxError}
              </div>
            )}
            
            {devboxData && (
              <div className="space-y-4">
                <div className="text-sm text-green-600">
                  ✅ Devbox list loaded successfully!
                </div>
                <div className="bg-gray-100 p-3 rounded-md">
                  <h4 className="text-sm font-medium mb-2">API Response:</h4>
                  <pre className="text-xs overflow-auto max-h-64">
                    {JSON.stringify(devboxData, null, 2)}
                  </pre>
                </div>
              </div>
            )}
            
            {!devboxLoading && !devboxError && !devboxData && (
              <p className="text-sm text-muted-foreground">
                Click to load devbox list or select a DevBox tool from the navigation menu.
              </p>
            )}
          </div>
        );
      case '/sidebar/devbox/terminal':
        return (
          <div className="p-4">
            <h3 className="text-lg font-semibold mb-4">Terminal</h3>
            <p className="text-sm text-muted-foreground">Terminal interface coming soon...</p>
          </div>
        );
      case '/sidebar/devbox/database':
        return (
          <div className="p-4">
            <h3 className="text-lg font-semibold mb-4">Database</h3>
            <p className="text-sm text-muted-foreground">Database management coming soon...</p>
          </div>
        );
      case '/sidebar/devbox/code-editor':
        return (
          <div className="p-4">
            <h3 className="text-lg font-semibold mb-4">Code Editor</h3>
            <p className="text-sm text-muted-foreground">Code editor coming soon...</p>
          </div>
        );
      default:
        return renderMainSidebarContent();
    }
  };

  // --- Resize logic ---
  const handleResizeMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    resizing.current = true;
    document.body.style.cursor = 'ew-resize';
    const startX = e.clientX;
    const startWidth = sidebarWidth;

    const onMouseMove = (moveEvent: MouseEvent) => {
      if (!resizing.current) return;
      const newWidth = Math.max(180, startWidth + (moveEvent.clientX - startX));
      setSidebarWidth(newWidth);
    };
    const onMouseUp = () => {
      resizing.current = false;
      document.body.style.cursor = '';
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  useEffect(() => {
    if (user) {
      fetchDevboxList();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  return (
    <>
      {/* Hot zone: only active when sidebar is closed and not pinned */}
      {!open && !pinned && (
        <div
          className="fixed left-0 top-0 w-12 h-screen z-[100]"
          onMouseEnter={handleHotZoneEnter}
        />
      )}
      <SidebarProvider open={open} onOpenChange={setOpen}>
        <Sidebar
          variant="floating"
          className="fixed top-0 left-0 h-full z-50"
          style={{ width: sidebarWidth }}
          onMouseEnter={handleSidebarEnter}
          onMouseLeave={handleSidebarLeave}
        >
          {/* Resize handle */}
          <div
            className="absolute top-0 right-0 h-full w-2 cursor-ew-resize z-50 bg-transparent transition-colors"
            onMouseDown={handleResizeMouseDown}
            style={{ userSelect: 'none' }}
          />
          
          {/* Header */}
          <SidebarHeader className="border-b p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {currentPath !== '/sidebar' && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleBackClick}
                    aria-label="Go back"
                    className="h-8 w-8"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </Button>
                )}
                <div className="flex items-center space-x-2">
                  <Home className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium">{getCurrentTitle()}</span>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handlePinClick}
                aria-label={pinned ? 'Unpin sidebar' : 'Pin sidebar'}
                className="h-8 w-8"
              >
                {pinned ? (
                  <PinOff className="w-4 h-4" />
                ) : (
                  <Pin className="w-4 h-4" />
                )}
              </Button>
            </div>
          </SidebarHeader>

          {/* Content */}
          <SidebarContent>
            {renderContent()}
          </SidebarContent>
          
          <SidebarFooter>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={() => handleNavigate('/sidebar/user-center')}>
                  <User2 className="w-4 h-4" />
                  <span>{user?.username || user?.email || 'User'}</span>
                  <ChevronUp className="ml-auto w-4 h-4" />
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>
      </SidebarProvider>
    </>
  );
}