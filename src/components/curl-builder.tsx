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

interface CurlOptions {
	method: string;
	url: string;
	useJson: boolean;
	jsonBody: string;
	formBody: string;
	rawBody: string;
	contentType: string;
	headers: string;
	queryParams: string;
	followRedirects: boolean;
	showHeaders: boolean;
	insecure: boolean;
	compressed: boolean;
	authType: string;
	username: string;
	password: string;
	bearerToken: string;
	dataMode: string;
	outputFile: string;
	proxy: string;
	timeout: string;
	retry: string;
	extraOptions: string;
}

type Preset = Partial<CurlOptions>;

const PRESETS: Record<
	string,
	{ name: string; description: string; options: Preset }
> = {
	jsonGet: {
		name: "JSON GET",
		description: "GET JSON API with Accept header",
		options: {
			method: "GET",
			useJson: false,
			contentType: "application/json",
			headers: "Accept: application/json",
		},
	},
	jsonPost: {
		name: "JSON POST",
		description: "POST JSON body with common headers",
		options: {
			method: "POST",
			useJson: true,
			contentType: "application/json",
			headers: "Accept: application/json",
		},
	},
	formPost: {
		name: "Form POST",
		description: "POST application/x-www-form-urlencoded form data",
		options: {
			method: "POST",
			useJson: false,
			dataMode: "form",
			contentType: "application/x-www-form-urlencoded",
		},
	},
	fileDownload: {
		name: "File Download",
		description: "Download file to disk with -O",
		options: {
			method: "GET",
			outputFile: "downloaded.file",
			followRedirects: true,
		},
	},
	bearerAuth: {
		name: "Bearer Auth API",
		description: "Use Authorization: Bearer <token> header",
		options: {
			method: "GET",
			authType: "bearer",
		},
	},
};

export function Builder() {
	const [options, setOptions] = useState<CurlOptions>({
		method: "GET",
		url: "",
		useJson: false,
		jsonBody: "",
		formBody: "",
		rawBody: "",
		contentType: "",
		headers: "",
		queryParams: "",
		followRedirects: true,
		showHeaders: false,
		insecure: false,
		compressed: false,
		authType: "none",
		username: "",
		password: "",
		bearerToken: "",
		dataMode: "json",
		outputFile: "",
		proxy: "",
		timeout: "",
		retry: "",
		extraOptions: "",
	});

	const [copied, setCopied] = useState(false);
	const [selectedPreset, setSelectedPreset] = useState<string>("");

	const updateOption = useCallback(
		<K extends keyof CurlOptions>(key: K, value: CurlOptions[K]) => {
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
		const parts: string[] = ["curl"];

		if (options.showHeaders) {
			parts.push("-i");
		}

		if (options.followRedirects) {
			parts.push("-L");
		}

		if (options.insecure) {
			parts.push("-k");
		}

		if (options.compressed) {
			parts.push("--compressed");
		}

		if (options.timeout) {
			parts.push("--max-time", options.timeout);
		}

		if (options.retry) {
			parts.push("--retry", options.retry);
		}

		if (options.proxy) {
			parts.push("--proxy", options.proxy);
		}

		// Method
		if (options.method !== "GET") {
			parts.push("-X", options.method);
		}

		// Headers
		if (options.contentType) {
			parts.push("-H", `"Content-Type: ${options.contentType}"`);
		}

		if (options.headers) {
			const headerLines = options.headers
				.split("\n")
				.map((line) => line.trim())
				.filter(Boolean);
			for (const line of headerLines) {
				parts.push("-H", `"${line}"`);
			}
		}

		// Auth
		if (options.authType === "basic" && options.username) {
			const userPass =
				options.password !== ""
					? `${options.username}:${options.password}`
					: options.username;
			parts.push("-u", `"${userPass}"`);
		}

		if (options.authType === "bearer" && options.bearerToken) {
			parts.push("-H", `"Authorization: Bearer ${options.bearerToken}"`);
		}

		// Body
		if (
			options.method === "POST" ||
			options.method === "PUT" ||
			options.method === "PATCH" ||
			options.method === "DELETE"
		) {
			if (options.dataMode === "json" && options.jsonBody) {
				parts.push("--data-binary", `'${options.jsonBody}'`);
			} else if (options.dataMode === "form" && options.formBody) {
				parts.push("--data-urlencode", `"${options.formBody}"`);
			} else if (options.dataMode === "raw" && options.rawBody) {
				parts.push("--data-binary", `'${options.rawBody}'`);
			}
		}

		// Extra options
		if (options.extraOptions) {
			parts.push(options.extraOptions);
		}

		// URL with query params
		if (!options.url) {
			return "# Please specify a URL";
		}

		let finalUrl = options.url;
		if (options.queryParams.trim()) {
			const qp = options.queryParams.trim();
			const hasQuestion = finalUrl.includes("?");
			finalUrl += hasQuestion ? `&${qp}` : `?${qp}`;
		}

		parts.push(`"${finalUrl}"`);

		// Output
		if (options.outputFile) {
			parts.push("-o", `"${options.outputFile}"`);
		}

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
						Select a preset to quickly configure common curl scenarios
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
								Configure HTTP method, URL, and output
							</CardDescription>
						</CardHeader>
						<CardContent>
							<FieldGroup>
								<Field>
									<FieldLabel htmlFor="url">URL *</FieldLabel>
									<Input
										id="url"
										placeholder="https://api.example.com/resource"
										value={options.url}
										onChange={(e) => updateOption("url", e.target.value)}
									/>
								</Field>

								<div className="grid grid-cols-2 gap-4">
									<Field>
										<FieldLabel htmlFor="method">Method</FieldLabel>
										<Select
											value={options.method}
											onValueChange={(value) => updateOption("method", value)}
										>
											<SelectTrigger id="method">
												<SelectValue />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="GET">GET</SelectItem>
												<SelectItem value="POST">POST</SelectItem>
												<SelectItem value="PUT">PUT</SelectItem>
												<SelectItem value="PATCH">PATCH</SelectItem>
												<SelectItem value="DELETE">DELETE</SelectItem>
												<SelectItem value="HEAD">HEAD</SelectItem>
												<SelectItem value="OPTIONS">OPTIONS</SelectItem>
											</SelectContent>
										</Select>
									</Field>

									<Field>
										<FieldLabel htmlFor="outputFile">
											Output File (optional)
										</FieldLabel>
										<Input
											id="outputFile"
											placeholder="output.json"
											value={options.outputFile}
											onChange={(e) =>
												updateOption("outputFile", e.target.value)
											}
										/>
									</Field>
								</div>

								<Field>
									<FieldLabel htmlFor="queryParams">
										Query Parameters (optional)
									</FieldLabel>
									<Input
										id="queryParams"
										placeholder="foo=bar&baz=qux"
										value={options.queryParams}
										onChange={(e) =>
											updateOption("queryParams", e.target.value)
										}
									/>
								</Field>
							</FieldGroup>
						</CardContent>
					</Card>

					{/* Headers & Body */}
					<Card>
						<CardHeader>
							<CardTitle>Headers & Body</CardTitle>
							<CardDescription>
								Set headers and request body content
							</CardDescription>
						</CardHeader>
						<CardContent>
							<FieldGroup>
								<Field>
									<FieldLabel htmlFor="contentType">
										Content-Type (optional)
									</FieldLabel>
									<Select
										value={options.contentType || "none"}
										onValueChange={(value) =>
											updateOption("contentType", value === "none" ? "" : value)
										}
									>
										<SelectTrigger id="contentType">
											<SelectValue placeholder="None" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="none">None</SelectItem>
											<SelectItem value="application/json">
												application/json
											</SelectItem>
											<SelectItem value="application/x-www-form-urlencoded">
												application/x-www-form-urlencoded
											</SelectItem>
											<SelectItem value="multipart/form-data">
												multipart/form-data
											</SelectItem>
											<SelectItem value="text/plain">text/plain</SelectItem>
										</SelectContent>
									</Select>
								</Field>

								<Field>
									<FieldLabel htmlFor="headers">
										Additional Headers (one per line)
									</FieldLabel>
									<Textarea
										id="headers"
										placeholder={"X-API-Key: ...\nX-Request-ID: ..."}
										value={options.headers}
										onChange={(e) => updateOption("headers", e.target.value)}
										className="font-mono text-xs"
									/>
								</Field>

								<Field>
									<FieldLabel htmlFor="dataMode">Body Mode</FieldLabel>
									<Select
										value={options.dataMode}
										onValueChange={(value) => updateOption("dataMode", value)}
									>
										<SelectTrigger id="dataMode">
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="json">JSON</SelectItem>
											<SelectItem value="form">Form (urlencoded)</SelectItem>
											<SelectItem value="raw">Raw</SelectItem>
										</SelectContent>
									</Select>
								</Field>

								{options.dataMode === "json" && (
									<Field>
										<FieldLabel htmlFor="jsonBody">
											JSON Body (sent as --data-binary)
										</FieldLabel>
										<Textarea
											id="jsonBody"
											placeholder='{"key": "value"}'
											value={options.jsonBody}
											onChange={(e) => updateOption("jsonBody", e.target.value)}
											className="font-mono text-xs"
										/>
									</Field>
								)}

								{options.dataMode === "form" && (
									<Field>
										<FieldLabel htmlFor="formBody">
											Form Body (key=value&key2=value2)
										</FieldLabel>
										<Textarea
											id="formBody"
											placeholder="foo=bar&baz=qux"
											value={options.formBody}
											onChange={(e) => updateOption("formBody", e.target.value)}
											className="font-mono text-xs"
										/>
									</Field>
								)}

								{options.dataMode === "raw" && (
									<Field>
										<FieldLabel htmlFor="rawBody">
											Raw Body (sent as --data-binary)
										</FieldLabel>
										<Textarea
											id="rawBody"
											placeholder="Any raw request body"
											value={options.rawBody}
											onChange={(e) => updateOption("rawBody", e.target.value)}
											className="font-mono text-xs"
										/>
									</Field>
								)}
							</FieldGroup>
						</CardContent>
					</Card>
				</div>

				<div className="space-y-6">
					{/* Authentication & Connection */}
					<Card>
						<CardHeader>
							<CardTitle>Authentication & Connection</CardTitle>
							<CardDescription>
								Configure auth, proxy, redirects, and TLS
							</CardDescription>
						</CardHeader>
						<CardContent>
							<FieldGroup>
								<Field>
									<FieldLabel htmlFor="authType">Auth Type</FieldLabel>
									<Select
										value={options.authType}
										onValueChange={(value) => updateOption("authType", value)}
									>
										<SelectTrigger id="authType">
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="none">None</SelectItem>
											<SelectItem value="basic">
												Basic (username/password)
											</SelectItem>
											<SelectItem value="bearer">Bearer Token</SelectItem>
										</SelectContent>
									</Select>
								</Field>

								{options.authType === "basic" && (
									<>
										<Field>
											<FieldLabel htmlFor="username">Username</FieldLabel>
											<Input
												id="username"
												value={options.username}
												onChange={(e) =>
													updateOption("username", e.target.value)
												}
											/>
										</Field>
										<Field>
											<FieldLabel htmlFor="password">
												Password (optional)
											</FieldLabel>
											<Input
												id="password"
												type="password"
												value={options.password}
												onChange={(e) =>
													updateOption("password", e.target.value)
												}
											/>
										</Field>
									</>
								)}

								{options.authType === "bearer" && (
									<Field>
										<FieldLabel htmlFor="bearerToken">Bearer Token</FieldLabel>
										<Textarea
											id="bearerToken"
											placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6..."
											value={options.bearerToken}
											onChange={(e) =>
												updateOption("bearerToken", e.target.value)
											}
											className="font-mono text-xs"
										/>
									</Field>
								)}

								<Field>
									<FieldLabel htmlFor="proxy">Proxy (optional)</FieldLabel>
									<Input
										id="proxy"
										placeholder="http://user:pass@proxy.example.com:8080"
										value={options.proxy}
										onChange={(e) => updateOption("proxy", e.target.value)}
									/>
								</Field>

								<Field>
									<FieldLabel htmlFor="timeout">
										Timeout (seconds, optional)
									</FieldLabel>
									<Input
										id="timeout"
										type="number"
										placeholder="e.g., 30"
										value={options.timeout}
										onChange={(e) => updateOption("timeout", e.target.value)}
									/>
								</Field>

								<Field>
									<FieldLabel htmlFor="retry">
										Retry count (optional)
									</FieldLabel>
									<Input
										id="retry"
										type="number"
										placeholder="e.g., 3"
										value={options.retry}
										onChange={(e) => updateOption("retry", e.target.value)}
									/>
								</Field>

								<Field orientation="horizontal" className="items-center">
									<Checkbox
										id="followRedirects"
										checked={options.followRedirects}
										onCheckedChange={(checked: boolean) =>
											updateOption("followRedirects", checked)
										}
										className="h-4 w-4"
									/>
									<FieldLabel htmlFor="followRedirects" className="mb-0">
										Follow redirects (-L)
									</FieldLabel>
								</Field>

								<Field orientation="horizontal" className="items-center">
									<Checkbox
										id="showHeaders"
										checked={options.showHeaders}
										onCheckedChange={(checked: boolean) =>
											updateOption("showHeaders", checked)
										}
										className="h-4 w-4"
									/>
									<FieldLabel htmlFor="showHeaders" className="mb-0">
										Show response headers (-i)
									</FieldLabel>
								</Field>

								<Field orientation="horizontal" className="items-center">
									<Checkbox
										id="insecure"
										checked={options.insecure}
										onCheckedChange={(checked: boolean) =>
											updateOption("insecure", checked)
										}
										className="h-4 w-4"
									/>
									<FieldLabel htmlFor="insecure" className="mb-0">
										Allow insecure TLS (-k)
									</FieldLabel>
								</Field>

								<Field orientation="horizontal" className="items-center">
									<Checkbox
										id="compressed"
										checked={options.compressed}
										onCheckedChange={(checked: boolean) =>
											updateOption("compressed", checked)
										}
										className="h-4 w-4"
									/>
									<FieldLabel htmlFor="compressed" className="mb-0">
										Request compressed response (--compressed)
									</FieldLabel>
								</Field>

								<Field>
									<FieldLabel htmlFor="extraOptions">
										Extra raw options (appended as-is)
									</FieldLabel>
									<Textarea
										id="extraOptions"
										placeholder="Any additional curl flags"
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
