import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getProjects, getNodes } from "../../../Shell";
import Editor from "../../../editor/Editor";

// Canvas for one file: the node editor, graph loaded from the database.
async function FileCanvas({ params }) {
  const { id } = await params;
  const { activeId } = await getProjects();
  const nodes = await getNodes(activeId);
  const file = nodes.find((n) => n.id === id && n.kind === "file");
  if (!file) redirect("/");

  return <Editor fileId={file.id} graph={file.graph} />;
}

export default function FilePage({ params }) {
  return (
    <Suspense fallback={null}>
      <FileCanvas params={params} />
    </Suspense>
  );
}
