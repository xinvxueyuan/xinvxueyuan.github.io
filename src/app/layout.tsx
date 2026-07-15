import type { Metadata } from "next";
import type React from "react";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { absoluteUrl, siteConfig } from "@/lib/site";

import "katex/dist/katex.min.css";
import "./globals.css";

export const metadata: Metadata = {
	metadataBase: new URL(siteConfig.url),
	title: {
		default: siteConfig.title,
		template: `%s · ${siteConfig.title}`,
	},
	description: siteConfig.description,
	openGraph: {
		description: siteConfig.description,
		images: [absoluteUrl(siteConfig.defaultOgImage)],
		locale: siteConfig.locale,
		siteName: siteConfig.title,
		title: siteConfig.title,
		type: "website",
		url: siteConfig.url,
	},
};

const themeScript = `
try {
  const stored = localStorage.getItem("xinvstar-theme");
  const theme = stored === "dark" || stored === "light"
    ? stored
    : matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
} catch (_) {
  document.documentElement.dataset.theme = matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}`;

export default function RootLayout({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	return (
		<html lang="zh-CN" suppressHydrationWarning>
			<head>
				<script dangerouslySetInnerHTML={{ __html: themeScript }} />
			</head>
			<body>
				<a className="skip-link" href="#main-content">
					跳到主要内容
				</a>
				<SiteHeader />
				{children}
				<SiteFooter />
			</body>
		</html>
	);
}
