// 设备数据配置文件

export interface Device {
	name: string;
	image: string;
	specs: string;
	description: string;
	link: string;
}

// 设备类别类型，支持品牌和自定义类别
export type DeviceCategory = Record<string, Device[]> & {
	自定义?: Device[];
};

export const devicesData: DeviceCategory = {
	OnePlus: [
		{
			name: "IQOO Neo 10 Pro +",
			image: "/images/device/iqoo-neo-10-pro-plus.webp",
			specs: "Gray / 32G + 512G",
			description:
				"超配双芯，性能强劲，适合游戏和多任务处理。",
			link: "https://www.vivo.com.cn/vivo/iqooneo10proplus/",
		},
	],
	Router: [
		{
			name: "ZTE U25S",
			image: "/images/device/zte-u25s.webp",
			specs: "3050mAh, WiFi 6",
			description:
				"适合出差和家庭使用的便携式wifi6路由器。",
			link: "https://www.ztemall.com/cn/goodsdetail/1537",
		},
	],
};
