"use client";

import { useMemo, useState } from "react";
import {
  Blocks,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Copy,
  FileText,
  Palette,
  Search,
  Variable as VariableIcon,
} from "lucide-react";
import type { BrandProfile, SignatoryProfile } from "@/types/doc-layout";

/* ================= TYPES ================= */

export type SidebarTab = "structure" | "snippets" | "variables" | "brand";

export type StructurePage = {
  id: string;
  name: string;
  sections: Array<{
    id: string;
    name: string;
    onClick?: () => void;
  }>;
};

export type FormyxaSidebarProps = {
  /** ✅ NEW: control visible tabs */
  enabledTabs?: SidebarTab[];

  collapsed: boolean;
  onCollapse: (collapsed: boolean) => void;

  activeTab: SidebarTab;
  onTabChange: (tab: SidebarTab) => void;

  pages?: StructurePage[];
  variables?: Array<{ name: string; description?: string }>;

  brand?: BrandProfile | null;
  signatory?: SignatoryProfile | null;
};

/* ================= COMPONENT ================= */

export function FormyxaSidebar({
  enabledTabs,

  collapsed,
  onCollapse,
  activeTab,
  onTabChange,

  pages = [
    {
      id: "page-1",
      name: "Page 1",
      sections: [{ id: "doc", name: "Document" }],
    },
  ],
  variables = [
    { name: "{{client_name}}", description: "Client full name" },
    { name: "{{project_type}}", description: "Type of project" },
    { name: "{{timeline}}", description: "Project timeline" },
  ],
  brand,
  signatory,
}: FormyxaSidebarProps) {
  /* ---------- Tabs definition ---------- */
  const tabs = useMemo(() => {
    const all = [
      { id: "structure" as const, icon: FileText, label: "Structure" },
      { id: "snippets" as const, icon: Blocks, label: "Snippets" },
      { id: "variables" as const, icon: VariableIcon, label: "Variables" },
      { id: "brand" as const, icon: Palette, label: "Brand" },
    ];

    if (!enabledTabs || enabledTabs.length === 0) return all;
    return all.filter((t) => enabledTabs.includes(t.id));
  }, [enabledTabs]);

  return (
    <div
      className={[
        "bg-[#fafafa] border-r border-slate-100 transition-all duration-300 flex flex-col",
        collapsed ? "w-14" : "w-[260px]",
      ].join(" ")}
    >
      {/* ================= TABS ================= */}
      <div className="border-b border-slate-200 p-2">
        <div className="flex flex-col gap-1">
          {tabs.map((t) => {
            const Icon = t.icon;
            const isActive = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => onTabChange(t.id)}
                className={[
                  [
                    "flex items-center gap-3 px-3 py-2 rounded-md transition-colors",
                    collapsed ? "justify-center" : "",
                  ],
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                ].join(" ")}
                title={collapsed ? t.label : undefined}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {!collapsed && <span className="text-sm">{t.label}</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* ================= CONTENT ================= */}
      <div className="flex-1 overflow-y-auto">
        {!collapsed && (
          <>
            {activeTab === "structure" &&
              enabledTabs?.includes("structure") && (
                <StructureTab pages={pages} />
              )}

            {activeTab === "snippets" &&
              enabledTabs?.includes("snippets") && <SnippetsTab />}

            {activeTab === "variables" &&
              enabledTabs?.includes("variables") && (
                <VariablesTab variables={variables} />
              )}

            {activeTab === "brand" &&
              enabledTabs?.includes("brand") && (
                <BrandTab brand={brand} signatory={signatory} />
              )}
          </>
        )}
      </div>

      {/* ================= COLLAPSE ================= */}
      <div className="border-t border-slate-200 p-2">
        <button
            onClick={() => onCollapse(!collapsed)}
            className="w-full flex items-center justify-center px-2 py-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
          {collapsed ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <>
              <ChevronLeft className="w-5 h-5" />
              <span className="text-sm">Collapse</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}

/* ================= SUB TABS ================= */

function StructureTab({ pages }: { pages: StructurePage[] }) {
  const [expanded, setExpanded] = useState<string[]>(
    pages.map((p) => p.id).slice(0, 1),
  );
  const [activeSection, setActiveSection] = useState(
    pages?.[0]?.sections?.[0]?.id ?? "",
  );

  const toggle = (id: string) => {
    setExpanded((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  return (
    <div className="p-4">
      <h3 className="text-xs uppercase tracking-wider text-slate-500 mb-3 px-2">
        Document structure
      </h3>

      <div className="space-y-1">
        {pages.map((page) => {
          const isOpen = expanded.includes(page.id);
          return (
            <div key={page.id}>
              <button
                onClick={() => toggle(page.id)}
                className="w-full flex items-center gap-2 px-2 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-lg"
              >
                <ChevronDown
                  className={[
                    "w-4 h-4 transition-transform",
                    isOpen ? "rotate-0" : "-rotate-90",
                  ].join(" ")}
                />
                <FileText className="w-4 h-4" />
                <span>{page.name}</span>
              </button>

              {isOpen && (
                <div className="ml-6 mt-1 space-y-1">
                  {page.sections.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => {
                        setActiveSection(s.id);
                        s.onClick?.();
                      }}
                      className={[
                        "w-full text-left px-3 py-2 text-sm rounded-lg",
                        activeSection === s.id
                          ? "bg-primary/10 text-primary"
                          : "text-slate-600 hover:bg-slate-50",
                      ].join(" ")}
                    >
                      {s.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ---------- Remaining tabs unchanged ---------- */

function SnippetsTab() {
  return <div className="p-4 text-sm text-slate-500">Snippets coming soon</div>;
}

function VariablesTab({
  variables,
}: {
  variables: Array<{ name: string; description?: string }>;
}) {
  return (
    <div className="p-4 text-sm text-slate-500">
      Variables feature disabled
    </div>
  );
}

function BrandTab({
  brand,
  signatory,
}: {
  brand?: BrandProfile | null;
  signatory?: SignatoryProfile | null;
}) {
  return (
    <div className="p-4 text-sm text-slate-500">
      Brand configuration disabled
    </div>
  );
}
