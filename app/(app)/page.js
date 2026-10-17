import { Suspense } from "react";
import { getProjects, getGraph } from "../Shell";
import Canvas from "../editor/Canvas";

// Home: the node canvas of the active project.
async function Home() {
  const { activeId } = await getProjects();
  const graph = await getGraph(activeId);
  return <Canvas key={activeId ?? "none"} projectId={activeId} graph={graph} />;
}

export default function Page() {
  return (
    <Suspense fallback={null}>
      <Home />
    </Suspense>
  );
}
