import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Header } from "@/components/header";
import { Home } from "@/components/home";
import { Builder } from "@/components/yt-dlp-builder";

export function App() {
	return (
		<BrowserRouter>
			<Header />
			<Routes>
				<Route path="/" element={<Home />} />
				<Route path="/yt-dlp" element={<Builder />} />
			</Routes>
		</BrowserRouter>
	);
}

export default App;
