import Link from "next/link";

export default function NotFound() {
	return (
		<main className="not-found" id="main-content" tabIndex={-1}>
			<p className="not-found__code">404</p>
			<h1>这里没有这篇文章</h1>
			<p>链接可能已经失效，也可能从未存在。</p>
			<Link href="/">返回首页</Link>
		</main>
	);
}
