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

interface GitOptions {
	repoPath: string;
	command: string;

	// Common
	branch: string;
	remote: string;
	files: string;

	// status
	statusShort: boolean;
	statusBranch: boolean;

	// commit
	commitMessage: string;
	commitAll: boolean;
	commitAmend: boolean;
	commitNoVerify: boolean;

	// push / pull
	pushForceMode: string; // none | force-with-lease | force
	setUpstream: boolean;
	pullRebase: boolean;

	// branch / checkout / switch
	newBranchName: string;
	checkoutTarget: string;

	// stash
	stashMessage: string;
	stashIncludeUntracked: boolean;
	stashKeepIndex: boolean;

	// log / diff
	logLimit: string;
	logOneline: boolean;
	logGraph: boolean;
	logDecorate: boolean;
	diffTarget: string;
	diffCached: boolean;
	diffNameOnly: boolean;

	// clone
	cloneUrl: string;
	cloneDirectory: string;
	cloneBare: boolean;

	// reset
	resetMode: string;
	resetTarget: string;

	// tag
	tagName: string;
	tagAnnotated: boolean;
	tagMessage: string;

	extraOptions: string;
}

type Preset = Partial<GitOptions>;

const PRESETS: Record<
	string,
	{ name: string; description: string; options: Preset }
> = {
	statusAndLog: {
		name: "Status & Short Log",
		description: "Check status and recent commits",
		options: {
			command: "status",
			logLimit: "10",
		},
	},
	initialCommit: {
		name: "Initial Commit",
		description: "Stage all and commit with a message",
		options: {
			command: "commit",
			commitAll: true,
			commitMessage: "Initial commit",
		},
	},
	featureBranch: {
		name: "Create Feature Branch",
		description: "Create and switch to a new branch",
		options: {
			command: "branch",
		},
	},
	syncCurrentBranch: {
		name: "Sync Current Branch",
		description: "Pull with rebase and push to origin",
		options: {
			command: "pull",
			remote: "origin",
			pullRebase: true,
		},
	},
	stashChanges: {
		name: "Stash Changes",
		description: "Stash with message and include untracked files",
		options: {
			command: "stash",
			stashIncludeUntracked: true,
		},
	},
};

export function Builder() {
	const [options, setOptions] = useState<GitOptions>({
		repoPath: "",
		command: "status",
		branch: "",
		remote: "origin",
		files: "",

		statusShort: false,
		statusBranch: false,

		commitMessage: "",
		commitAll: false,
		commitAmend: false,
		commitNoVerify: false,

		pushForceMode: "none",
		setUpstream: false,
		pullRebase: false,

		newBranchName: "",
		checkoutTarget: "",

		stashMessage: "",
		stashIncludeUntracked: false,
		stashKeepIndex: false,

		logLimit: "",
		logOneline: false,
		logGraph: false,
		logDecorate: false,
		diffTarget: "",
		diffCached: false,
		diffNameOnly: false,

		cloneUrl: "",
		cloneDirectory: "",
		cloneBare: false,

		resetMode: "mixed",
		resetTarget: "",

		tagName: "",
		tagAnnotated: true,
		tagMessage: "",

		extraOptions: "",
	});

	const [copied, setCopied] = useState(false);
	const [selectedPreset, setSelectedPreset] = useState<string>("");

	const updateOption = useCallback(
		<K extends keyof GitOptions>(key: K, value: GitOptions[K]) => {
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
		const parts: string[] = [];

		if (options.repoPath) {
			parts.push(`cd "${options.repoPath}" &&`);
		}

		parts.push("git");

		switch (options.command) {
			case "status": {
				parts.push("status");
				if (options.statusShort) {
					parts.push("--short");
				}
				if (options.statusBranch) {
					parts.push("--branch");
				}
				break;
			}
			case "log": {
				parts.push("log");
				if (options.logLimit) {
					parts.push("-n", options.logLimit);
				}
				if (options.logOneline) {
					parts.push("--oneline");
				}
				if (options.logGraph) {
					parts.push("--graph");
				}
				if (options.logDecorate) {
					parts.push("--decorate");
				}
				break;
			}
			case "add": {
				parts.push("add");
				if (options.files.trim()) {
					parts.push(options.files);
				} else {
					parts.push(".");
				}
				break;
			}
			case "commit": {
				parts.push("commit");
				if (options.commitAll) {
					parts.push("-a");
				}
				if (options.commitAmend) {
					parts.push("--amend");
				}
				if (options.commitNoVerify) {
					parts.push("--no-verify");
				}
				if (options.commitMessage) {
					parts.push("-m", `"${options.commitMessage}"`);
				}
				break;
			}
			case "push": {
				parts.push("push");
				if (options.setUpstream && options.branch) {
					parts.push("-u");
				}
				if (options.pushForceMode === "force-with-lease") {
					parts.push("--force-with-lease");
				} else if (options.pushForceMode === "force") {
					parts.push("--force");
				}
				if (options.remote) {
					parts.push(options.remote);
				}
				if (options.branch) {
					parts.push(options.branch);
				}
				break;
			}
			case "pull": {
				parts.push("pull");
				if (options.pullRebase) {
					parts.push("--rebase");
				}
				if (options.remote) {
					parts.push(options.remote);
				}
				if (options.branch) {
					parts.push(options.branch);
				}
				break;
			}
			case "branch": {
				parts.push("branch");
				if (options.newBranchName) {
					parts.push(options.newBranchName);
				}
				break;
			}
			case "checkout": {
				parts.push("checkout");
				if (options.newBranchName) {
					parts.push("-b", options.newBranchName);
				} else if (options.checkoutTarget) {
					parts.push(options.checkoutTarget);
				}
				break;
			}
			case "switch": {
				parts.push("switch");
				if (options.newBranchName) {
					parts.push("-c", options.newBranchName);
				} else if (options.checkoutTarget) {
					parts.push(options.checkoutTarget);
				}
				break;
			}
			case "stash": {
				parts.push("stash", "push");
				if (options.stashIncludeUntracked) {
					parts.push("--include-untracked");
				}
				if (options.stashKeepIndex) {
					parts.push("--keep-index");
				}
				if (options.stashMessage) {
					parts.push("-m", `"${options.stashMessage}"`);
				}
				break;
			}
			case "diff": {
				parts.push("diff");
				if (options.diffCached) {
					parts.push("--cached");
				}
				if (options.diffNameOnly) {
					parts.push("--name-only");
				}
				if (options.diffTarget) {
					parts.push(options.diffTarget);
				}
				if (options.files.trim()) {
					parts.push("--", options.files);
				}
				break;
			}
			case "clone": {
				parts.push("clone");
				if (options.cloneBare) {
					parts.push("--bare");
				}
				if (options.cloneUrl) {
					parts.push(options.cloneUrl);
				} else {
					return "# Please specify a clone URL";
				}
				if (options.cloneDirectory) {
					parts.push(options.cloneDirectory);
				}
				break;
			}
			case "reset": {
				parts.push("reset");
				if (options.resetMode && options.resetMode !== "mixed") {
					parts.push(`--${options.resetMode}`);
				}
				if (options.resetTarget) {
					parts.push(options.resetTarget);
				}
				break;
			}
			case "tag": {
				parts.push("tag");
				if (!options.tagName) {
					return "# Please specify a tag name";
				}
				if (options.tagAnnotated) {
					parts.push("-a");
				}
				parts.push(options.tagName);
				if (options.tagAnnotated && options.tagMessage) {
					parts.push("-m", `"${options.tagMessage}"`);
				}
				break;
			}
			default: {
				parts.push("status");
				break;
			}
		}

		if (options.extraOptions) {
			parts.push(options.extraOptions);
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
						Select a preset to quickly configure common Git commands
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
					{/* Repository & Command */}
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								Repository & Command
							</CardTitle>
							<CardDescription>
								Select the Git command and target repository
							</CardDescription>
						</CardHeader>
						<CardContent>
							<FieldGroup>
								<Field>
									<FieldLabel htmlFor="repoPath">
										Repository Path (optional)
									</FieldLabel>
									<Input
										id="repoPath"
										placeholder="/path/to/repo"
										value={options.repoPath}
										onChange={(e) => updateOption("repoPath", e.target.value)}
									/>
								</Field>

								<Field>
									<FieldLabel htmlFor="command">Command</FieldLabel>
									<Select
										value={options.command}
										onValueChange={(value) => updateOption("command", value)}
									>
										<SelectTrigger id="command">
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="status">status</SelectItem>
											<SelectItem value="log">log</SelectItem>
											<SelectItem value="add">add</SelectItem>
											<SelectItem value="commit">commit</SelectItem>
											<SelectItem value="push">push</SelectItem>
											<SelectItem value="pull">pull</SelectItem>
											<SelectItem value="branch">branch</SelectItem>
											<SelectItem value="checkout">checkout</SelectItem>
											<SelectItem value="switch">switch</SelectItem>
											<SelectItem value="stash">stash</SelectItem>
											<SelectItem value="diff">diff</SelectItem>
											<SelectItem value="clone">clone</SelectItem>
											<SelectItem value="reset">reset</SelectItem>
											<SelectItem value="tag">tag</SelectItem>
										</SelectContent>
									</Select>
								</Field>

								<Field>
									<FieldLabel htmlFor="files">
										Files / Paths (optional, space-separated)
									</FieldLabel>
									<Input
										id="files"
										placeholder="e.g., src/App.tsx README.md"
										value={options.files}
										onChange={(e) => updateOption("files", e.target.value)}
									/>
								</Field>
							</FieldGroup>
						</CardContent>
					</Card>

					{/* Command-specific Options (left column) */}
					{(options.command === "status" ||
						options.command === "commit" ||
						options.command === "add" ||
						options.command === "log" ||
						options.command === "diff" ||
						options.command === "clone") && (
						<Card>
							<CardHeader>
								<CardTitle>Command Options</CardTitle>
								<CardDescription>
									Configure options specific to the selected command
								</CardDescription>
							</CardHeader>
							<CardContent>
								<FieldGroup>
									{options.command === "status" && (
										<>
											<Field orientation="horizontal" className="items-center">
												<Checkbox
													id="statusShort"
													checked={options.statusShort}
													onCheckedChange={(checked: boolean) =>
														updateOption("statusShort", checked)
													}
													className="h-4 w-4"
												/>
												<FieldLabel htmlFor="statusShort" className="mb-0">
													Short output (--short)
												</FieldLabel>
											</Field>
											<Field orientation="horizontal" className="items-center">
												<Checkbox
													id="statusBranch"
													checked={options.statusBranch}
													onCheckedChange={(checked: boolean) =>
														updateOption("statusBranch", checked)
													}
													className="h-4 w-4"
												/>
												<FieldLabel htmlFor="statusBranch" className="mb-0">
													Show branch info (--branch)
												</FieldLabel>
											</Field>
										</>
									)}

									{options.command === "commit" && (
										<>
											<Field>
												<FieldLabel htmlFor="commitMessage">
													Commit Message
												</FieldLabel>
												<Input
													id="commitMessage"
													placeholder="Describe your changes"
													value={options.commitMessage}
													onChange={(e) =>
														updateOption("commitMessage", e.target.value)
													}
												/>
											</Field>
											<Field orientation="horizontal" className="items-center">
												<Checkbox
													id="commitAll"
													checked={options.commitAll}
													onCheckedChange={(checked: boolean) =>
														updateOption("commitAll", checked)
													}
													className="h-4 w-4"
												/>
												<FieldLabel htmlFor="commitAll" className="mb-0">
													Stage all modified and deleted files (-a)
												</FieldLabel>
											</Field>
											<Field orientation="horizontal" className="items-center">
												<Checkbox
													id="commitAmend"
													checked={options.commitAmend}
													onCheckedChange={(checked: boolean) =>
														updateOption("commitAmend", checked)
													}
													className="h-4 w-4"
												/>
												<FieldLabel htmlFor="commitAmend" className="mb-0">
													Amend last commit (--amend)
												</FieldLabel>
											</Field>
											<Field orientation="horizontal" className="items-center">
												<Checkbox
													id="commitNoVerify"
													checked={options.commitNoVerify}
													onCheckedChange={(checked: boolean) =>
														updateOption("commitNoVerify", checked)
													}
													className="h-4 w-4"
												/>
												<FieldLabel htmlFor="commitNoVerify" className="mb-0">
													Skip pre-commit and commit-msg hooks
												</FieldLabel>
											</Field>
										</>
									)}

									{options.command === "log" && (
										<>
											<Field>
												<FieldLabel htmlFor="logLimit">
													Number of commits to show
												</FieldLabel>
												<Input
													id="logLimit"
													type="number"
													placeholder="e.g., 10"
													value={options.logLimit}
													onChange={(e) =>
														updateOption("logLimit", e.target.value)
													}
												/>
											</Field>
											<Field orientation="horizontal" className="items-center">
												<Checkbox
													id="logOneline"
													checked={options.logOneline}
													onCheckedChange={(checked: boolean) =>
														updateOption("logOneline", checked)
													}
													className="h-4 w-4"
												/>
												<FieldLabel htmlFor="logOneline" className="mb-0">
													Oneline format (--oneline)
												</FieldLabel>
											</Field>
											<Field orientation="horizontal" className="items-center">
												<Checkbox
													id="logGraph"
													checked={options.logGraph}
													onCheckedChange={(checked: boolean) =>
														updateOption("logGraph", checked)
													}
													className="h-4 w-4"
												/>
												<FieldLabel htmlFor="logGraph" className="mb-0">
													Show graph (--graph)
												</FieldLabel>
											</Field>
											<Field orientation="horizontal" className="items-center">
												<Checkbox
													id="logDecorate"
													checked={options.logDecorate}
													onCheckedChange={(checked: boolean) =>
														updateOption("logDecorate", checked)
													}
													className="h-4 w-4"
												/>
												<FieldLabel htmlFor="logDecorate" className="mb-0">
													Show ref names (--decorate)
												</FieldLabel>
											</Field>
										</>
									)}

									{options.command === "diff" && (
										<>
											<Field>
												<FieldLabel htmlFor="diffTarget">
													Diff target (e.g., HEAD~1, main)
												</FieldLabel>
												<Input
													id="diffTarget"
													placeholder="e.g., HEAD~1"
													value={options.diffTarget}
													onChange={(e) =>
														updateOption("diffTarget", e.target.value)
													}
												/>
											</Field>
											<Field orientation="horizontal" className="items-center">
												<Checkbox
													id="diffCached"
													checked={options.diffCached}
													onCheckedChange={(checked: boolean) =>
														updateOption("diffCached", checked)
													}
													className="h-4 w-4"
												/>
												<FieldLabel htmlFor="diffCached" className="mb-0">
													Compare against index (--cached)
												</FieldLabel>
											</Field>
											<Field orientation="horizontal" className="items-center">
												<Checkbox
													id="diffNameOnly"
													checked={options.diffNameOnly}
													onCheckedChange={(checked: boolean) =>
														updateOption("diffNameOnly", checked)
													}
													className="h-4 w-4"
												/>
												<FieldLabel htmlFor="diffNameOnly" className="mb-0">
													Show only file names (--name-only)
												</FieldLabel>
											</Field>
										</>
									)}

									{options.command === "clone" && (
										<>
											<Field>
												<FieldLabel htmlFor="cloneUrl">Clone URL *</FieldLabel>
												<Input
													id="cloneUrl"
													placeholder="https://github.com/user/repo.git"
													value={options.cloneUrl}
													onChange={(e) =>
														updateOption("cloneUrl", e.target.value)
													}
												/>
											</Field>
											<Field>
												<FieldLabel htmlFor="cloneDirectory">
													Target directory (optional)
												</FieldLabel>
												<Input
													id="cloneDirectory"
													placeholder="repo"
													value={options.cloneDirectory}
													onChange={(e) =>
														updateOption("cloneDirectory", e.target.value)
													}
												/>
											</Field>
											<Field orientation="horizontal" className="items-center">
												<Checkbox
													id="cloneBare"
													checked={options.cloneBare}
													onCheckedChange={(checked: boolean) =>
														updateOption("cloneBare", checked)
													}
													className="h-4 w-4"
												/>
												<FieldLabel htmlFor="cloneBare" className="mb-0">
													Clone as bare repository (--bare)
												</FieldLabel>
											</Field>
										</>
									)}
								</FieldGroup>
							</CardContent>
						</Card>
					)}
				</div>

				<div className="space-y-6">
					{/* Branch / Remote / Reset / Tag */}
					<Card>
						<CardHeader>
							<CardTitle>Branch, Remote & More</CardTitle>
							<CardDescription>
								Configure branch, remote, reset, and tags
							</CardDescription>
						</CardHeader>
						<CardContent>
							<FieldGroup>
								{options.command === "push" || options.command === "pull" ? (
									<>
										<Field>
											<FieldLabel htmlFor="remote">Remote</FieldLabel>
											<Input
												id="remote"
												placeholder="origin"
												value={options.remote}
												onChange={(e) => updateOption("remote", e.target.value)}
											/>
										</Field>
										<Field>
											<FieldLabel htmlFor="branch">
												Branch (optional)
											</FieldLabel>
											<Input
												id="branch"
												placeholder="main"
												value={options.branch}
												onChange={(e) => updateOption("branch", e.target.value)}
											/>
										</Field>
										{options.command === "push" && (
											<>
												<Field
													orientation="horizontal"
													className="items-center"
												>
													<Checkbox
														id="setUpstream"
														checked={options.setUpstream}
														onCheckedChange={(checked: boolean) =>
															updateOption("setUpstream", checked)
														}
														className="h-4 w-4"
													/>
													<FieldLabel htmlFor="setUpstream" className="mb-0">
														Set upstream (-u)
													</FieldLabel>
												</Field>
												<Field>
													<FieldLabel htmlFor="pushForceMode">
														Force mode
													</FieldLabel>
													<Select
														value={options.pushForceMode}
														onValueChange={(value) =>
															updateOption("pushForceMode", value)
														}
													>
														<SelectTrigger id="pushForceMode">
															<SelectValue />
														</SelectTrigger>
														<SelectContent>
															<SelectItem value="none">No force</SelectItem>
															<SelectItem value="force-with-lease">
																--force-with-lease
															</SelectItem>
															<SelectItem value="force">--force</SelectItem>
														</SelectContent>
													</Select>
												</Field>
											</>
										)}
										{options.command === "pull" && (
											<Field orientation="horizontal" className="items-center">
												<Checkbox
													id="pullRebase"
													checked={options.pullRebase}
													onCheckedChange={(checked: boolean) =>
														updateOption("pullRebase", checked)
													}
													className="h-4 w-4"
												/>
												<FieldLabel htmlFor="pullRebase" className="mb-0">
													Use rebase instead of merge (--rebase)
												</FieldLabel>
											</Field>
										)}
									</>
								) : null}

								{options.command === "branch" ||
								options.command === "checkout" ||
								options.command === "switch" ? (
									<>
										<Field>
											<FieldLabel htmlFor="newBranchName">
												New branch name (optional)
											</FieldLabel>
											<Input
												id="newBranchName"
												placeholder="feature/my-branch"
												value={options.newBranchName}
												onChange={(e) =>
													updateOption("newBranchName", e.target.value)
												}
											/>
										</Field>
										<Field>
											<FieldLabel htmlFor="checkoutTarget">
												Target branch / ref
											</FieldLabel>
											<Input
												id="checkoutTarget"
												placeholder="main"
												value={options.checkoutTarget}
												onChange={(e) =>
													updateOption("checkoutTarget", e.target.value)
												}
											/>
										</Field>
									</>
								) : null}

								{options.command === "reset" && (
									<>
										<Field>
											<FieldLabel htmlFor="resetMode">Reset mode</FieldLabel>
											<Select
												value={options.resetMode}
												onValueChange={(value) =>
													updateOption("resetMode", value)
												}
											>
												<SelectTrigger id="resetMode">
													<SelectValue />
												</SelectTrigger>
												<SelectContent>
													<SelectItem value="soft">--soft</SelectItem>
													<SelectItem value="mixed">--mixed</SelectItem>
													<SelectItem value="hard">--hard</SelectItem>
												</SelectContent>
											</Select>
										</Field>
										<Field>
											<FieldLabel htmlFor="resetTarget">
												Target ref (e.g., HEAD~1, main)
											</FieldLabel>
											<Input
												id="resetTarget"
												placeholder="e.g., HEAD~1"
												value={options.resetTarget}
												onChange={(e) =>
													updateOption("resetTarget", e.target.value)
												}
											/>
										</Field>
									</>
								)}

								{options.command === "tag" && (
									<>
										<Field>
											<FieldLabel htmlFor="tagName">Tag name *</FieldLabel>
											<Input
												id="tagName"
												placeholder="v1.0.0"
												value={options.tagName}
												onChange={(e) =>
													updateOption("tagName", e.target.value)
												}
											/>
										</Field>
										<Field orientation="horizontal" className="items-center">
											<Checkbox
												id="tagAnnotated"
												checked={options.tagAnnotated}
												onCheckedChange={(checked: boolean) =>
													updateOption("tagAnnotated", checked)
												}
												className="h-4 w-4"
											/>
											<FieldLabel htmlFor="tagAnnotated" className="mb-0">
												Create annotated tag (-a)
											</FieldLabel>
										</Field>
										{options.tagAnnotated && (
											<Field>
												<FieldLabel htmlFor="tagMessage">
													Tag message (optional)
												</FieldLabel>
												<Input
													id="tagMessage"
													placeholder="Release v1.0.0"
													value={options.tagMessage}
													onChange={(e) =>
														updateOption("tagMessage", e.target.value)
													}
												/>
											</Field>
										)}
									</>
								)}

								{options.command === "stash" && (
									<>
										<Field>
											<FieldLabel htmlFor="stashMessage">
												Stash message (optional)
											</FieldLabel>
											<Input
												id="stashMessage"
												placeholder="WIP on feature"
												value={options.stashMessage}
												onChange={(e) =>
													updateOption("stashMessage", e.target.value)
												}
											/>
										</Field>
										<Field orientation="horizontal" className="items-center">
											<Checkbox
												id="stashIncludeUntracked"
												checked={options.stashIncludeUntracked}
												onCheckedChange={(checked: boolean) =>
													updateOption("stashIncludeUntracked", checked)
												}
												className="h-4 w-4"
											/>
											<FieldLabel
												htmlFor="stashIncludeUntracked"
												className="mb-0"
											>
												Include untracked files (--include-untracked)
											</FieldLabel>
										</Field>
										<Field orientation="horizontal" className="items-center">
											<Checkbox
												id="stashKeepIndex"
												checked={options.stashKeepIndex}
												onCheckedChange={(checked: boolean) =>
													updateOption("stashKeepIndex", checked)
												}
												className="h-4 w-4"
											/>
											<FieldLabel htmlFor="stashKeepIndex" className="mb-0">
												Keep index (--keep-index)
											</FieldLabel>
										</Field>
									</>
								)}

								<Field>
									<FieldLabel htmlFor="extraOptions">
										Extra raw options (appended as-is)
									</FieldLabel>
									<Textarea
										id="extraOptions"
										placeholder="Any additional git flags"
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
									<Button onClick={copyToClipboard} className="w-full">
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
