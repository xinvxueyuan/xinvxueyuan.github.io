import Link from "next/link";

type EmptyStateProps = {
	title: string;
	description: string;
	link?: {
		href: string;
		label: string;
	};
};

export function EmptyState({ title, description, link }: EmptyStateProps) {
	return (
		<section aria-labelledby="empty-state-title">
			<h2 id="empty-state-title">{title}</h2>
			<p>{description}</p>
			{link ? <Link href={link.href}>{link.label}</Link> : null}
		</section>
	);
}
