"use client";

import { FileText } from "lucide-react";
import type { SavedResume } from "@/lib/utils/resume";
import ResumeActions from "./ResumeActions";
import ResumeDefaultControl from "./ResumeDefaultControl";
import ResumeRenameForm from "./ResumeRenameForm";

function formatDate(value?: string) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

type ResumeListItemProps = {
  resume: SavedResume;
  resumes: SavedResume[];
  renaming: boolean;
  editLabel: string;
  setEditLabel: (value: string) => void;
  setEditingId: (id: string | null) => void;
  setDeleteTarget: (resume: SavedResume) => void;
  renameError: string;
  setRenameError: (value: string) => void;
  renameAction: (formData: FormData) => void;
  defaultAction: (formData: FormData) => void;
  defaultPending: boolean;
};

function ResumeRow(props: ResumeListItemProps) {
  const {
    resume,
    resumes,
    renaming,
    editLabel,
    setEditLabel,
    setEditingId,
    setDeleteTarget,
    renameError,
    setRenameError,
    renameAction,
    defaultAction,
    defaultPending,
  } = props;

  return (
    <li className="flex flex-col gap-3 px-5 py-4">
      <div className="min-w-0">
        {renaming ? (
          <ResumeRenameForm
            resume={resume}
            resumes={resumes}
            editLabel={editLabel}
            setEditLabel={setEditLabel}
            setEditingId={setEditingId}
            renameError={renameError}
            setRenameError={setRenameError}
            renameAction={renameAction}
          />
        ) : (
          <p className="font-semibold text-gray-950">{resume.label}</p>
        )}
        <p className="mt-1 text-xs text-gray-400">
          {resume.originalFilename ? `${resume.originalFilename} · ` : ""}
          Saved {formatDate(resume.createdAt)}
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <ResumeDefaultControl
          resume={resume}
          defaultAction={defaultAction}
          busy={defaultPending}
        />
        <ResumeActions
          resume={resume}
          renaming={renaming}
          setEditingId={setEditingId}
          setEditLabel={setEditLabel}
          setDeleteTarget={setDeleteTarget}
          setRenameError={setRenameError}
        />
      </div>
    </li>
  );
}

export default function ResumeList({
  resumes,
  showAddForm,
  editingId,
  editLabel,
  setEditLabel,
  setEditingId,
  setDeleteTarget,
  renameError,
  setRenameError,
  renameAction,
  defaultAction,
  defaultPending,
}: {
  resumes: SavedResume[];
  showAddForm: boolean;
  editingId: string | null;
  editLabel: string;
  setEditLabel: (value: string) => void;
  setEditingId: (id: string | null) => void;
  setDeleteTarget: (resume: SavedResume) => void;
  renameError: string;
  setRenameError: (value: string) => void;
  renameAction: (formData: FormData) => void;
  defaultAction: (formData: FormData) => void;
  defaultPending: boolean;
}) {
  if (resumes.length === 0) {
    return (
      <div className="p-10 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
          <FileText size={22} className="text-[#2e46ba]" />
        </div>
        <h3 className="mt-5 text-lg font-semibold text-gray-900">
          No saved resumes yet
        </h3>
        <p className="mt-2 text-sm text-gray-500">
          {showAddForm
            ? "Upload a PDF above. You can then configure which one is used when applying."
            : "Use Add resume to upload a PDF, then choose which one is used when applying."}
        </p>
      </div>
    );
  }

  const itemProps = {
    resumes,
    editLabel,
    setEditLabel,
    setEditingId,
    setDeleteTarget,
    renameError,
    setRenameError,
    renameAction,
    defaultAction,
    defaultPending,
  };

  return (
    <>
      <ul className="divide-y divide-gray-100 lg:hidden">
        {resumes.map((resume) => (
          <ResumeRow
            key={resume.id}
            resume={resume}
            renaming={editingId === resume.id}
            {...itemProps}
          />
        ))}
      </ul>

      <div className="hidden overflow-x-auto lg:block">
        <table className="w-full text-left text-sm">
          <thead className="bg-[#fbf9ff] text-xs font-medium tracking-wide text-gray-500">
            <tr>
              <th className="px-6 py-3 font-medium">Resume</th>
              <th className="px-6 py-3 font-medium">File</th>
              <th className="px-6 py-3 font-medium">Saved</th>
              <th className="px-6 py-3 font-medium">When applying</th>
              <th className="px-6 py-3 font-medium">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {resumes.map((resume) => {
              const renaming = editingId === resume.id;
              return (
                <tr key={resume.id} className="align-middle">
                  <td className="px-6 py-4">
                    {renaming ? (
                      <ResumeRenameForm
                        resume={resume}
                        resumes={resumes}
                        editLabel={editLabel}
                        setEditLabel={setEditLabel}
                        setEditingId={setEditingId}
                        renameError={renameError}
                        setRenameError={setRenameError}
                        renameAction={renameAction}
                      />
                    ) : (
                      <p className="font-semibold text-gray-950">
                        {resume.label}
                      </p>
                    )}
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {resume.originalFilename || "PDF"}
                  </td>
                  <td className="px-6 py-4 text-gray-500">
                    {formatDate(resume.createdAt)}
                  </td>
                  <td className="px-6 py-4">
                    <ResumeDefaultControl
                      resume={resume}
                      defaultAction={defaultAction}
                      busy={defaultPending}
                    />
                  </td>
                  <td className="px-6 py-4 text-right">
                    <ResumeActions
                      resume={resume}
                      renaming={renaming}
                      setEditingId={setEditingId}
                      setEditLabel={setEditLabel}
                      setDeleteTarget={setDeleteTarget}
                      setRenameError={setRenameError}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
