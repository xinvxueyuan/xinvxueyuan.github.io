import type { ReactNode } from "react";

import type { ExternalLink as ExternalLinkData } from "@/lib/showcase/types";

type ExternalLinkProps = {
	children?: ReactNode;
	link: ExternalLinkData;
};

export function ExternalLink({ children, link }: ExternalLinkProps) {
	return (
		<a href={link.href} rel="noopener noreferrer" target="_blank">
			{children ?? link.label}
		</a>
	);
}
