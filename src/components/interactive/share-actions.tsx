"use client";

import { useRef, useState } from "react";

export function ShareActions({
	canonicalUrl,
	title,
}: {
	canonicalUrl: string;
	title: string;
}) {
	const input = useRef<HTMLInputElement>(null);
	const [status, setStatus] = useState("");
	const share = async () => {
		try {
			if (navigator.share)
				await navigator.share({ title, url: canonicalUrl });
			else if (navigator.clipboard) {
				await navigator.clipboard.writeText(canonicalUrl);
				setStatus("链接已复制");
			} else {
				input.current?.select();
				setStatus("请复制已选中的链接");
			}
		} catch (error) {
			if (error instanceof DOMException && error.name === "AbortError")
				return;
			input.current?.select();
			setStatus("请复制已选中的链接");
		}
	};
	return (
		<div className="share-actions">
			<button onClick={() => void share()} type="button">
				分享文章
			</button>
			<label>
				<span className="visually-hidden">文章链接</span>
				<input readOnly ref={input} value={canonicalUrl} />
			</label>
			<span aria-live="polite">{status}</span>
		</div>
	);
}
