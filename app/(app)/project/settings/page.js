import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getProjects } from "../../../Shell";
import ProjectSettings from "./ProjectSettings";

async function Content() {
  const { projects, activeId } = await getProjects();
  const project = projects.find((p) => p.id === activeId) ?? projects[0];
  if (!project) redirect("/");

  // key: switching projects in the top bar remounts the form with that project's values
  return <ProjectSettings key={project.id} project={project} />;
}

export default function ProjectSettingsPage() {
  return (
    <Suspense fallback={null}>
      <Content />
    </Suspense>
  );
}
