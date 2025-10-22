import { ChatOpenAI } from "@langchain/openai";

export const getModel = ({
	modelName = "gpt-4.1",
	baseURL = "https://aiproxy.usw.sealos.io/v1",
	apiKey,
}: {
	modelName: string;
	baseURL: string;
	apiKey: string;
}) => {
	const resolvedBaseURL = process.env.baseURL || baseURL;

	return new ChatOpenAI({
		model: modelName,
		apiKey: apiKey,
		configuration: {
			baseURL: resolvedBaseURL,
		},
	});
};
