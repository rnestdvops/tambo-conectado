import dynamic from "next/dynamic";

const TamboDemo = dynamic(() => import("../components/TamboDemo"), {
  ssr: false,
});

export default function Home() {
  return (
    <main style={{ height: "100vh", overflow: "hidden" }}>
      <TamboDemo />
    </main>
  );
}
