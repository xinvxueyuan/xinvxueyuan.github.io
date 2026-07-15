import type { Device } from "../lib/showcase/types";

const devicesData = [
	{
		id: "iqoo-neo-10-pro-plus",
		name: "iQOO Neo 10 Pro+",
		category: "phone",
		specs: "灰色，32 GB + 512 GB",
		description: "日常使用的移动设备。",
		image: {
			src: "/images/device/iqoo-neo-10-pro-plus.webp",
			alt: "iQOO Neo 10 Pro+ 手机",
			width: 750,
			height: 750,
		},
		url: {
			label: "产品页面",
			href: "https://www.vivo.com.cn/vivo/iqooneo10proplus/",
		},
	},
	{
		id: "zte-u25s",
		name: "ZTE U25S",
		category: "network",
		specs: "3050 mAh，Wi-Fi 6",
		description: "便携式无线网络设备。",
		image: {
			src: "/images/device/zte-u25s.webp",
			alt: "ZTE U25S 便携式路由器",
			width: 800,
			height: 800,
		},
		url: {
			label: "产品页面",
			href: "https://www.ztemall.com/cn/goodsdetail/1537",
		},
	},
] as const satisfies readonly Device[];

export const devices: readonly Device[] = devicesData;
