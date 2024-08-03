import { createRoot } from "react-dom/client";
import "./tailwind.css";

const handleNewMarkdown = async (markdown: string) => {
  const bufferTabs = await chrome.tabs.query({
    url: "https://publish.buffer.com/*",
  });

  console.log(bufferTabs);
};

function App() {
  return (
    <div className="p-4 min-w-72 text-base">
      <form
        onSubmit={async (e) => {
          e.preventDefault();

          const data = new FormData(e.currentTarget);

          const markdown = data.get("markdown") as string;

          try {
            await handleNewMarkdown(markdown);
          } catch (e) {
            console.error(e);
          }
        }}
      >
        <h1 className="block text-xl font-semibold tracking-tight">
          Markdown Thread Creator
        </h1>
        <label className="">
          <span className="block mb-3 text-sm text-gray-600">
            Paste the markdown for the thread here
          </span>
          <textarea
            name="markdown"
            required
            value={"Example"}
            className="w-full h-32 p-2 border-2 border-gray-300 font-mono rounded-md resize-none"
          ></textarea>
        </label>
        <input
          type="submit"
          value="Create Thread"
          className="mt-4 px-4 py-2 bg-gray-900 rounded-md text-white tracking-tight"
        />
      </form>
    </div>
  );
}

const root = createRoot(document.getElementById("root")!);
root.render(<App />);
