import { useOnceEffect } from "@reactuses/core";
import { useRef } from "react";

export function useEffectOnCondition(callback: () => void, condition: boolean) {
	const hasRun = useRef(false);

	useOnceEffect(() => {
		if (condition && !hasRun.current) {
			callback();
			hasRun.current = true;
		}
	}, [condition, callback]);
}
