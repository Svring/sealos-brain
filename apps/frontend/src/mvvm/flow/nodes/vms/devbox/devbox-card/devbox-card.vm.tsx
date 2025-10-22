"use client";

import type React from "react";
import { useState } from "react";
import { Separator } from "@/components/ui/separator";
import { DevboxCardBasicInfo } from "./devbox-card-basic-info.vm.tsx";
import { DevboxCardCpuMemory } from "./devbox-card-cpu-memory.vm.tsx";
import { DevboxCardNetwork } from "./devbox-card-network.vm.tsx";
import { DevboxCardRelease } from "./devbox-card-release.vm.tsx";
import { DevboxCardSsh } from "./devbox-card-ssh.vm.tsx";

interface DevboxCardProps {
	devboxName?: string;
}

type Section = "cpu-memory" | "network" | "release" | "ssh" | null;

export const DevboxCard: React.FC<DevboxCardProps> = () => {
	const [selectedSection, setSelectedSection] = useState<Section>(null);

	const handleSectionClick = (section: Section) => {
		setSelectedSection(selectedSection === section ? null : section);
	};

	const renderBodyContent = () => {
		switch (selectedSection) {
			case "cpu-memory":
				return <DevboxCardCpuMemory.BodyContent />;
			case "network":
				return <DevboxCardNetwork.BodyContent />;
			case "release":
				return <DevboxCardRelease.BodyContent />;
			case "ssh":
				return <DevboxCardSsh.BodyContent />;
			default:
				return null;
		}
	};

	return (
		<div className="space-y-3 w-full min-w-0 p-4 border rounded-lg">
			{/* Sections Grid */}
			<div className="space-y-2">
				{/* Basic Info Section - Non-interactive */}
				<DevboxCardBasicInfo />

				{/* Interactive Sections */}
				<div className="grid grid-cols-2 gap-2">
					<DevboxCardCpuMemory
						onSectionClick={() => handleSectionClick("cpu-memory")}
						isActive={selectedSection === "cpu-memory"}
					/>
					<DevboxCardNetwork
						onSectionClick={() => handleSectionClick("network")}
						isActive={selectedSection === "network"}
					/>
					<DevboxCardRelease
						onSectionClick={() => handleSectionClick("release")}
						isActive={selectedSection === "release"}
					/>
					<DevboxCardSsh
						onSectionClick={() => handleSectionClick("ssh")}
						isActive={selectedSection === "ssh"}
					/>
				</div>
			</div>

			{/* Body Content Area */}
			{selectedSection && (
				<>
					<Separator />
					<div className="w-full min-w-0 transition-all duration-300 ease-out">
						{renderBodyContent()}
					</div>
				</>
			)}
		</div>
	);
};

export default DevboxCard;

