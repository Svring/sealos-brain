launch nextjs: pnpm dev

launch langgraph: cd agent && poetry lock && poetry install && npx @langchain/langgraph-cli dev --port 8123

Welcome to NextJS
- Navigate to http://localhost:3000/copilotkit
- Talk to your agent.
- Read the docs: https://docs.copilotkit.ai

Welcome to LangGraph
- 🚀 API: http://localhost:8123
- 🎨 Studio UI: https://smith.langchain.com/studio/?baseUrl=http://localhost:8123
- 📚 API Docs: http://localhost:8123/docs