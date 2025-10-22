interface DevGroupNodeViewProps {
	onClick?: () => void;
}

export function DevGroupNodeView({ onClick }: DevGroupNodeViewProps) {
	return (
		<button
			type="button"
			className="relative w-full h-full bg-transparent border border-muted-foreground/45 border-dashed rounded-xl cursor-grab"
			onClick={onClick}
		>
			<div className="absolute bottom-2 left-2 text-sm font-medium text-muted-foreground">
				Dev
			</div>
		</button>
	);
}
