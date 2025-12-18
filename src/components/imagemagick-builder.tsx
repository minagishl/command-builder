import { useState, useCallback, useMemo } from "react";
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
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { IconCopy } from "@tabler/icons-react";

interface ImageMagickOptions {
	inputFile: string;
	outputFile: string;
	outputFormat: string;
	resize: string;
	quality: string;
	crop: string;
	rotate: string;
	flip: boolean;
	flop: boolean;
	grayscale: boolean;
	stripMetadata: boolean;
	background: string;
	flatten: boolean;
	blur: string;
	sharpen: string;
	density: string;
	extraOptions: string;
}

type Preset = Partial<ImageMagickOptions>;

const PRESETS: Record<
	string,
	{ name: string; description: string; options: Preset }
> = {
	webOptimized: {
		name: "Web Optimized JPEG",
		description: "Resize and compress for web (JPEG, quality ~80)",
		options: {
			outputFormat: "jpg",
			resize: "1920x1080>",
			quality: "80",
			stripMetadata: true,
		},
	},
	thumbnail: {
		name: "Thumbnail",
		description: "Create small thumbnail image",
		options: {
			outputFormat: "jpg",
			resize: "320x320>",
			quality: "75",
			stripMetadata: true,
		},
	},
	avatar: {
		name: "Avatar (Square)",
		description: "Center crop to square and resize",
		options: {
			outputFormat: "png",
			crop: "512x512+0+0",
			resize: "512x512!",
			stripMetadata: true,
		},
	},
	grayscaleWebp: {
		name: "Grayscale WebP",
		description: "Convert to grayscale WebP",
		options: {
			outputFormat: "webp",
			grayscale: true,
			quality: "80",
		},
	},
	printHighRes: {
		name: "Print (High Resolution)",
		description: "Increase density and keep high quality",
		options: {
			outputFormat: "tiff",
			density: "300",
			quality: "95",
		},
	},
};

export function Builder() {
	const [options, setOptions] = useState<ImageMagickOptions>({
		inputFile: "",
		outputFile: "",
		outputFormat: "auto",
		resize: "",
		quality: "",
		crop: "",
		rotate: "",
		flip: false,
		flop: false,
		grayscale: false,
		stripMetadata: true,
		background: "",
		flatten: false,
		blur: "",
		sharpen: "",
		density: "",
		extraOptions: "",
	});

	const [copied, setCopied] = useState(false);
	const [selectedPreset, setSelectedPreset] = useState<string>("");

	const updateOption = useCallback(
		<K extends keyof ImageMagickOptions>(
			key: K,
			value: ImageMagickOptions[K]
		) => {
			setOptions((prev) => ({ ...prev, [key]: value }));
		},
		[]
	);

	const applyPreset = useCallback((presetKey: string) => {
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
	}, []);

	const command = useMemo(() => {
		const parts: string[] = ["magick"];

		if (!options.inputFile) {
			return "# Please specify an input file";
		}

		parts.push(`"${options.inputFile}"`);

		if (options.resize) {
			parts.push("-resize", options.resize);
		}

		if (options.crop) {
			parts.push("-crop", options.crop);
		}

		if (options.rotate) {
			parts.push("-rotate", options.rotate);
		}

		if (options.flip) {
			parts.push("-flip");
		}

		if (options.flop) {
			parts.push("-flop");
		}

		if (options.grayscale) {
			parts.push("-colorspace", "Gray");
		}

		if (options.quality) {
			parts.push("-quality", options.quality);
		}

		if (options.density) {
			parts.push("-density", options.density);
		}

		if (options.blur) {
			parts.push("-blur", options.blur);
		}

		if (options.sharpen) {
			parts.push("-sharpen", options.sharpen);
		}

		if (options.background) {
			parts.push("-background", options.background);
		}

		if (options.flatten) {
			parts.push("-flatten");
		}

		if (options.stripMetadata) {
			parts.push("-strip");
		}

		if (options.extraOptions) {
			parts.push(options.extraOptions);
		}

		const target =
			options.outputFile ||
			(options.outputFormat === "auto"
				? "output"
				: `output.${options.outputFormat}`);

		parts.push(`"${target}"`);

		return parts.join(" ");
	}, [options]);

	const copyToClipboard = useCallback(async () => {
		try {
			await navigator.clipboard.writeText(command);
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		} catch (err) {
			console.error("Failed to copy:", err);
		}
	}, [command]);

	return (
		<div className="container mx-auto p-4 max-w-6xl">
			{/* Preset Selection */}
			<Card className="mb-6">
				<CardHeader>
					<CardTitle>Quick Presets</CardTitle>
					<CardDescription>
						Select a preset to quickly configure common ImageMagick scenarios
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
								<SelectItem value="none">None (Custom Settings)</SelectItem>
								{Object.entries(PRESETS).map(([key, preset]) => (
									<SelectItem key={key} value={key}>
										{preset.name}
									</SelectItem>
								))}
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
								Configure input, output, and basic transforms
							</CardDescription>
						</CardHeader>
						<CardContent>
							<FieldGroup>
								<Field>
									<FieldLabel htmlFor="inputFile">Input File *</FieldLabel>
									<Input
										id="inputFile"
										placeholder="/path/to/input.png"
										value={options.inputFile}
										onChange={(e) => updateOption("inputFile", e.target.value)}
									/>
								</Field>

								<Field>
									<FieldLabel htmlFor="outputFile">
										Output File (optional)
									</FieldLabel>
									<Input
										id="outputFile"
										placeholder="output.png"
										value={options.outputFile}
										onChange={(e) => updateOption("outputFile", e.target.value)}
									/>
								</Field>

								<Field>
									<FieldLabel htmlFor="outputFormat">Output Format</FieldLabel>
									<Select
										value={options.outputFormat}
										onValueChange={(value) =>
											updateOption(
												"outputFormat",
												value as ImageMagickOptions["outputFormat"]
											)
										}
									>
										<SelectTrigger id="outputFormat">
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="auto">
												Auto (from output file)
											</SelectItem>
											<SelectItem value="png">PNG</SelectItem>
											<SelectItem value="jpg">JPEG</SelectItem>
											<SelectItem value="webp">WebP</SelectItem>
											<SelectItem value="gif">GIF</SelectItem>
											<SelectItem value="tiff">TIFF</SelectItem>
											<SelectItem value="bmp">BMP</SelectItem>
										</SelectContent>
									</Select>
								</Field>

								<Field>
									<FieldLabel htmlFor="resize">Resize (optional)</FieldLabel>
									<Input
										id="resize"
										placeholder="e.g., 1920x1080, 50%, 800x800>"
										value={options.resize}
										onChange={(e) => updateOption("resize", e.target.value)}
									/>
								</Field>

								<Field>
									<FieldLabel htmlFor="crop">Crop (optional)</FieldLabel>
									<Input
										id="crop"
										placeholder="e.g., 512x512+0+0"
										value={options.crop}
										onChange={(e) => updateOption("crop", e.target.value)}
									/>
								</Field>

								<Field>
									<FieldLabel htmlFor="rotate">Rotate (degrees)</FieldLabel>
									<Input
										id="rotate"
										type="number"
										placeholder="e.g., 90"
										value={options.rotate}
										onChange={(e) => updateOption("rotate", e.target.value)}
									/>
								</Field>

								<Field>
									<FieldLabel htmlFor="quality">
										Quality (0-100, optional)
									</FieldLabel>
									<Input
										id="quality"
										type="number"
										min="0"
										max="100"
										placeholder="e.g., 80"
										value={options.quality}
										onChange={(e) => updateOption("quality", e.target.value)}
									/>
								</Field>
							</FieldGroup>
						</CardContent>
					</Card>

					{/* Effects & Colors */}
					<Card>
						<CardHeader>
							<CardTitle>Effects & Colors</CardTitle>
							<CardDescription>
								Flip, grayscale, blur, sharpen, and background
							</CardDescription>
						</CardHeader>
						<CardContent>
							<FieldGroup>
								<Field orientation="horizontal" className="items-center">
									<Checkbox
										id="flip"
										checked={options.flip}
										onCheckedChange={(checked: boolean) =>
											updateOption("flip", checked)
										}
										className="h-4 w-4"
									/>
									<FieldLabel htmlFor="flip" className="mb-0">
										Flip vertically
									</FieldLabel>
								</Field>

								<Field orientation="horizontal" className="items-center">
									<Checkbox
										id="flop"
										checked={options.flop}
										onCheckedChange={(checked: boolean) =>
											updateOption("flop", checked)
										}
										className="h-4 w-4"
									/>
									<FieldLabel htmlFor="flop" className="mb-0">
										Flip horizontally (flop)
									</FieldLabel>
								</Field>

								<Field orientation="horizontal" className="items-center">
									<Checkbox
										id="grayscale"
										checked={options.grayscale}
										onCheckedChange={(checked: boolean) =>
											updateOption("grayscale", checked)
										}
										className="h-4 w-4"
									/>
									<FieldLabel htmlFor="grayscale" className="mb-0">
										Convert to grayscale
									</FieldLabel>
								</Field>

								<Field>
									<FieldLabel htmlFor="blur">Blur (optional)</FieldLabel>
									<Input
										id="blur"
										placeholder="e.g., 0x2"
										value={options.blur}
										onChange={(e) => updateOption("blur", e.target.value)}
									/>
								</Field>

								<Field>
									<FieldLabel htmlFor="sharpen">Sharpen (optional)</FieldLabel>
									<Input
										id="sharpen"
										placeholder="e.g., 0x1"
										value={options.sharpen}
										onChange={(e) => updateOption("sharpen", e.target.value)}
									/>
								</Field>

								<Field>
									<FieldLabel htmlFor="background">
										Background color (optional)
									</FieldLabel>
									<Input
										id="background"
										placeholder="e.g., white, #00000000"
										value={options.background}
										onChange={(e) => updateOption("background", e.target.value)}
									/>
								</Field>

								<Field orientation="horizontal" className="items-center">
									<Checkbox
										id="flatten"
										checked={options.flatten}
										onCheckedChange={(checked: boolean) =>
											updateOption("flatten", checked)
										}
										className="h-4 w-4"
									/>
									<FieldLabel htmlFor="flatten" className="mb-0">
										Flatten layers
									</FieldLabel>
								</Field>
							</FieldGroup>
						</CardContent>
					</Card>
				</div>

				<div className="space-y-6">
					{/* Advanced Options */}
					<Card>
						<CardHeader>
							<CardTitle>Advanced Options</CardTitle>
							<CardDescription>
								Density, metadata, and raw flags
							</CardDescription>
						</CardHeader>
						<CardContent>
							<FieldGroup>
								<Field>
									<FieldLabel htmlFor="density">
										Density (DPI, optional)
									</FieldLabel>
									<Input
										id="density"
										placeholder="e.g., 300"
										value={options.density}
										onChange={(e) => updateOption("density", e.target.value)}
									/>
								</Field>

								<Field orientation="horizontal" className="items-center">
									<Checkbox
										id="stripMetadata"
										checked={options.stripMetadata}
										onCheckedChange={(checked: boolean) =>
											updateOption("stripMetadata", checked)
										}
										className="h-4 w-4"
									/>
									<FieldLabel htmlFor="stripMetadata" className="mb-0">
										Strip metadata (EXIF, ICC, etc.)
									</FieldLabel>
								</Field>

								<Field>
									<FieldLabel htmlFor="extraOptions">
										Extra raw options (appended as-is)
									</FieldLabel>
									<Textarea
										id="extraOptions"
										placeholder="Any additional ImageMagick flags"
										value={options.extraOptions}
										onChange={(e) =>
											updateOption("extraOptions", e.target.value)
										}
										className="font-mono text-xs"
									/>
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
										disabled={!options.inputFile}
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
