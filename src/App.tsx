import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";

// Layout pages (with header)
import Home from "@/pages/Home";
import Create from "@/pages/Create";
import History from "@/pages/History";
import NotFound from "@/pages/NotFound";
import { Header } from "@/components/Header";

// Viewer pages (full-screen, no header)
import PosterViewer from "@/pages/viewers/PosterViewer";
import LandingPageViewer from "@/pages/viewers/LandingPageViewer";
import PresentationViewer from "@/pages/viewers/PresentationViewer";

function AppLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            <Header />
            {children}
        </>
    );
}

function App() {
    return (
        <BrowserRouter>
            <Routes>
                {/* Main app routes (with header) */}
                <Route path="/" element={<AppLayout><Home /></AppLayout>} />
                <Route path="/create" element={<AppLayout><Create /></AppLayout>} />
                <Route path="/history" element={<AppLayout><History /></AppLayout>} />

                {/* Viewer routes (full-screen, NO header) */}
                <Route path="/view/poster/:id" element={<PosterViewer />} />
                <Route path="/view/landing/:id" element={<LandingPageViewer />} />
                <Route path="/view/presentation/:id" element={<PresentationViewer />} />

                {/* 404 */}
                <Route path="*" element={<AppLayout><NotFound /></AppLayout>} />
            </Routes>
            <Toaster />
        </BrowserRouter>
    );
}

export default App;
