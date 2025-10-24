import type { Message } from "@langchain/langgraph-sdk";
import {
	useCallback,
	useEffect,
	useEffectEvent,
	useMemo,
	useRef,
	useState,
} from "react";

interface ScrollState {
	isAtBottom: boolean;
	autoScrollEnabled: boolean;
}

interface UseAutoScrollOptions {
	offset?: number;
	smooth?: boolean;
	content?: React.ReactNode;
	messages?: Message[];
	scrollRef?: React.RefObject<HTMLDivElement | null>;
}

export function useAutoScroll(options: UseAutoScrollOptions = {}) {
	const {
		offset = 20,
		smooth = false,
		content,
		messages,
		scrollRef: externalScrollRef,
	} = options;
	const internalScrollRef = useRef<HTMLDivElement>(null);
	const scrollRef = externalScrollRef || internalScrollRef;
	const lastContentHeight = useRef(0);
	const userHasScrolled = useRef(false);

	const [scrollState, setScrollState] = useState<ScrollState>({
		isAtBottom: true,
		autoScrollEnabled: true,
	});

	// Compute content hash from messages if provided
	const contentHash = useMemo(() => {
		if (!messages || !Array.isArray(messages)) {
			return "";
		}

		const contentString = messages
			.map((msg) => `${msg.id}-${msg.type}-${msg.content || ""}`)
			.join("|");

		return contentString;
	}, [messages]);

	// Use contentHash if messages provided, otherwise use content prop
	const trackingContent = messages ? contentHash : content;

	const checkIsAtBottom = useCallback(
		(element: HTMLElement) => {
			const { scrollTop, scrollHeight, clientHeight } = element;
			const distanceToBottom = Math.abs(
				scrollHeight - scrollTop - clientHeight,
			);
			return distanceToBottom <= offset;
		},
		[offset],
	);

	const scrollToBottom = useCallback(
		(instant?: boolean) => {
			if (!scrollRef.current) return;

			const targetScrollTop =
				scrollRef.current.scrollHeight - scrollRef.current.clientHeight;

			if (instant) {
				scrollRef.current.scrollTop = targetScrollTop;
			} else {
				scrollRef.current.scrollTo({
					top: targetScrollTop,
					behavior: smooth ? "smooth" : "auto",
				});
			}

			setScrollState({
				isAtBottom: true,
				autoScrollEnabled: true,
			});
			userHasScrolled.current = false;
		},
		[smooth, scrollRef],
	);

	const handleScroll = useCallback(() => {
		if (!scrollRef.current) return;

		const atBottom = checkIsAtBottom(scrollRef.current);

		setScrollState((prev) => ({
			isAtBottom: atBottom,
			// Re-enable auto-scroll if at the bottom
			autoScrollEnabled: atBottom ? true : prev.autoScrollEnabled,
		}));

		// Reset user scroll flag when back at bottom
		if (atBottom) {
			userHasScrolled.current = false;
		}
	}, [checkIsAtBottom, scrollRef]);

	useEffect(() => {
		const element = scrollRef.current;
		if (!element) return;

		element.addEventListener("scroll", handleScroll, { passive: true });
		return () => element.removeEventListener("scroll", handleScroll);
	}, [handleScroll, scrollRef]);

	// Initialize isAtBottom on mount based on current scroll position
	useEffect(() => {
		const element = scrollRef.current;
		if (!element) return;

		const atBottom = checkIsAtBottom(element);
		setScrollState((prev) => ({
			...prev,
			isAtBottom: atBottom,
			// If we start at bottom, enable auto-scroll
			autoScrollEnabled: atBottom || prev.autoScrollEnabled,
		}));
	}, [checkIsAtBottom, scrollRef]);

	useEffect(() => {
		const scrollElement = scrollRef.current;
		if (!scrollElement) return;

		const currentHeight = scrollElement.scrollHeight;
		const hasNewContent = currentHeight !== lastContentHeight.current;

		if (hasNewContent) {
			// If auto-scroll is enabled OR the user is currently at (or near) the bottom,
			// scroll to bottom on new content
			if (scrollState.autoScrollEnabled || checkIsAtBottom(scrollElement)) {
				// Use a small delay to ensure content is fully rendered
				setTimeout(() => {
					scrollToBottom(lastContentHeight.current === 0);
				}, 50);
			}
			lastContentHeight.current = currentHeight;
		}
	}, [
		scrollState.autoScrollEnabled,
		scrollToBottom,
		checkIsAtBottom,
		scrollRef,
	]);

	useEffect(() => {
		const element = scrollRef.current;
		if (!element) return;

		const resizeObserver = new ResizeObserver(() => {
			if (scrollState.autoScrollEnabled) {
				scrollToBottom(true);
			}
		});

		resizeObserver.observe(element);
		return () => resizeObserver.disconnect();
	}, [scrollState.autoScrollEnabled, scrollToBottom, scrollRef]);

	const disableAutoScroll = useCallback(() => {
		if (!scrollRef.current) return;

		const atBottom = checkIsAtBottom(scrollRef.current);

		// Only disable if not at bottom and user initiated the scroll
		if (!atBottom && !userHasScrolled.current) {
			userHasScrolled.current = true;
			setScrollState((prev) => ({
				...prev,
				autoScrollEnabled: false,
			}));
		}
	}, [checkIsAtBottom, scrollRef]);

	return {
		scrollRef: internalScrollRef, // Always return internal ref for backward compatibility
		isAtBottom: scrollState.isAtBottom,
		autoScrollEnabled: scrollState.autoScrollEnabled,
		scrollToBottom: () => scrollToBottom(false),
		disableAutoScroll,
	};
}
