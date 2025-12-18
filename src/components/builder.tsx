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
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
	IconCopy,
	IconDownload,
	IconMusic,
	IconVideo,
	IconFileText,
	IconSettings,
	IconListTree,
} from "@tabler/icons-react";

interface YtDlpOptions {
	url: string;
	quality: string;
	format: string;
	audioOnly: boolean;
	outputPath: string;
	outputTemplate: string;
	subtitles: string;
	subtitleLang: string;
	embedSubtitles: boolean;
	embedThumbnail: boolean;
	embedMetadata: boolean;
	playlist: string;
	playlistStart: string;
	playlistEnd: string;
	rateLimit: string;
	cookies: string;
	useAria2c: boolean;
}

export function Builder() {
	const [options, setOptions] = React.useState<YtDlpOptions>({
		url: "",
		quality: "best",
		format: "mp4",
		audioOnly: false,
		outputPath: "",
		outputTemplate: "%(title)s.%(ext)s",
		subtitles: "none",
		subtitleLang: "en",
		embedSubtitles: false,
		embedThumbnail: false,
		embedMetadata: false,
		playlist: "all",
		playlistStart: "",
		playlistEnd: "",
		rateLimit: "",
		cookies: "",
		useAria2c: false,
	});

	const [command, setCommand] = React.useState("");
	const [copied, setCopied] = React.useState(false);

	const updateOption = <K extends keyof YtDlpOptions>(
		key: K,
		value: YtDlpOptions[K]
	) => {
		setOptions((prev) => ({ ...prev, [key]: value }));
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

		if (options.embedSubtitles) {
			parts.push("--embed-subs");
		}

		// Metadata
		if (options.embedThumbnail) {
			parts.push("--embed-thumbnail");
		}
		if (options.embedMetadata) {
			parts.push("--embed-metadata");
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

		// Advanced options
		if (options.rateLimit) {
			parts.push("--limit-rate", options.rateLimit);
		}
		if (options.cookies) {
			parts.push("--cookies", options.cookies);
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
			<div className="grid gap-6 lg:grid-cols-2">
				<div className="space-y-6">
					{/* Basic Options */}
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<IconDownload className="h-5 w-5" />
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
										<IconMusic className="h-4 w-4 inline mr-2" />
										Audio Only (Extract Audio)
									</FieldLabel>
								</Field>
							</FieldGroup>
						</CardContent>
					</Card>

					{/* Output Options */}
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<IconFileText className="h-5 w-5" />
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
								<IconVideo className="h-5 w-5" />
								Subtitle & Metadata
							</CardTitle>
							<CardDescription>
								Configure subtitles and metadata options
							</CardDescription>
						</CardHeader>
						<CardContent>
							<FieldGroup>
								<div className="grid grid-cols-2 gap-4">
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
								<IconListTree className="h-5 w-5" />
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
								<IconSettings className="h-5 w-5" />
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
									<FieldLabel htmlFor="cookies">Cookies File Path</FieldLabel>
									<Input
										id="cookies"
										placeholder="/path/to/cookies.txt"
										value={options.cookies}
										onChange={(e) => updateOption("cookies", e.target.value)}
									/>
									<p className="text-xs text-muted-foreground mt-1">
										Path to Netscape format cookies file
									</p>
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
								<div className="flex gap-2">
									<Button
										onClick={copyToClipboard}
										disabled={!options.url}
										className="flex-1"
									>
										<IconCopy className="h-4 w-4 mr-2" />
										{copied ? "Copied!" : "Copy Command"}
									</Button>
									{copied && (
										<Badge variant="outline" className="self-center">
											Copied to clipboard!
										</Badge>
									)}
								</div>
							</FieldGroup>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}
