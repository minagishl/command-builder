import { Link, useLocation } from "react-router-dom";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowLeft01Icon } from "@hugeicons/core-free-icons";

export function Header() {
	const location = useLocation();
	const isHome = location.pathname === "/";

	return (
		<header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
			<div className="container mx-auto flex h-14 items-center px-4">
				{!isHome && (
					<Link
						to="/"
						className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
					>
						<HugeiconsIcon icon={ArrowLeft01Icon} className="size-4" /> Back
					</Link>
				)}
			</div>
		</header>
	);
}
