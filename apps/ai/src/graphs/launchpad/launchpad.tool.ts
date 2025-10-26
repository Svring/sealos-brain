import { getCurrentTaskInput } from "@langchain/langgraph";
import { tool } from "langchain";
import * as z from "zod";

const welcome = tool(
	({ joke }, config) => {
		const currentTaskInput = getCurrentTaskInput();
		return `Welcome the user to the launchpad agent. \n\n Joke: ${joke} \n\n State: ${JSON.stringify(config.context)} \n\n Current Task Input: ${JSON.stringify(currentTaskInput)}`;
	},
	{
		name: "welcome",
		description: "Welcome the user with a joke.",
		schema: z.object({
			joke: z.string().describe("The joke to welcome the user with"),
		}),
	},
);

export const launchpadTools = [welcome];
