import Link from "next/link";

import { ThemeToggle } from "@/components/theme-toggle";

export function SiteHeader() {
	return (
		<header className="site-header">
			<nav aria-label="主导航" className="site-header__inner">
				<Link className="site-brand" href="/">
					<span aria-hidden="true" className="site-brand__mark">
						✦
					</span>
					<span>xinvStar</span>
				</Link>
				<div className="site-header__links">
					<Link href="/archive/">归档</Link>
					<Link href="/search/">搜索</Link>
					<Link href="/about/">关于</Link>
					<Link href="/projects/">项目</Link>
				</div>
				<ThemeToggle />
			</nav>
		</header>
	);
}
