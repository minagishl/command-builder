import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Header } from "@/components/header";
import { Home } from "@/components/home";
import { Builder as YtDlpBuilder } from "@/components/yt-dlp-builder";
import { Builder as FFmpegBuilder } from "@/components/ffmpeg-builder";
import { Builder as ImageMagickBuilder } from "@/components/imagemagick-builder";
import { Builder as CurlBuilder } from "@/components/curl-builder";
import { Builder as GitBuilder } from "@/components/git-builder";

export function App() {
	return (
		<BrowserRouter>
			<Header />
			<Routes>
				<Route path="/" element={<Home />} />
				<Route path="/yt-dlp" element={<YtDlpBuilder />} />
				<Route path="/ffmpeg" element={<FFmpegBuilder />} />
				<Route path="/imagemagick" element={<ImageMagickBuilder />} />
				<Route path="/curl" element={<CurlBuilder />} />
				<Route path="/git" element={<GitBuilder />} />
			</Routes>
		</BrowserRouter>
	);
}

export default App;
