import type { Album, AlbumPhoto, ShowcaseImage } from "../lib/showcase/types";

const photo = (
	id: string,
	alt: string,
	width: number,
	height: number,
): AlbumPhoto => ({
	id,
	image: {
		src: `/images/albums/AcgExample/${id}.webp`,
		alt,
		width,
		height,
	},
});

const cover: ShowcaseImage = {
	src: "/images/albums/AcgExample/cover.webp",
	alt: "ACG 插画收藏相册封面",
	width: 6400,
	height: 3396,
};

export const albums: readonly Album[] = [
	{
		slug: "acg-example",
		title: "一些可爱的图片",
		description: "一组 ACG 插画收藏。",
		date: "2025-08-01",
		location: "Bilibili",
		tags: ["ACG", "插画"],
		cover,
		photos: [
			photo("1", "夜色中的蓝发角色插画", 1920, 1356),
			photo(
				"1a7a9ff30d0b7cf03b9fdbd1dd4cf0ad90a344eb",
				"白色背景中的角色立绘",
				2655,
				3700,
			),
			photo("2", "暖色天空下的角色插画", 1920, 1080),
			photo("3", "宽幅场景角色插画", 6400, 3396),
			photo("4", "明亮色调的双人插画", 2000, 1200),
			photo(
				"464b547c424f36e7c6c38e0c2c151759a3bc68ec",
				"纵向构图的动漫角色插画",
				1000,
				1414,
			),
			photo(
				"4986499bffa3b14c572c22c1ce441fc2cd94d63f",
				"室内场景角色插画",
				1914,
				1080,
			),
			photo(
				"5d662a33907ffe4edd7261ea4b374ff0a01e2dde",
				"浅色背景角色肖像",
				1031,
				1403,
			),
			photo(
				"6765bb292ea65ebcff37845ee718cc0e290750052",
				"竖屏角色全身插画",
				1192,
				2000,
			),
			photo(
				"711ce964e0a5c708aa174d8f6d7ee4e4bb60d356",
				"竖向角色主题插画",
				1447,
				2047,
			),
			photo(
				"91ae6186d2cf1af536b57c78ad7134ca1c8cbfe0",
				"精细角色立绘",
				2160,
				3054,
			),
			photo(
				"ca3c3f88c47fac7bdda5b8b29ca638dcee769704",
				"柔和色彩角色插画",
				1976,
				2874,
			),
			photo("d1", "自然景色中的角色插画", 5856, 3904),
			photo("d2", "横向双人主题插画", 2000, 1200),
			photo("d3", "蓝色调宽屏角色插画", 2560, 1440),
			photo("d4", "高分辨率场景插画", 3840, 2160),
			photo("d5", "宽屏人物场景插画", 2048, 1152),
			photo("d6", "夜景主题宽屏插画", 1920, 1080),
			photo("d7", "明亮主题宽屏插画", 1920, 1080),
			photo("d8", "电影比例角色场景插画", 2880, 1620),
			photo(
				"db67d185b865ebeb42be0ee1948952586147971e",
				"纵向角色肖像插画",
				1307,
				2059,
			),
			photo(
				"fd450b78411a7548183aa291bb4cbb99d0bc2bed",
				"竖向角色全身主题插画",
				2000,
				2828,
			),
		],
	},
];
