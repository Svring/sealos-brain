import { ChatOpenAI } from "@langchain/openai";

export const getModel = ({
	apiKey,
	trial = false,
}: {
	apiKey?: string;
	trial?: boolean;
}) => {
	const baseURL = process.env.PROXY_BASE_URL;
	const modelName = process.env.PROXY_MODEL_NAME;
	const key = trial
		? process.env.TRIAL_API_KEY
		: (process.env.PROXY_API_KEY ?? apiKey);

	if (!baseURL) {
		throw new Error("LANGGRAPH_BASE_URL environment variable is not set");
	}
	if (!modelName) {
		throw new Error("LANGGRAPH_MODEL_NAME environment variable is not set");
	}
	if (!key) {
		throw new Error("API key is required");
	}

	return new ChatOpenAI({
		model: modelName,
		apiKey: key,
		configuration: {
			baseURL,
		},
	});
};
