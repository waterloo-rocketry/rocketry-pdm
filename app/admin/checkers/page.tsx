"use client";

import { useEffect, useState } from "react";

import {
  AdminGuard,
  useAdminAccess,
} from "@/components/AdminGuard";

import { JobsTable } from "@/components/JobsTable";
import { useJobs } from "@/lib/jobStore";

import {
  getActiveCheckers,
  type Checker,
} from "@/lib/checkerRepository";

export default function CheckerInbox() {
  return (
    <main>
      <AdminGuard>
        <CheckerInboxContent />
      </AdminGuard>
    </main>
  );
}

function CheckerInboxContent() {
  const { jobs, ready } = useJobs();
  const access = useAdminAccess();

  const isCheckerAccount = access?.access === "checker";

  const [checkers, setCheckers] = useState<Checker[]>([]);
  const [actingChecker, setActingChecker] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isCheckerAccount) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function loadCheckers() {
      setLoading(true);
      setError("");

      try {
        const data = await getActiveCheckers();

        if (cancelled) return;

        // Jack and Raag retain their own admin inboxes.
        const sharedCheckers = data.filter(
          (checker) =>
            checker.name !== "Jack" &&
            checker.name !== "Raag"
        );

        setCheckers(sharedCheckers);
      } catch (err) {
        console.error("Failed to load checkers:", err);

        if (!cancelled) {
          setError("Unable to load checker names.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadCheckers();

    return () => {
      cancelled = true;
    };
  }, [isCheckerAccount]);

  if (!isCheckerAccount) {
    return (
      <div className="card">
        This inbox is only available to the shared checker account.
      </div>
    );
  }

  const selectedChecker = checkers.some(
    (checker) => checker.name === actingChecker
  )
    ? actingChecker
    : "";

  const filtered = jobs.filter(
    (job) =>
      job.status === "Awaiting Check" &&
      job.checker === selectedChecker &&
      selectedChecker !== ""
  );

  return (
    <>
      <div className="page-heading">
        <div>
          <h1>Checker Inbox</h1>

          <p>
            Select your name to view drawings assigned
            to you for checking.
          </p>
        </div>
      </div>

      <div className="card stack">
        <div
          className="field"
          style={{ maxWidth: 320 }}
        >
          <label>Acting Checker</label>

          <select
            value={selectedChecker}
            onChange={(e) =>
              setActingChecker(e.target.value)
            }
            disabled={loading}
          >
            <option value="">
              Select your name
            </option>

            {checkers.map((checker) => (
              <option
                key={checker.id}
                value={checker.name}
              >
                {checker.name}
              </option>
            ))}
          </select>
        </div>

        {loading && (
          <p>Loading checker names...</p>
        )}

        {error && (
          <div className="warning">
            {error}
          </div>
        )}

        {!selectedChecker && !loading && (
          <div className="notice">
            Select your name to display your
            assigned jobs.
          </div>
        )}
      </div>

      {selectedChecker && (
        <>
          <div className="card">
            <h2 className="section-title">
              {selectedChecker}'s Assigned Jobs
            </h2>

            <p>
              {filtered.length} job(s) awaiting checking.
            </p>
          </div>

          {!ready ? (
            <div className="card">
              Loading jobs...
            </div>
          ) : (
            <JobsTable
              jobs={filtered}
              admin
            />
          )}
        </>
      )}
    </>
  );
}