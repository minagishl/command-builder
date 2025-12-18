import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Header } from "@/components/header";
import { Home } from "@/components/home";
import { Builder as YtDlpBuilder } from "@/components/yt-dlp-builder";
import { Builder as FFmpegBuilder } from "@/components/ffmpeg-builder";

export function App() {
	return (
		<BrowserRouter>
			<Header />
			<Routes>
				<Route path="/" element={<Home />} />
				<Route path="/yt-dlp" element={<YtDlpBuilder />} />
				<Route path="/ffmpeg" element={<FFmpegBuilder />} />
			</Routes>
		</BrowserRouter>
	);
}

export default App;
