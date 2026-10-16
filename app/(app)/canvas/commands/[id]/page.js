import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getProjects, getCommand } from "../../../../Shell";
import CommandEditor from "../../../../editor/CommandEditor";

// Editor for one command of the active project.
async function Command({ params }) {
  const { id } = await params;
  const { activeId } = await getProjects();
  if (!activeId) redirect("/");
  const command = await getCommand(activeId, id);
  if (!command) redirect("/canvas/commands");

  const { graph, ...rest } = command;
  return <CommandEditor command={rest} graph={graph} />;
}

export default function CommandPage({ params }) {
  return (
    <Suspense fallback={null}>
      <Command params={params} />
    </Suspense>
  );
}
