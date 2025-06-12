'use client'
import React, { useState, useEffect } from "react";
import { Sidebar, SidebarContent, SidebarFooter, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarHeader, SidebarGroup, SidebarGroupLabel, SidebarGroupContent, SidebarMenuSub, SidebarMenuSubItem, SidebarMenuSubButton } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Pin, PinOff, User2, ChevronUp, ArrowLeft, Home, Settings, FileText, Box, ChevronRight, Terminal, Database, Code, CreditCard } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu";
import { UserCenter } from "@/components/ui/user-center";
import { getCurrentUser } from "@/database/actions/user-actions";
import { User } from "@/payload-types";

import { useSealosStore } from "@/store/sealos-store";
import { useSealosAccount } from "@/hooks/use-sealos-account";
import { useSealosAuth } from "@/hooks/use-sealos-auth";
import { useDevboxSidebar } from "@/hooks/use-devbox-sidebar";
import { useSidebarResize } from "@/hooks/use-sidebar-resize";
import { useSidebarVisibility } from "@/hooks/use-sidebar-visibility";
import { SidebarPath } from "@/components/providers/sidebar/types";

export function AppSidebar() {
  // Sealos store
  const {
    currentUser,
    regionUrl,
    setCurrentUser,
    setRegionUrl,
    getApiData,
    setApiData,
    isApiDataValid,
    hasRequiredTokens,
    debugPrintState,
  } = useSealosStore();

  // Sealos hooks
  const {
    fetchAccountAmount,
    getCachedAccountAmount,
    isAccountDataValid,
  } = useSealosAccount();

  const {
    fetchAuthInfo,
    getCachedAuthInfo,
    isAuthDataValid,
  } = useSealosAuth();

  // DevBox sidebar data managed via dedicated hook
  const {
    devboxes: parsedDevboxes,
    rawData: devboxData,
    loading: devboxLoading,
    error: devboxError,
    refresh: refreshDevboxList,
  } = useDevboxSidebar();

  // --- Behaviour hooks ---
  const {
    width: sidebarWidth,
    handleMouseDown: handleResizeMouseDown,
  } = useSidebarResize();

  const {
    open,
    setOpen,
    pinned,
    togglePin: handlePinClick,
    enterHotZone: handleHotZoneEnter,
    leaveSidebar: handleSidebarLeave,
    enterSidebar: handleSidebarEnter,
  } = useSidebarVisibility();

  const [currentPath, setCurrentPath] = useState<SidebarPath>('/sidebar');
  const [devboxExpanded, setDevboxExpanded] = useState(false);
  const dataFetchedRef = React.useRef(false);

  // Fetch user data on component mount
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await getCurrentUser();
        setCurrentUser(currentUser);
        
        // If user exists, update tokens in store and fetch account data
        if (currentUser) {
          console.log("Setting user tokens in Sealos store");
          // The store will automatically extract and set tokens when setCurrentUser is called
          
          // Debug: Print store state after setting user
          setTimeout(() => {
            console.log("📊 Store state after setting user:");
            debugPrintState();
          }, 100);

          // Fetch account data after user is set
          setTimeout(async () => {
            await fetchAccountData();
          }, 200);
        }
      } catch (error) {
        console.error('Error fetching user:', error);
        setCurrentUser(null);
      }
    };

    fetchUser();
  }, [setCurrentUser, debugPrintState]);

  // Fetch account data function
  const fetchAccountData = async () => {
    if (!currentUser) return;

    try {
      console.log("🏦 Fetching account data in sidebar");
      
      // Fetch both account amount and auth info
      const [accountAmount, authInfo] = await Promise.allSettled([
        fetchAccountAmount(),
        fetchAuthInfo(),
      ]);

      if (accountAmount.status === 'fulfilled') {
        console.log("✅ Account amount fetched successfully:", accountAmount.value);
      } else {
        console.error("❌ Failed to fetch account amount:", accountAmount.reason);
      }

      if (authInfo.status === 'fulfilled') {
        console.log("✅ Auth info fetched successfully:", authInfo.value);
      } else {
        console.error("❌ Failed to fetch auth info:", authInfo.reason);
      }

    } catch (error) {
      console.error('Error fetching account data:', error);
    }
  };

  // Navigation handlers
  const handleBackClick = () => {
    setCurrentPath('/sidebar');
  };

  const handleNavigate = (path: SidebarPath) => {
    setCurrentPath(path);
    
    // If navigating to devbox, fetch devbox list
    if (path === '/sidebar/devbox' && currentUser) {
      refreshDevboxList();
    }
    
    // If navigating to account, fetch account data
    if (path === '/sidebar/account' && currentUser) {
      fetchAccountData();
    }
  };

  // Get current page title
  const getCurrentTitle = () => {
    switch (currentPath) {
      case '/sidebar':
        return 'Sidebar';
      case '/sidebar/user-center':
        return 'User Center';
      case '/sidebar/account':
        return 'Account';
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
      title: 'Account',
      icon: CreditCard,
      path: '/sidebar/account' as SidebarPath,
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
                if (!devboxExpanded && currentUser && parsedDevboxes.length === 0) {
                  refreshDevboxList();
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
        return <UserCenter user={currentUser} />;
      case '/sidebar/account':
        return (
          <div className="p-4">
            <h3 className="text-lg font-semibold mb-4">Account Information</h3>
            
            <div className="space-y-4">
              <div className="bg-black p-3 rounded-md">
                <h4 className="text-sm font-medium mb-2">Account Amount:</h4>
                <pre className="text-xs overflow-auto max-h-32">
                  {JSON.stringify(getCachedAccountAmount(regionUrl), null, 2)}
                </pre>
              </div>
              
              <div className="bg-black p-3 rounded-md">
                <h4 className="text-sm font-medium mb-2">Auth Info:</h4>
                <pre className="text-xs overflow-auto max-h-32">
                  {JSON.stringify(getCachedAuthInfo(regionUrl), null, 2)}
                </pre>
              </div>
              
              <button 
                onClick={fetchAccountData}
                className="px-3 py-2 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
              >
                Refresh Account Data
              </button>
            </div>
          </div>
        );
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

  // Centralized data fetching effect - fetch all API data when user is available
  useEffect(() => {
    if (currentUser && !dataFetchedRef.current) {
      dataFetchedRef.current = true;
      console.log("🚀 Sidebar: Starting centralized data fetch");
      
      // Fetch all three API data types
      Promise.allSettled([
        refreshDevboxList(),
        fetchAccountAmount(),
        fetchAuthInfo(),
      ]).then((results) => {
        results.forEach((result, index) => {
          const apiNames = ['devbox', 'account', 'auth'];
          if (result.status === 'fulfilled') {
            console.log(`✅ Sidebar: ${apiNames[index]} data fetched successfully`);
          } else {
            console.error(`❌ Sidebar: ${apiNames[index]} data fetch failed:`, result.reason);
          }
        });
        console.log("🏁 Sidebar: Centralized data fetch completed");
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]);

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
                  <span>{currentUser?.username || currentUser?.email || 'User'}</span>
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