import { DocsLayout } from "fumadocs-ui/layouts/notebook";
import Image from "next/image";
import { source } from "@/lib/source";

export default function Layout({ children }: LayoutProps<"/">) {
	return (
		<DocsLayout
			githubUrl="https://github.com/svring/sealos-brain"
			links={[]}
			nav={{
				mode: "top",
				title: (
					<>
						<Image src="/icon.svg" alt="Sealos Brain" width={30} height={30} />
						<span className="font-normal text-muted-foreground/50">/</span>
						<span className="font-medium">Sealos Brain</span>
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
