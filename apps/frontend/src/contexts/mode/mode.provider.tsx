"use client";

import type React from "react";
import { ModeAdapter } from "./mode.adapter";

interface ModeProviderProps {
	children: React.ReactNode;
}

export function ModeProvider({ children }: ModeProviderProps) {
	// Initialize with null mode, adapter will detect and set it
	const modeContext = {
		mode: null,
	};

	return <ModeAdapter modeContext={modeContext}>{children}</ModeAdapter>;
}

