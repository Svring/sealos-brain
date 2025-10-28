import { ChatOpenAI } from "@langchain/openai";

export const getModel = ({
	apiKey,
	trial = false,
	baseURL,
	modelName,
}: {
	apiKey?: string;
	trial?: boolean;
	baseURL?: string;
	modelName?: string;
}) => {
	const resolvedBaseURL = process.env.PROXY_BASE_URL ?? baseURL;
	const resolvedModelName = process.env.PROXY_MODEL_NAME ?? modelName;
	const resolvedApiKey = trial
		? process.env.TRIAL_API_KEY
		: (process.env.PROXY_API_KEY ?? apiKey);

	if (!resolvedBaseURL) {
		throw new Error("baseURL is required");
	}
	if (!resolvedModelName) {
		throw new Error("modelName is required");
	}
	if (!resolvedApiKey) {
		throw new Error("API key is required");
	}

	return new ChatOpenAI({
		model: resolvedModelName,
		apiKey: resolvedApiKey,
		configuration: {
			baseURL: resolvedBaseURL,
		},
	});
};
