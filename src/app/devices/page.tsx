import type { Metadata } from "next";
import Image from "next/image";

import { ExternalLink } from "@/components/showcase/external-link";
import { PageIntro } from "@/components/showcase/page-intro";
import { devices } from "@/lib/showcase/content";
import type { Device } from "@/lib/showcase/types";
import { absoluteUrl } from "@/lib/site";

export const metadata: Metadata = {
	alternates: { canonical: absoluteUrl("/devices/") },
	description: "查看 xinvStar 按实际用途整理的日常设备。",
	title: "设备",
};

const deviceGroups: readonly {
	category: Device["category"];
	label: string;
}[] = [
	{ category: "phone", label: "移动设备" },
	{ category: "network", label: "网络设备" },
	{ category: "computer", label: "计算设备" },
	{ category: "other", label: "其他设备" },
];

export default function DevicesPage() {
	return (
		<main
			className="page-shell showcase-page showcase-page--devices"
			id="main-content"
			tabIndex={-1}
		>
			<PageIntro
				description="按真实用途记录正在使用的设备，不用品牌标签代替使用场景。"
				title="设备"
			/>
			{deviceGroups.map((group) => {
				const items = devices.filter(
					(device) => device.category === group.category,
				);
				if (items.length === 0) return null;

				return (
					<section
						aria-labelledby={`devices-${group.category}`}
						key={group.category}
					>
						<h2 id={`devices-${group.category}`}>{group.label}</h2>
						<ul>
							{items.map((device) => (
								<li key={device.id}>
									<article>
										<Image
											alt={device.image.alt}
											height={device.image.height}
											src={device.image.src}
											width={device.image.width}
										/>
										<h3>{device.name}</h3>
										<p>{device.description}</p>
										<dl>
											<div>
												<dt>规格</dt>
												<dd>{device.specs}</dd>
											</div>
										</dl>
										{device.url ? (
											<ExternalLink link={device.url} />
										) : null}
									</article>
								</li>
							))}
						</ul>
					</section>
				);
			})}
		</main>
	);
}
