import * as React from "react";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { IconCopy } from "@tabler/icons-react";

interface YtDlpOptions {
	url: string;
	quality: string;
	format: string;
	audioOnly: boolean;
	audioQuality: string;
	outputPath: string;
	outputTemplate: string;
	subtitles: string;
	subtitleLang: string;
	subtitleFormat: string;
	embedSubtitles: boolean;
	embedThumbnail: boolean;
	embedMetadata: boolean;
	embedChapters: boolean;
	writeThumbnail: boolean;
	writeDescription: boolean;
	writeInfoJson: boolean;
	playlist: string;
	playlistStart: string;
	playlistEnd: string;
	rateLimit: string;
	cookieSource: string;
	cookieFile: string;
	cookieBrowser: string;
	cookieProfile: string;
	sponsorblockRemove: string;
	sponsorblockMark: string;
	liveFromStart: boolean;
	downloadArchive: string;
	proxy: string;
	useAria2c: boolean;
}

type Preset = Partial<Omit<YtDlpOptions, "url">>;

const PRESETS: Record<
	string,
	{ name: string; description: string; options: Preset }
> = {
	bestQuality: {
		name: "Best Quality Video",
		description: "Download highest quality video with all metadata",
		options: {
			quality: "best",
			format: "mp4",
			audioOnly: false,
			embedSubtitles: true,
			embedThumbnail: true,
			embedMetadata: true,
			embedChapters: true,
			subtitles: "all",
			subtitleLang: "en",
			subtitleFormat: "srt",
		},
	},
	audioMP3: {
		name: "Audio Only (MP3)",
		description: "Extract audio as MP3 with high quality",
		options: {
			audioOnly: true,
			format: "mp3",
			audioQuality: "0",
			embedThumbnail: true,
			embedMetadata: true,
		},
	},
	audioAAC: {
		name: "Audio Only (AAC)",
		description: "Extract audio as AAC with high quality",
		options: {
			audioOnly: true,
			format: "m4a",
			audioQuality: "0",
			embedThumbnail: true,
			embedMetadata: true,
		},
	},
	quickDownload: {
		name: "Quick Download",
		description: "Fast download with lower quality",
		options: {
			quality: "720",
			format: "mp4",
			audioOnly: false,
			embedSubtitles: false,
			embedThumbnail: false,
			embedMetadata: false,
			subtitles: "none",
		},
	},
	archiveMode: {
		name: "Archive with Metadata",
		description:
			"Save everything: video, subtitles, thumbnails, description, metadata",
		options: {
			quality: "best",
			format: "mkv",
			audioOnly: false,
			embedSubtitles: true,
			embedThumbnail: true,
			embedMetadata: true,
			embedChapters: true,
			writeThumbnail: true,
			writeDescription: true,
			writeInfoJson: true,
			subtitles: "all",
			subtitleLang: "en,ja",
			subtitleFormat: "srt",
		},
	},
	playlistMode: {
		name: "Playlist Download",
		description: "Optimized for downloading entire playlists",
		options: {
			quality: "1080",
			format: "mp4",
			audioOnly: false,
			playlist: "all",
			embedMetadata: true,
		},
	},
	noSponsor: {
		name: "Remove Sponsors",
		description: "Remove sponsor segments and intros/outros",
		options: {
			quality: "best",
			format: "mp4",
			audioOnly: false,
			sponsorblockRemove: "sponsor,intro,outro",
			embedMetadata: true,
		},
	},
};

export function Builder() {
	const [options, setOptions] = React.useState<YtDlpOptions>({
		url: "",
		quality: "best",
		format: "mp4",
		audioOnly: false,
		audioQuality: "5",
		outputPath: "",
		outputTemplate: "%(title)s.%(ext)s",
		subtitles: "none",
		subtitleLang: "en",
		subtitleFormat: "srt",
		embedSubtitles: false,
		embedThumbnail: false,
		embedMetadata: false,
		embedChapters: false,
		writeThumbnail: false,
		writeDescription: false,
		writeInfoJson: false,
		playlist: "all",
		playlistStart: "",
		playlistEnd: "",
		rateLimit: "",
		cookieSource: "none",
		cookieFile: "",
		cookieBrowser: "chrome",
		cookieProfile: "",
		sponsorblockRemove: "none",
		sponsorblockMark: "none",
		liveFromStart: false,
		downloadArchive: "",
		proxy: "",
		useAria2c: false,
	});

	const [command, setCommand] = React.useState("");
	const [copied, setCopied] = React.useState(false);
	const [selectedPreset, setSelectedPreset] = React.useState("");

	const updateOption = <K extends keyof YtDlpOptions>(
		key: K,
		value: YtDlpOptions[K]
	) => {
		setOptions((prev) => ({ ...prev, [key]: value }));
	};

	const applyPreset = (presetKey: string) => {
		if (presetKey === "none") {
			setSelectedPreset("");
			return;
		}

		const preset = PRESETS[presetKey];
		if (preset) {
			setOptions((prev) => ({
				...prev,
				...preset.options,
			}));
			setSelectedPreset(presetKey);
		}
	};

	const generateCommand = React.useCallback(() => {
		const parts: string[] = ["yt-dlp"];

		// Quality and format
		if (options.audioOnly) {
			parts.push("-x");
			parts.push(
				"--audio-format",
				options.format === "mp4" ? "mp3" : options.format
			);
			if (options.audioQuality) {
				parts.push("--audio-quality", options.audioQuality);
			}
		} else {
			if (options.quality === "best") {
				parts.push("-f", "bestvideo+bestaudio/best");
			} else if (options.quality === "worst") {
				parts.push("-f", "worstvideo+worstaudio/worst");
			} else {
				parts.push(
					"-f",
					`bestvideo[height<=${options.quality}]+bestaudio/best[height<=${options.quality}]`
				);
			}

			if (options.format !== "default") {
				parts.push("--merge-output-format", options.format);
			}
		}

		// Output
		if (options.outputPath) {
			parts.push("-P", options.outputPath);
		}
		if (options.outputTemplate) {
			parts.push("-o", options.outputTemplate);
		}

		// Subtitles
		if (options.subtitles === "all") {
			parts.push("--all-subs");
		} else if (options.subtitles === "auto") {
			parts.push("--write-auto-sub");
		} else if (options.subtitles === "manual") {
			parts.push("--write-sub");
		}

		if (options.subtitles !== "none" && options.subtitleLang) {
			parts.push("--sub-lang", options.subtitleLang);
		}

		if (options.subtitles !== "none" && options.subtitleFormat) {
			parts.push("--sub-format", options.subtitleFormat);
		}

		if (options.embedSubtitles) {
			parts.push("--embed-subs");
		}

		// Metadata and embedding
		if (options.embedThumbnail) {
			parts.push("--embed-thumbnail");
		}
		if (options.embedMetadata) {
			parts.push("--embed-metadata");
		}
		if (options.embedChapters) {
			parts.push("--embed-chapters");
		}

		// Write metadata files
		if (options.writeThumbnail) {
			parts.push("--write-thumbnail");
		}
		if (options.writeDescription) {
			parts.push("--write-description");
		}
		if (options.writeInfoJson) {
			parts.push("--write-info-json");
		}

		// Playlist
		if (options.playlist === "single") {
			parts.push("--no-playlist");
		} else {
			if (options.playlistStart) {
				parts.push("--playlist-start", options.playlistStart);
			}
			if (options.playlistEnd) {
				parts.push("--playlist-end", options.playlistEnd);
			}
		}

		// SponsorBlock
		if (options.sponsorblockRemove && options.sponsorblockRemove !== "none") {
			parts.push("--sponsorblock-remove", options.sponsorblockRemove);
		}
		if (options.sponsorblockMark && options.sponsorblockMark !== "none") {
			parts.push("--sponsorblock-mark", options.sponsorblockMark);
		}

		// Advanced options
		if (options.rateLimit) {
			parts.push("--limit-rate", options.rateLimit);
		}

		if (options.proxy) {
			parts.push("--proxy", options.proxy);
		}

		if (options.downloadArchive) {
			parts.push("--download-archive", options.downloadArchive);
		}

		if (options.liveFromStart) {
			parts.push("--live-from-start");
		}

		// Cookies
		if (options.cookieSource === "file" && options.cookieFile) {
			parts.push("--cookies", options.cookieFile);
		} else if (options.cookieSource === "browser" && options.cookieBrowser) {
			const browserSpec = options.cookieProfile
				? `${options.cookieBrowser}:${options.cookieProfile}`
				: options.cookieBrowser;
			parts.push("--cookies-from-browser", browserSpec);
		}

		if (options.useAria2c) {
			parts.push("--external-downloader", "aria2c");
		}

		// URL (always last)
		if (options.url) {
			parts.push(options.url);
		}

		return parts.join(" ");
	}, [options]);

	React.useEffect(() => {
		setCommand(generateCommand());
	}, [generateCommand]);

	const copyToClipboard = async () => {
		try {
			await navigator.clipboard.writeText(command);
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		} catch (err) {
			console.error("Failed to copy:", err);
		}
	};

	return (
		<div className="container mx-auto p-8 max-w-6xl">
			{/* Preset Selection */}
			<Card className="mb-6">
				<CardHeader>
					<CardTitle>Quick Presets</CardTitle>
					<CardDescription>
						Select a preset to quickly configure common download scenarios
					</CardDescription>
				</CardHeader>
				<CardContent>
					<Field>
						<FieldLabel htmlFor="preset">Choose Preset</FieldLabel>
						<Select value={selectedPreset} onValueChange={applyPreset}>
							<SelectTrigger id="preset">
								<SelectValue placeholder="Select a preset..." />
							</SelectTrigger>
							<SelectContent>
								<SelectGroup>
									<SelectItem value="none">None (Custom Settings)</SelectItem>
									{Object.entries(PRESETS).map(([key, preset]) => (
										<SelectItem key={key} value={key}>
											{preset.name}
										</SelectItem>
									))}
								</SelectGroup>
							</SelectContent>
						</Select>
						{selectedPreset && PRESETS[selectedPreset] && (
							<p className="text-xs text-muted-foreground mt-2">
								{PRESETS[selectedPreset].description}
							</p>
						)}
					</Field>
				</CardContent>
			</Card>

			<div className="grid gap-6 lg:grid-cols-2">
				<div className="space-y-6">
					{/* Basic Options */}
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								Basic Options
							</CardTitle>
							<CardDescription>
								Configure basic download settings
							</CardDescription>
						</CardHeader>
						<CardContent>
							<FieldGroup>
								<Field>
									<FieldLabel htmlFor="url">Video URL *</FieldLabel>
									<Input
										id="url"
										placeholder="https://www.youtube.com/watch?v=..."
										value={options.url}
										onChange={(e) => updateOption("url", e.target.value)}
									/>
								</Field>

								<div className="grid grid-cols-2 gap-4">
									<Field>
										<FieldLabel htmlFor="quality">Quality</FieldLabel>
										<Select
											value={options.quality}
											onValueChange={(value) => updateOption("quality", value)}
										>
											<SelectTrigger id="quality">
												<SelectValue />
											</SelectTrigger>
											<SelectContent>
												<SelectGroup>
													<SelectItem value="best">Best</SelectItem>
													<SelectItem value="2160">4K (2160p)</SelectItem>
													<SelectItem value="1440">2K (1440p)</SelectItem>
													<SelectItem value="1080">1080p</SelectItem>
													<SelectItem value="720">720p</SelectItem>
													<SelectItem value="480">480p</SelectItem>
													<SelectItem value="360">360p</SelectItem>
													<SelectItem value="worst">Worst</SelectItem>
												</SelectGroup>
											</SelectContent>
										</Select>
									</Field>

									<Field>
										<FieldLabel htmlFor="format">Format</FieldLabel>
										<Select
											value={options.format}
											onValueChange={(value) => updateOption("format", value)}
										>
											<SelectTrigger id="format">
												<SelectValue />
											</SelectTrigger>
											<SelectContent>
												<SelectGroup>
													<SelectItem value="default">Default</SelectItem>
													<SelectItem value="mp4">MP4</SelectItem>
													<SelectItem value="webm">WebM</SelectItem>
													<SelectItem value="mkv">MKV</SelectItem>
													<SelectItem value="flv">FLV</SelectItem>
												</SelectGroup>
											</SelectContent>
										</Select>
									</Field>
								</div>

								<Field orientation="horizontal" className="items-center">
									<Checkbox
										id="audioOnly"
										checked={options.audioOnly}
										onCheckedChange={(checked: boolean) =>
											updateOption("audioOnly", checked)
										}
										className="h-4 w-4"
									/>
									<FieldLabel htmlFor="audioOnly" className="mb-0">
										Audio Only (Extract Audio)
									</FieldLabel>
								</Field>

								{options.audioOnly && (
									<Field>
										<FieldLabel htmlFor="audioQuality">
											Audio Quality
										</FieldLabel>
										<Select
											value={options.audioQuality}
											onValueChange={(value) =>
												updateOption("audioQuality", value)
											}
										>
											<SelectTrigger id="audioQuality">
												<SelectValue />
											</SelectTrigger>
											<SelectContent>
												<SelectGroup>
													<SelectItem value="0">Best (0)</SelectItem>
													<SelectItem value="2">High (2)</SelectItem>
													<SelectItem value="5">Medium (5)</SelectItem>
													<SelectItem value="7">Low (7)</SelectItem>
													<SelectItem value="9">Worst (9)</SelectItem>
													<SelectItem value="128K">128K</SelectItem>
													<SelectItem value="192K">192K</SelectItem>
													<SelectItem value="256K">256K</SelectItem>
													<SelectItem value="320K">320K</SelectItem>
												</SelectGroup>
											</SelectContent>
										</Select>
										<p className="text-xs text-muted-foreground mt-1">
											0 (best) to 9 (worst) for VBR, or specific bitrate (e.g.,
											128K, 320K)
										</p>
									</Field>
								)}
							</FieldGroup>
						</CardContent>
					</Card>

					{/* Output Options */}
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								Output Options
							</CardTitle>
							<CardDescription>
								Configure output path and filename
							</CardDescription>
						</CardHeader>
						<CardContent>
							<FieldGroup>
								<Field>
									<FieldLabel htmlFor="outputPath">Output Path</FieldLabel>
									<Input
										id="outputPath"
										placeholder="~/Downloads"
										value={options.outputPath}
										onChange={(e) => updateOption("outputPath", e.target.value)}
									/>
								</Field>

								<Field>
									<FieldLabel htmlFor="outputTemplate">
										Output Template
									</FieldLabel>
									<Input
										id="outputTemplate"
										placeholder="%(title)s.%(ext)s"
										value={options.outputTemplate}
										onChange={(e) =>
											updateOption("outputTemplate", e.target.value)
										}
									/>
									<p className="text-xs text-muted-foreground mt-1">
										Use yt-dlp template variables like %(title)s, %(id)s,
										%(uploader)s
									</p>
								</Field>
							</FieldGroup>
						</CardContent>
					</Card>

					{/* Subtitle Options */}
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								Subtitle & Metadata
							</CardTitle>
							<CardDescription>
								Configure subtitles and metadata options
							</CardDescription>
						</CardHeader>
						<CardContent>
							<FieldGroup>
								<div className="grid grid-cols-3 gap-4">
									<Field>
										<FieldLabel htmlFor="subtitles">Subtitles</FieldLabel>
										<Select
											value={options.subtitles}
											onValueChange={(value) =>
												updateOption("subtitles", value)
											}
										>
											<SelectTrigger id="subtitles">
												<SelectValue />
											</SelectTrigger>
											<SelectContent>
												<SelectGroup>
													<SelectItem value="none">None</SelectItem>
													<SelectItem value="auto">Auto-generated</SelectItem>
													<SelectItem value="manual">Manual</SelectItem>
													<SelectItem value="all">All Available</SelectItem>
												</SelectGroup>
											</SelectContent>
										</Select>
									</Field>

									<Field>
										<FieldLabel htmlFor="subtitleLang">Language</FieldLabel>
										<Input
											id="subtitleLang"
											placeholder="en,ja"
											value={options.subtitleLang}
											onChange={(e) =>
												updateOption("subtitleLang", e.target.value)
											}
											disabled={options.subtitles === "none"}
										/>
									</Field>

									<Field>
										<FieldLabel htmlFor="subtitleFormat">Format</FieldLabel>
										<Select
											value={options.subtitleFormat}
											onValueChange={(value) =>
												updateOption("subtitleFormat", value)
											}
											disabled={options.subtitles === "none"}
										>
											<SelectTrigger id="subtitleFormat">
												<SelectValue />
											</SelectTrigger>
											<SelectContent>
												<SelectGroup>
													<SelectItem value="srt">SRT</SelectItem>
													<SelectItem value="ass">ASS</SelectItem>
													<SelectItem value="vtt">VTT</SelectItem>
													<SelectItem value="best">Best</SelectItem>
												</SelectGroup>
											</SelectContent>
										</Select>
									</Field>
								</div>

								<div className="space-y-2">
									<Field orientation="horizontal" className="items-center">
										<Checkbox
											id="embedSubtitles"
											checked={options.embedSubtitles}
											onCheckedChange={(checked: boolean) =>
												updateOption("embedSubtitles", checked)
											}
											disabled={options.subtitles === "none"}
											className="h-4 w-4"
										/>
										<FieldLabel htmlFor="embedSubtitles" className="mb-0">
											Embed Subtitles
										</FieldLabel>
									</Field>

									<Field orientation="horizontal" className="items-center">
										<Checkbox
											id="embedThumbnail"
											checked={options.embedThumbnail}
											onCheckedChange={(checked: boolean) =>
												updateOption("embedThumbnail", checked)
											}
											className="h-4 w-4"
										/>
										<FieldLabel htmlFor="embedThumbnail" className="mb-0">
											Embed Thumbnail
										</FieldLabel>
									</Field>

									<Field orientation="horizontal" className="items-center">
										<Checkbox
											id="embedMetadata"
											checked={options.embedMetadata}
											onCheckedChange={(checked: boolean) =>
												updateOption("embedMetadata", checked)
											}
											className="h-4 w-4"
										/>
										<FieldLabel htmlFor="embedMetadata" className="mb-0">
											Embed Metadata
										</FieldLabel>
									</Field>

									<Field orientation="horizontal" className="items-center">
										<Checkbox
											id="embedChapters"
											checked={options.embedChapters}
											onCheckedChange={(checked: boolean) =>
												updateOption("embedChapters", checked)
											}
											className="h-4 w-4"
										/>
										<FieldLabel htmlFor="embedChapters" className="mb-0">
											Embed Chapters
										</FieldLabel>
									</Field>

									<Field orientation="horizontal" className="items-center">
										<Checkbox
											id="writeThumbnail"
											checked={options.writeThumbnail}
											onCheckedChange={(checked: boolean) =>
												updateOption("writeThumbnail", checked)
											}
											className="h-4 w-4"
										/>
										<FieldLabel htmlFor="writeThumbnail" className="mb-0">
											Write Thumbnail File
										</FieldLabel>
									</Field>

									<Field orientation="horizontal" className="items-center">
										<Checkbox
											id="writeDescription"
											checked={options.writeDescription}
											onCheckedChange={(checked: boolean) =>
												updateOption("writeDescription", checked)
											}
											className="h-4 w-4"
										/>
										<FieldLabel htmlFor="writeDescription" className="mb-0">
											Write Description File
										</FieldLabel>
									</Field>

									<Field orientation="horizontal" className="items-center">
										<Checkbox
											id="writeInfoJson"
											checked={options.writeInfoJson}
											onCheckedChange={(checked: boolean) =>
												updateOption("writeInfoJson", checked)
											}
											className="h-4 w-4"
										/>
										<FieldLabel htmlFor="writeInfoJson" className="mb-0">
											Write Info JSON
										</FieldLabel>
									</Field>
								</div>
							</FieldGroup>
						</CardContent>
					</Card>
				</div>

				<div className="space-y-6">
					{/* Playlist Options */}
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								Playlist Options
							</CardTitle>
							<CardDescription>
								Configure playlist download settings
							</CardDescription>
						</CardHeader>
						<CardContent>
							<FieldGroup>
								<Field>
									<FieldLabel htmlFor="playlist">Playlist Mode</FieldLabel>
									<Select
										value={options.playlist}
										onValueChange={(value) => updateOption("playlist", value)}
									>
										<SelectTrigger id="playlist">
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											<SelectGroup>
												<SelectItem value="all">Download All</SelectItem>
												<SelectItem value="single">
													Single Video Only
												</SelectItem>
												<SelectItem value="range">Custom Range</SelectItem>
											</SelectGroup>
										</SelectContent>
									</Select>
								</Field>

								{options.playlist === "range" && (
									<div className="grid grid-cols-2 gap-4">
										<Field>
											<FieldLabel htmlFor="playlistStart">
												Start Index
											</FieldLabel>
											<Input
												id="playlistStart"
												type="number"
												min="1"
												placeholder="1"
												value={options.playlistStart}
												onChange={(e) =>
													updateOption("playlistStart", e.target.value)
												}
											/>
										</Field>

										<Field>
											<FieldLabel htmlFor="playlistEnd">End Index</FieldLabel>
											<Input
												id="playlistEnd"
												type="number"
												min="1"
												placeholder="10"
												value={options.playlistEnd}
												onChange={(e) =>
													updateOption("playlistEnd", e.target.value)
												}
											/>
										</Field>
									</div>
								)}
							</FieldGroup>
						</CardContent>
					</Card>

					{/* Advanced Options */}
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								Advanced Options
							</CardTitle>
							<CardDescription>Additional advanced settings</CardDescription>
						</CardHeader>
						<CardContent>
							<FieldGroup>
								<Field>
									<FieldLabel htmlFor="rateLimit">Rate Limit</FieldLabel>
									<Input
										id="rateLimit"
										placeholder="50K, 4.2M, etc."
										value={options.rateLimit}
										onChange={(e) => updateOption("rateLimit", e.target.value)}
									/>
									<p className="text-xs text-muted-foreground mt-1">
										Maximum download rate (e.g., 50K, 4.2M)
									</p>
								</Field>

								<Field>
									<FieldLabel htmlFor="cookieSource">Cookie Source</FieldLabel>
									<Select
										value={options.cookieSource}
										onValueChange={(value) =>
											updateOption("cookieSource", value)
										}
									>
										<SelectTrigger id="cookieSource">
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											<SelectGroup>
												<SelectItem value="none">None</SelectItem>
												<SelectItem value="file">Cookie File</SelectItem>
												<SelectItem value="browser">Browser Cookies</SelectItem>
											</SelectGroup>
										</SelectContent>
									</Select>
									<p className="text-xs text-muted-foreground mt-1">
										Use cookies for authentication
									</p>
								</Field>

								{options.cookieSource === "file" && (
									<Field>
										<FieldLabel htmlFor="cookieFile">
											Cookie File Path
										</FieldLabel>
										<Input
											id="cookieFile"
											placeholder="/path/to/cookies.txt"
											value={options.cookieFile}
											onChange={(e) =>
												updateOption("cookieFile", e.target.value)
											}
										/>
										<p className="text-xs text-muted-foreground mt-1">
											Path to Netscape format cookies file
										</p>
									</Field>
								)}

								{options.cookieSource === "browser" && (
									<>
										<div className="grid grid-cols-2 gap-4">
											<Field>
												<FieldLabel htmlFor="cookieBrowser">Browser</FieldLabel>
												<Select
													value={options.cookieBrowser}
													onValueChange={(value) =>
														updateOption("cookieBrowser", value)
													}
												>
													<SelectTrigger id="cookieBrowser">
														<SelectValue />
													</SelectTrigger>
													<SelectContent>
														<SelectGroup>
															<SelectItem value="chrome">Chrome</SelectItem>
															<SelectItem value="firefox">Firefox</SelectItem>
															<SelectItem value="edge">Edge</SelectItem>
															<SelectItem value="safari">Safari</SelectItem>
															<SelectItem value="opera">Opera</SelectItem>
															<SelectItem value="brave">Brave</SelectItem>
															<SelectItem value="chromium">Chromium</SelectItem>
															<SelectItem value="vivaldi">Vivaldi</SelectItem>
														</SelectGroup>
													</SelectContent>
												</Select>
											</Field>

											<Field>
												<FieldLabel htmlFor="cookieProfile">
													Profile (Optional)
												</FieldLabel>
												<Input
													id="cookieProfile"
													placeholder="default"
													value={options.cookieProfile}
													onChange={(e) =>
														updateOption("cookieProfile", e.target.value)
													}
												/>
											</Field>
										</div>
										<p className="text-xs text-muted-foreground -mt-2">
											Extract cookies from your browser. Profile is optional
											(e.g., "default", "Profile 1")
										</p>
									</>
								)}

								<Field>
									<FieldLabel htmlFor="sponsorblockRemove">
										SponsorBlock Remove
									</FieldLabel>
									<Select
										value={options.sponsorblockRemove}
										onValueChange={(value) =>
											updateOption("sponsorblockRemove", value)
										}
									>
										<SelectTrigger id="sponsorblockRemove">
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											<SelectGroup>
												<SelectItem value="none">None</SelectItem>
												<SelectItem value="sponsor">Sponsor</SelectItem>
												<SelectItem value="intro">Intro</SelectItem>
												<SelectItem value="outro">Outro</SelectItem>
												<SelectItem value="selfpromo">Self Promo</SelectItem>
												<SelectItem value="interaction">Interaction</SelectItem>
												<SelectItem value="all">All</SelectItem>
												<SelectItem value="sponsor,intro,outro">
													Sponsor + Intro + Outro
												</SelectItem>
											</SelectGroup>
										</SelectContent>
									</Select>
									<p className="text-xs text-muted-foreground mt-1">
										Remove segments from video using SponsorBlock
									</p>
								</Field>

								<Field>
									<FieldLabel htmlFor="sponsorblockMark">
										SponsorBlock Mark
									</FieldLabel>
									<Select
										value={options.sponsorblockMark}
										onValueChange={(value) =>
											updateOption("sponsorblockMark", value)
										}
									>
										<SelectTrigger id="sponsorblockMark">
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											<SelectGroup>
												<SelectItem value="none">None</SelectItem>
												<SelectItem value="sponsor">Sponsor</SelectItem>
												<SelectItem value="intro">Intro</SelectItem>
												<SelectItem value="outro">Outro</SelectItem>
												<SelectItem value="all">All</SelectItem>
											</SelectGroup>
										</SelectContent>
									</Select>
									<p className="text-xs text-muted-foreground mt-1">
										Mark chapters for segments using SponsorBlock
									</p>
								</Field>

								<Field>
									<FieldLabel htmlFor="proxy">Proxy</FieldLabel>
									<Input
										id="proxy"
										placeholder="http://proxy.example.com:8080"
										value={options.proxy}
										onChange={(e) => updateOption("proxy", e.target.value)}
									/>
									<p className="text-xs text-muted-foreground mt-1">
										HTTP/HTTPS/SOCKS proxy URL
									</p>
								</Field>

								<Field>
									<FieldLabel htmlFor="downloadArchive">
										Download Archive
									</FieldLabel>
									<Input
										id="downloadArchive"
										placeholder="~/downloads/archive.txt"
										value={options.downloadArchive}
										onChange={(e) =>
											updateOption("downloadArchive", e.target.value)
										}
									/>
									<p className="text-xs text-muted-foreground mt-1">
										Skip videos already in this archive file
									</p>
								</Field>

								<Field orientation="horizontal" className="items-center">
									<Checkbox
										id="liveFromStart"
										checked={options.liveFromStart}
										onCheckedChange={(checked: boolean) =>
											updateOption("liveFromStart", checked)
										}
										className="h-4 w-4"
									/>
									<FieldLabel htmlFor="liveFromStart" className="mb-0">
										Live From Start (Download livestreams from the start)
									</FieldLabel>
								</Field>

								<Field orientation="horizontal" className="items-center">
									<Checkbox
										id="useAria2c"
										checked={options.useAria2c}
										onCheckedChange={(checked: boolean) =>
											updateOption("useAria2c", checked)
										}
										className="h-4 w-4"
									/>
									<FieldLabel htmlFor="useAria2c" className="mb-0">
										Use aria2c (External Downloader)
									</FieldLabel>
								</Field>
							</FieldGroup>
						</CardContent>
					</Card>

					{/* Generated Command */}
					<Card>
						<CardHeader>
							<CardTitle>Generated Command</CardTitle>
							<CardDescription>
								Copy and paste this command into your terminal
							</CardDescription>
						</CardHeader>
						<CardContent>
							<FieldGroup>
								<Field>
									<Textarea
										value={command}
										readOnly
										className="font-mono text-sm min-h-32"
									/>
								</Field>
								<div className="mt-2 w-full">
									<Button
										onClick={copyToClipboard}
										disabled={!options.url}
										className="w-full"
									>
										<IconCopy className="h-4 w-4 mr-2" />
										{copied ? "Copied!" : "Copy Command"}
									</Button>
								</div>
							</FieldGroup>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}
