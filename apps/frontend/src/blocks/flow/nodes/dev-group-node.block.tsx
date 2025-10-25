"use client";

interface DevGroupNodeBlockProps {
	data: {
		label?: string;
	};
}

export function DevGroupNodeBlock({ data }: DevGroupNodeBlockProps) {
	const handleClick = () => {
		// TODO: Implement handle click logic
		console.log("Dev group clicked:", data.label);
	};

	return (
		<button
			type="button"
			className="relative w-full h-full bg-transparent border border-muted-foreground/45 border-dashed rounded-xl cursor-grab"
			onClick={handleClick}
		>
			<div className="absolute bottom-2 left-2 text-sm font-medium text-muted-foreground">
				Dev
			</div>
		</button>
	);
}
