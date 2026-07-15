type PageIntroProps = {
	title: string;
	description: string;
};

export function PageIntro({ title, description }: PageIntroProps) {
	return (
		<header className="section-heading">
			<h1>{title}</h1>
			<p>{description}</p>
		</header>
	);
}
