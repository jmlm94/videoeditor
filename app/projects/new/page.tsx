import { NewProjectForm } from "./form";

export default function NewProjectPage() {
  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-1">New Project</h2>
        <p className="text-[var(--muted-foreground)]">
          Describe your video ad concept and let AI generate a creative brief
        </p>
      </div>
      <NewProjectForm />
    </div>
  );
}
