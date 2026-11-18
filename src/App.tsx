import { useRef, useState, type ChangeEvent, type ReactNode } from "react";

type Page = "update" | "get";
type DataSection =
  | "Search"
  | "Summary"
  | "Power"
  | "Down"
  | "Door"
  | "All Alarms"
  | "Execution"
  | "Network Summary"
  | "Relocation"
  | "BDTs"
  | "PM Status";

type ImportRow = {
  id: string;
  label: string;
  hint: string;
  path: string;
  updated: boolean;
};

const initialImports: ImportRow[] = [
  {
    id: "sites",
    label: "Site database",
    hint: "Master locations and site details",
    path: "C:\\Orange Database\\imports\\sites_master.csv",
    updated: true,
  },
  {
    id: "alarms",
    label: "Alarm records",
    hint: "Current and historical alarm events",
    path: "No file selected",
    updated: false,
  },
  {
    id: "power",
    label: "Power data",
    hint: "Battery, generator and grid readings",
    path: "No file selected",
    updated: false,
  },
  {
    id: "network",
    label: "Network status",
    hint: "Availability and performance data",
    path: "No file selected",
    updated: false,
  },
  {
    id: "maintenance",
    label: "Maintenance plan",
    hint: "Planned maintenance schedule",
    path: "No file selected",
    updated: false,
  },
];

const sections: DataSection[] = [
  "Search",
  "Summary",
  "Power",
  "Down",
  "Door",
  "All Alarms",
  "Execution",
  "Network Summary",
  "Relocation",
  "BDTs",
  "PM Status",
];

const sectionMeta: Record<
  DataSection,
  { description: string; metric: string; value: string; status: string }
> = {
  Search: {
    description: "Find database records using one or more site details.",
    metric: "Matching sites",
    value: "6",
    status: "Search is ready",
  },
  Summary: {
    description: "A complete view of active sites and operational health.",
    metric: "Active sites",
    value: "1,284",
    status: "98.7% healthy",
  },
  Power: {
    description: "Grid, generator and battery performance across all sites.",
    metric: "On grid power",
    value: "1,102",
    status: "85.8% of sites",
  },
  Down: {
    description: "Sites currently unavailable or reporting critical downtime.",
    metric: "Down sites",
    value: "18",
    status: "6 restored today",
  },
  Door: {
    description: "Door access alarms and open enclosure events.",
    metric: "Open doors",
    value: "7",
    status: "3 need attention",
  },
  "All Alarms": {
    description: "Combined active alarm feed ordered by severity.",
    metric: "Active alarms",
    value: "42",
    status: "9 critical",
  },
  Execution: {
    description: "Progress of active field tasks and work orders.",
    metric: "Completed",
    value: "86%",
    status: "31 of 36 tasks",
  },
  "Network Summary": {
    description: "Network availability, traffic and connection quality.",
    metric: "Availability",
    value: "99.2%",
    status: "+0.4% this week",
  },
  Relocation: {
    description: "Sites and assets scheduled for relocation.",
    metric: "In progress",
    value: "12",
    status: "4 due this week",
  },
  BDTs: {
    description: "Breakdown ticket status and response performance.",
    metric: "Open tickets",
    value: "23",
    status: "Median age 4h",
  },
  "PM Status": {
    description: "Preventive maintenance completion and upcoming visits.",
    metric: "This month",
    value: "91%",
    status: "118 of 130 sites",
  },
};

const records = [
  {
    site: "CAI-1042",
    name: "New Cairo Exchange",
    year: "2024",
    region: "Cairo East",
    signal: "Stable",
    alarm: "Normal",
    updated: "2 min ago",
  },
  {
    site: "GIZ-0831",
    name: "Dokki Central",
    year: "2023",
    region: "Giza Central",
    signal: "Stable",
    alarm: "Normal",
    updated: "4 min ago",
  },
  {
    site: "ALX-0318",
    name: "Smouha Station",
    year: "2024",
    region: "Alexandria",
    signal: "Degraded",
    alarm: "Warning",
    updated: "7 min ago",
  },
  {
    site: "DEL-0729",
    name: "Mansoura North",
    year: "2022",
    region: "Delta North",
    signal: "Stable",
    alarm: "Normal",
    updated: "11 min ago",
  },
  {
    site: "SIN-0116",
    name: "Arish Gateway",
    year: "2023",
    region: "Sinai",
    signal: "Offline",
    alarm: "Critical",
    updated: "18 min ago",
  },
  {
    site: "ASW-0204",
    name: "Aswan South",
    year: "2022",
    region: "Upper Egypt",
    signal: "Stable",
    alarm: "Normal",
    updated: "21 min ago",
  },
];

function Icon({
  children,
  size = 18,
  className = "",
}: {
  children: ReactNode;
  size?: number;
  className?: string;
}) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      height={size}
      viewBox="0 0 24 24"
      width={size}
    >
      {children}
    </svg>
  );
}

function UploadIcon() {
  return (
    <Icon>
      <path
        d="M12 16V4m0 0L7.5 8.5M12 4l4.5 4.5M5 15v3.5A1.5 1.5 0 006.5 20h11a1.5 1.5 0 001.5-1.5V15"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </Icon>
  );
}

function ChevronIcon() {
  return (
    <Icon size={16}>
      <path
        d="M9 6l6 6-6 6"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </Icon>
  );
}

function UpdatePage() {
  const [imports, setImports] = useState(initialImports);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const chooseFile = (id: string, event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImports((items) =>
      items.map((item) =>
        item.id === id
          ? { ...item, path: `C:\\Orange Database\\imports\\${file.name}`, updated: false }
          : item,
      ),
    );
  };

  const updateFile = (id: string) => {
    const item = imports.find((entry) => entry.id === id);
    if (!item || item.path === "No file selected") return;

    setUpdatingId(id);
    window.setTimeout(() => {
      setImports((items) =>
        items.map((entry) => (entry.id === id ? { ...entry, updated: true } : entry)),
      );
      setUpdatingId(null);
    }, 650);
  };

  return (
    <main className="flex-1 overflow-auto px-8 pb-10 pt-8">
      <div className="mx-auto max-w-[1180px]">
        <div className="mb-8 flex items-end justify-between gap-6">
          <div>
            <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.2em] text-orange-600">
              Data management
            </p>
            <h1 className="text-[32px] font-semibold tracking-[-0.035em] text-slate-950">
              Update data
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Import source files and publish the latest records to the database.
            </p>
          </div>
          <div className="hidden items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3.5 py-2 text-xs font-semibold text-emerald-700 md:flex">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Database online
          </div>
        </div>

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_12px_40px_rgba(15,23,42,0.06)]">
          <div className="grid grid-cols-[190px_1fr_118px] border-b border-slate-200 bg-slate-50/80 px-6 py-3.5 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400 md:grid-cols-[220px_1fr_118px]">
            <span>Data source</span>
            <span>Import location</span>
            <span className="text-right">Action</span>
          </div>

          <div className="divide-y divide-slate-100">
            {imports.map((item) => {
              const hasFile = item.path !== "No file selected";
              const isUpdating = updatingId === item.id;

              return (
                <div
                  className="grid grid-cols-[190px_1fr_118px] items-center gap-5 px-6 py-5 transition-colors hover:bg-orange-50/20 md:grid-cols-[220px_1fr_118px]"
                  key={item.id}
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-900">{item.label}</span>
                      {item.updated && (
                        <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-emerald-700">
                          Current
                        </span>
                      )}
                    </div>
                    <p className="mt-1 truncate text-xs text-slate-400">{item.hint}</p>
                  </div>

                  <div className="flex min-w-0 items-center gap-3">
                    <input
                      accept=".csv,.xlsx,.xls,.json"
                      className="hidden"
                      onChange={(event) => chooseFile(item.id, event)}
                      ref={(node) => {
                        inputRefs.current[item.id] = node;
                      }}
                      type="file"
                    />
                    <button
                      className="flex shrink-0 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-orange-300 hover:text-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-200"
                      onClick={() => inputRefs.current[item.id]?.click()}
                      type="button"
                    >
                      <UploadIcon />
                      Import
                    </button>
                    <div
                      className={`min-w-0 flex-1 truncate rounded-lg border px-3.5 py-2.5 font-mono text-[11px] ${
                        hasFile
                          ? "border-slate-200 bg-slate-50 text-slate-600"
                          : "border-dashed border-slate-200 bg-white text-slate-400"
                      }`}
                      title={item.path}
                    >
                      {item.path}
                    </div>
                  </div>

                  <button
                    className="rounded-lg bg-slate-950 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
                    disabled={!hasFile || isUpdating}
                    onClick={() => updateFile(item.id)}
                    type="button"
                  >
                    {isUpdating ? "Updating…" : "Update"}
                  </button>
                </div>
              );
            })}
          </div>
        </section>

        <div className="mt-5 flex items-center justify-between text-xs text-slate-400">
          <span>Accepted formats: CSV, XLSX and JSON</span>
          <span>Last database sync: Today, 09:42</span>
        </div>
      </div>
    </main>
  );
}

function GetDataPage() {
  const emptyFilters = { siteCode: "", siteName: "", year: "", region: "", status: "" };
  const [selected, setSelected] = useState<DataSection>("Search");
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState(emptyFilters);
  const [appliedFilters, setAppliedFilters] = useState(emptyFilters);
  const [selectedSiteCode, setSelectedSiteCode] = useState("");
  const meta = sectionMeta[selected];
  const selectedSite = records.find(
    (record) => record.site.toLowerCase() === selectedSiteCode.toLowerCase(),
  );
  const visibleRecords = records.filter((record) => {
    const matchesQuickSearch =
      `${record.site} ${record.name} ${record.region} ${record.signal} ${record.alarm}`
        .toLowerCase()
        .includes(query.toLowerCase());
    const matchesSelectedSite =
      !selectedSiteCode || record.site.toLowerCase().includes(selectedSiteCode.toLowerCase());

    if (selected !== "Search") return matchesQuickSearch && matchesSelectedSite;

    return (
      matchesQuickSearch &&
      record.site.toLowerCase().includes(appliedFilters.siteCode.toLowerCase()) &&
      record.name.toLowerCase().includes(appliedFilters.siteName.toLowerCase()) &&
      (!appliedFilters.year || record.year === appliedFilters.year) &&
      (!appliedFilters.region || record.region === appliedFilters.region) &&
      (!appliedFilters.status ||
        record.signal.toLowerCase() === appliedFilters.status.toLowerCase())
    );
  });

  return (
    <div className="flex min-h-0 flex-1">
      <aside className="w-[238px] shrink-0 overflow-y-auto border-r border-slate-200 bg-white px-4 py-6">
        <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
          Data views
        </p>
        <nav aria-label="Data sections" className="space-y-1">
          {sections.map((section) => (
            <button
              className={`group flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-[13px] font-medium transition ${
                selected === section
                  ? "bg-orange-50 font-semibold text-orange-700"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"
              }`}
              key={section}
              onClick={() => setSelected(section)}
              type="button"
            >
              <span className="flex items-center gap-3">
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    selected === section ? "bg-orange-500" : "bg-slate-300 group-hover:bg-slate-400"
                  }`}
                />
                {section}
              </span>
              {selected === section && <ChevronIcon />}
            </button>
          ))}
        </nav>

        <div className="mt-8 rounded-xl bg-slate-950 p-4 text-white">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-orange-400">
            Live connection
          </p>
          <p className="mt-2 text-sm font-semibold">Data is up to date</p>
          <p className="mt-1 text-[11px] leading-5 text-slate-400">Synced 2 minutes ago</p>
        </div>
      </aside>

      <main className="min-w-0 flex-1 overflow-auto px-8 pb-10 pt-8">
        <div className="mx-auto max-w-[1120px]">
          <div className="mb-7 flex items-start justify-between gap-6">
            <div>
              <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.2em] text-orange-600">
                Data explorer
              </p>
              <h1 className="text-[32px] font-semibold tracking-[-0.035em] text-slate-950">
                {selected}
              </h1>
              <p className="mt-2 text-sm text-slate-500">{meta.description}</p>
            </div>
            <button
              className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-orange-300 hover:text-orange-600"
              type="button"
            >
              Export view
            </button>
          </div>

          {selected === "Search" && (
            <form
              className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
              onSubmit={(event) => {
                event.preventDefault();
                setAppliedFilters(filters);
                setSelectedSiteCode(filters.siteCode.trim().toUpperCase());
              }}
            >
              <div className="mb-5">
                <h2 className="text-sm font-semibold text-slate-900">Search criteria</h2>
                <p className="mt-1 text-xs text-slate-400">
                  Fill in any combination of fields to narrow the database results.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <label>
                  <span className="mb-2 block text-[11px] font-bold uppercase tracking-[0.1em] text-slate-500">
                    Site Code
                  </span>
                  <input
                    className="search-field"
                    onChange={(event) =>
                      setFilters((current) => ({ ...current, siteCode: event.target.value }))
                    }
                    placeholder="e.g. CAI-1042"
                    required
                    value={filters.siteCode}
                  />
                </label>
                <label>
                  <span className="mb-2 block text-[11px] font-bold uppercase tracking-[0.1em] text-slate-500">
                    Site Name
                  </span>
                  <input
                    className="search-field"
                    onChange={(event) =>
                      setFilters((current) => ({ ...current, siteName: event.target.value }))
                    }
                    placeholder="Enter site name"
                    value={filters.siteName}
                  />
                </label>
                <label>
                  <span className="mb-2 block text-[11px] font-bold uppercase tracking-[0.1em] text-slate-500">
                    Year
                  </span>
                  <select
                    className="search-field"
                    onChange={(event) =>
                      setFilters((current) => ({ ...current, year: event.target.value }))
                    }
                    value={filters.year}
                  >
                    <option value="">All years</option>
                    <option value="2024">2024</option>
                    <option value="2023">2023</option>
                    <option value="2022">2022</option>
                  </select>
                </label>
                <label>
                  <span className="mb-2 block text-[11px] font-bold uppercase tracking-[0.1em] text-slate-500">
                    Region
                  </span>
                  <select
                    className="search-field"
                    onChange={(event) =>
                      setFilters((current) => ({ ...current, region: event.target.value }))
                    }
                    value={filters.region}
                  >
                    <option value="">All regions</option>
                    {records.map((record) => (
                      <option key={record.region} value={record.region}>
                        {record.region}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  <span className="mb-2 block text-[11px] font-bold uppercase tracking-[0.1em] text-slate-500">
                    Operational Status
                  </span>
                  <select
                    className="search-field"
                    onChange={(event) =>
                      setFilters((current) => ({ ...current, status: event.target.value }))
                    }
                    value={filters.status}
                  >
                    <option value="">All statuses</option>
                    <option value="Stable">Stable</option>
                    <option value="Degraded">Degraded</option>
                    <option value="Offline">Offline</option>
                  </select>
                </label>
                <div className="flex items-end gap-2">
                  <button
                    className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-orange-500 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-200 focus:ring-offset-2"
                    type="submit"
                  >
                    <Icon size={17}>
                      <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="1.8" />
                      <path
                        d="M16 16l4 4"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeWidth="1.8"
                      />
                    </Icon>
                    Search
                  </button>
                  <button
                    className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
                    onClick={() => {
                      setFilters(emptyFilters);
                      setAppliedFilters(emptyFilters);
                      setSelectedSiteCode("");
                      setQuery("");
                    }}
                    type="button"
                  >
                    Reset
                  </button>
                </div>
              </div>
            </form>
          )}

          {selected !== "Search" && (
            <div
              className={`mb-6 flex items-center justify-between rounded-xl border px-5 py-4 ${
                selectedSiteCode ? "border-orange-200 bg-orange-50/70" : "border-slate-200 bg-white"
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                    selectedSiteCode ? "bg-orange-500 text-white" : "bg-slate-100 text-slate-400"
                  }`}
                >
                  <Icon size={19}>
                    <path
                      d="M12 21s7-5.2 7-12a7 7 0 10-14 0c0 6.8 7 12 7 12z"
                      stroke="currentColor"
                      strokeLinejoin="round"
                      strokeWidth="1.7"
                    />
                    <circle cx="12" cy="9" r="2.3" stroke="currentColor" strokeWidth="1.7" />
                  </Icon>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                    Active Site Code
                  </p>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-950">
                      {selectedSiteCode || "No site selected"}
                    </span>
                    {selectedSite && (
                      <>
                        <span className="text-slate-300">/</span>
                        <span className="text-xs text-slate-500">{selectedSite.name}</span>
                      </>
                    )}
                  </div>
                  <p className="mt-1 text-[11px] text-slate-400">
                    {selectedSiteCode
                      ? `All ${selected.toLowerCase()} data is filtered for this site.`
                      : "Search for a site code before viewing site-specific data."}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {selectedSiteCode && (
                  <button
                    className="rounded-lg px-3 py-2 text-xs font-semibold text-slate-500 transition hover:bg-white hover:text-slate-900"
                    onClick={() => {
                      setSelectedSiteCode("");
                      setFilters(emptyFilters);
                      setAppliedFilters(emptyFilters);
                    }}
                    type="button"
                  >
                    Clear
                  </button>
                )}
                <button
                  className="rounded-lg border border-orange-200 bg-white px-3.5 py-2 text-xs font-bold text-orange-700 shadow-sm transition hover:border-orange-300 hover:bg-orange-50"
                  onClick={() => setSelected("Search")}
                  type="button"
                >
                  {selectedSiteCode ? "Change site" : "Search site"}
                </button>
              </div>
            </div>
          )}

          {selected !== "Search" && selectedSiteCode && (
            <div className="mb-6 grid grid-cols-3 gap-4">
              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-xs font-medium text-slate-400">{meta.metric}</p>
                <div className="mt-2 flex items-end justify-between">
                  <span className="text-3xl font-semibold tracking-tight text-slate-950">
                    {meta.value}
                  </span>
                  <span className="text-[11px] font-semibold text-emerald-600">{meta.status}</span>
                </div>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-xs font-medium text-slate-400">Regions reporting</p>
                <div className="mt-2 flex items-end justify-between">
                  <span className="text-3xl font-semibold tracking-tight text-slate-950">12</span>
                  <span className="text-[11px] font-semibold text-emerald-600">All online</span>
                </div>
              </div>
              <div className="rounded-xl border border-orange-100 bg-orange-50/70 p-5 shadow-sm">
                <p className="text-xs font-medium text-orange-700/70">Needs attention</p>
                <div className="mt-2 flex items-end justify-between">
                  <span className="text-3xl font-semibold tracking-tight text-orange-700">9</span>
                  <span className="text-[11px] font-semibold text-orange-600">Review now</span>
                </div>
              </div>
            </div>
          )}

          {selected !== "Search" && !selectedSiteCode && (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-8 py-16 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
                <Icon size={22}>
                  <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="1.8" />
                  <path
                    d="M16 16l4 4"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeWidth="1.8"
                  />
                </Icon>
              </div>
              <h2 className="mt-4 text-base font-semibold text-slate-900">
                Select a site to view {selected.toLowerCase()} data
              </h2>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                Use the Search tab to find a Site Code. Your selection will remain active while you
                move between every data view.
              </p>
              <button
                className="mt-5 rounded-lg bg-orange-500 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-orange-600"
                onClick={() => setSelected("Search")}
                type="button"
              >
                Go to Search
              </button>
            </div>
          )}

          {(selected === "Search" || selectedSiteCode) && (
            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_12px_40px_rgba(15,23,42,0.05)]">
              <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
                <div>
                  <h2 className="text-sm font-semibold text-slate-900">
                    {selected === "Search" ? "Search results" : "Site records"}
                  </h2>
                  <p className="mt-0.5 text-[11px] text-slate-400">
                    {visibleRecords.length} visible records
                  </p>
                </div>
                <div className="relative">
                  <Icon
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    size={16}
                  >
                    <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="1.8" />
                    <path
                      d="M16 16l4 4"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeWidth="1.8"
                    />
                  </Icon>
                  <input
                    aria-label="Search site records"
                    className="w-64 rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-xs text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-orange-300 focus:ring-2 focus:ring-orange-100"
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Search site or region"
                    value={query}
                  />
                </div>
              </div>

              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="bg-slate-50/80 text-[10px] font-bold uppercase tracking-[0.13em] text-slate-400">
                    <th className="px-5 py-3.5">Site ID</th>
                    <th className="px-5 py-3.5">Region</th>
                    <th className="px-5 py-3.5">Signal</th>
                    <th className="px-5 py-3.5">Alarm status</th>
                    <th className="px-5 py-3.5 text-right">Last update</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {visibleRecords.map((record) => (
                    <tr
                      className="text-xs transition-colors hover:bg-slate-50/70"
                      key={record.site}
                    >
                      <td className="px-5 py-4 font-bold text-slate-900">{record.site}</td>
                      <td className="px-5 py-4 text-slate-600">{record.region}</td>
                      <td className="px-5 py-4">
                        <span className="flex items-center gap-2 text-slate-600">
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              record.signal === "Stable"
                                ? "bg-emerald-500"
                                : record.signal === "Offline"
                                  ? "bg-red-500"
                                  : "bg-amber-500"
                            }`}
                          />
                          {record.signal}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold ${
                            record.alarm === "Normal"
                              ? "bg-emerald-50 text-emerald-700"
                              : record.alarm === "Critical"
                                ? "bg-red-50 text-red-700"
                                : "bg-amber-50 text-amber-700"
                          }`}
                        >
                          {record.alarm}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right text-slate-400">{record.updated}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {visibleRecords.length === 0 && (
                <div className="px-6 py-14 text-center text-sm text-slate-400">
                  No site records match your search.
                </div>
              )}
            </section>
          )}
        </div>
      </main>
    </div>
  );
}

export default function App() {
  const [page, setPage] = useState<Page>("update");

  return (
    <div className="flex h-screen min-w-[1024px] flex-col overflow-hidden bg-[#f6f7f9] text-slate-900">
      <header className="relative z-10 flex h-[74px] shrink-0 items-stretch border-b border-slate-200 bg-white px-7 shadow-[0_1px_12px_rgba(15,23,42,0.03)]">
        <div className="flex w-[250px] shrink-0 items-center gap-3">
          <div className="relative flex h-9 w-9 items-center justify-center rounded-[10px] bg-orange-500 shadow-[0_6px_16px_rgba(249,115,22,0.28)]">
            <span className="h-3.5 w-3.5 rounded-full border-[3px] border-white" />
            <span className="absolute -right-0.5 top-1.5 h-2 w-2 rounded-full border-2 border-white bg-orange-500" />
          </div>
          <div>
            <p className="text-[17px] font-bold leading-none tracking-[-0.03em] text-slate-950">
              Orange
            </p>
            <p className="mt-1 text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400">
              Database
            </p>
          </div>
        </div>

        <nav aria-label="Main navigation" className="flex items-stretch gap-1">
          <button
            className={`relative px-5 text-[13px] font-semibold transition ${
              page === "update" ? "text-orange-600" : "text-slate-500 hover:text-slate-900"
            }`}
            onClick={() => setPage("update")}
            type="button"
          >
            Update Data
            {page === "update" && (
              <span className="absolute inset-x-4 bottom-0 h-0.5 bg-orange-500" />
            )}
          </button>
          <button
            className={`relative px-5 text-[13px] font-semibold transition ${
              page === "get" ? "text-orange-600" : "text-slate-500 hover:text-slate-900"
            }`}
            onClick={() => setPage("get")}
            type="button"
          >
            Get Data
            {page === "get" && <span className="absolute inset-x-4 bottom-0 h-0.5 bg-orange-500" />}
          </button>
        </nav>

        <div className="ml-auto flex items-center gap-4">
          <div className="hidden items-center gap-2 text-[11px] font-medium text-slate-400 lg:flex">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Connected
          </div>
          <div className="h-6 w-px bg-slate-200" />
          <button
            aria-label="Notifications"
            className="relative flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
            type="button"
          >
            <Icon>
              <path
                d="M18 9a6 6 0 00-12 0c0 7-3 7-3 8h18c0-1-3-1-3-8zM10 21h4"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.7"
              />
            </Icon>
            <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-orange-500 ring-2 ring-white" />
          </button>
          <button
            className="flex items-center gap-2.5 rounded-lg py-1 pl-1 pr-2 transition hover:bg-slate-50"
            type="button"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-[10px] font-bold text-white">
              OA
            </span>
            <span className="text-left">
              <span className="block text-[11px] font-semibold text-slate-800">Operator</span>
              <span className="block text-[9px] text-slate-400">Administrator</span>
            </span>
          </button>
        </div>
      </header>

      {page === "update" ? <UpdatePage /> : <GetDataPage />}
    </div>
  );
}
