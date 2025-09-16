import { AppSidebar } from '../AppSidebar'
import { SidebarProvider } from "@/components/ui/sidebar"

export default function AppSidebarExample() {
  const style = {
    "--sidebar-width": "20rem",
    "--sidebar-width-icon": "4rem",
  };

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <AppSidebar />
        <div className="flex-1 p-6">
          <h2 className="text-xl font-semibold">Main Content Area</h2>
          <p className="text-muted-foreground">This is where the main content would be displayed</p>
        </div>
      </div>
    </SidebarProvider>
  )
}