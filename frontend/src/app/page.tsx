import AgentTerminal from "@/components/AgentTerminal";

export default function Home() {
  return (
    // bg-gray-100 = CLEAN LIGHT GRAY BACKGROUND
    // flex items-center justify-center = CENTERS THE TERMINAL PERFECTLY
    <main className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <AgentTerminal />
    </main>
  );
}