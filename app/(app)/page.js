import { Suspense } from "react";
import { getProjects, getGraph } from "../Shell";
import Canvas from "../editor/Canvas";

// Home: the node canvas of the active project.
async function Home() {
  const { projects, activeId } = await getProjects();
  const graph = await getGraph(activeId);
  const variables = projects.find((p) => p.id === activeId)?.variables ?? [];
  return <Canvas key={activeId ?? "none"} projectId={activeId} graph={graph} variables={variables} />;
}

export default function Page() {
  return (
    <Suspense fallback={null}>
      <Home />
    </Suspense>
  );
}
