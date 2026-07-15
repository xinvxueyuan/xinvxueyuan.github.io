import Link from "next/link";

export function SiteFooter() {
	return (
		<footer className="site-footer">
			<div className="site-footer__inner">
				<p>沿着文章的星轨，继续写，也继续问。</p>
				<p>
					<Link href="/">xinvStar</Link>
					<span aria-hidden="true"> · </span>
					<Link href="/rss.xml">RSS</Link>
					<span aria-hidden="true"> · </span>
					<Link href="/atom.xml">Atom</Link>
					<span aria-hidden="true"> · </span>
					<Link href="/albums/">相册</Link>
					<span aria-hidden="true"> · </span>
					<Link href="/friends/">友链</Link>
					<span aria-hidden="true"> · </span>
					<span>{new Date().getUTCFullYear()}</span>
				</p>
			</div>
		</footer>
	);
}
