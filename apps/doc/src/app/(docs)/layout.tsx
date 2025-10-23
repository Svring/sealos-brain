import { Image } from "fumadocs-core/framework";
import { DocsLayout } from "fumadocs-ui/layouts/notebook";
import { source } from "@/lib/source";

export default function Layout({ children }: LayoutProps<"/">) {
	return (
		<DocsLayout
			githubUrl="https://github.com/vercel/components.build"
			links={[]}
			nav={{
				mode: "top",
				title: (
					<>
						<div className="flex items-center gap-2">
							<Image
								src="/icon.svg"
								alt="Sealos Brain"
								width={30}
								height={30}
							/>
							<span className="font-normal text-muted-foreground/50">/</span>
							<span className="font-medium">Sealos Brain</span>
						</div>
					</>
				),
			}}
			sidebar={{
				collapsible: false,
			}}
			tabMode="navbar"
			tree={source.pageTree}
		>
			{children}
		</DocsLayout>
	);
}
