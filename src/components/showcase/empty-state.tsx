import Link from "next/link";
import { useId } from "react";

type EmptyStateProps = {
	title: string;
	description: string;
	link?: {
		href: string;
		label: string;
	};
};

export function EmptyState({ title, description, link }: EmptyStateProps) {
	const titleId = useId();

	return (
		<section aria-labelledby={titleId} className="showcase-empty-state">
			<h2 id={titleId}>{title}</h2>
			<p>{description}</p>
			{link ? <Link href={link.href}>{link.label}</Link> : null}
		</section>
	);
}
