import { Link } from "react-router-dom";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight01Icon } from "@hugeicons/core-free-icons";
import {
	Card,
	CardHeader,
	CardTitle,
	CardDescription,
	CardAction,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Tool {
	id: string;
	name: string;
	description: string;
	path: string;
	available: boolean;
}

const TOOLS: Tool[] = [
	{
		id: "yt-dlp",
		name: "yt-dlp",
		description: "Download videos from YouTube and other platforms",
		path: "/yt-dlp",
		available: true,
	},
	{
		id: "ffmpeg",
		name: "FFmpeg",
		description: "Convert and process video/audio files",
		path: "/ffmpeg",
		available: false,
	},
	{
		id: "imagemagick",
		name: "ImageMagick",
		description: "Edit and convert images",
		path: "/imagemagick",
		available: false,
	},
	{
		id: "curl",
		name: "curl",
		description: "Transfer data with URLs",
		path: "/curl",
		available: false,
	},
	{
		id: "git",
		name: "Git",
		description: "Version control and collaboration",
		path: "/git",
		available: false,
	},
	{
		id: "custom",
		name: "Custom Command",
		description: "Build your own custom command",
		path: "/custom",
		available: false,
	},
];

export function Home() {
	return (
		<div className="container mx-auto p-8 max-w-3xl">
			<div className="space-y-3">
				{TOOLS.map((tool) => (
					<Card
						key={tool.id}
						className={`transition-all group ${
							tool.available
								? "hover:border-primary hover:shadow-sm cursor-pointer"
								: "opacity-50"
						}`}
					>
						{tool.available ? (
							<Link to={tool.path} className="block">
								<CardHeader>
									<CardTitle>{tool.name}</CardTitle>
									<CardDescription>{tool.description}</CardDescription>
									<CardAction>
										<HugeiconsIcon
											icon={ArrowRight01Icon}
											className="text-primary transition-transform group-hover:translate-x-1"
										/>
									</CardAction>
								</CardHeader>
							</Link>
						) : (
							<CardHeader>
								<CardTitle>{tool.name}</CardTitle>
								<CardDescription>{tool.description}</CardDescription>
								<CardAction>
									<Badge variant="secondary">Coming Soon</Badge>
								</CardAction>
							</CardHeader>
						)}
					</Card>
				))}
			</div>
		</div>
	);
}
