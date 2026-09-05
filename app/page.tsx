"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { useJobs } from "@/lib/jobStore";
import { Person } from "@/lib/types";
import {
  getActiveStockOptions,
  StockOption,
} from "@/lib/stockRepository";

const opposite = (person: Person): Person =>
  person === "Jack" ? "Raag" : "Jack";

export default function NewJobPage() {
  const router = useRouter();
  const { createJob } = useJobs();

  const [title, setTitle] = useState("");
  const [pdf, setPdf] = useState<File | null>(null);
  const [comments, setComments] = useState("");
  const [stock, setStock] = useState("");
  const [stockOptions, setStockOptions] = useState<StockOption[]>([]);
  const [date, setDate] = useState("");

  const [checker, setChecker] = useState<Person>("Jack");
  const [approver, setApprover] = useState<Person>("Raag");

  const [working, setWorking] = useState(false);
  const [error, setError] = useState("");
  const [stockLoading, setStockLoading] = useState(true);

  useEffect(() => {
    const loadStockOptions = async () => {
      try {
        setStockLoading(true);
        setError("");

        const options = await getActiveStockOptions();

        setStockOptions(options);
      } catch (error) {
        console.error("Unable to load stock options:", error);

        setError(
          "Stock options could not be loaded. Please refresh the page and try again."
        );
      } finally {
        setStockLoading(false);
      }
    };

    loadStockOptions();
  }, []);

  const complete = useMemo(() => {
    return Boolean(
      title.trim() &&
        pdf &&
        comments.trim() &&
        stock &&
        date &&
        checker &&
        approver &&
        checker !== approver
    );
  }, [title, pdf, comments, stock, date, checker, approver]);

  const changeChecker = (value: Person) => {
    setChecker(value);
    setApprover(opposite(value));
  };

  const changeApprover = (value: Person) => {
    setApprover(value);
    setChecker(opposite(value));
  };

  const handlePdfChange = (file: File | null) => {
    setError("");

    if (!file) {
      setPdf(null);
      return;
    }

    const isPdf =
      file.type === "application/pdf" ||
      file.name.toLowerCase().endsWith(".pdf");

    if (!isPdf) {
      setPdf(null);
      setError("Please select a PDF file.");
      return;
    }

    setPdf(file);
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();

    setError("");

    if (working) {
      return;
    }

    if (!title.trim()) {
      setError("Job Title is required.");
      return;
    }

    if (!pdf) {
      setError("A PDF drawing is required.");
      return;
    }

    if (!comments.trim()) {
      setError("Comment/Crucial Information is required.");
      return;
    }

    if (!stock) {
      setError("Stock Selection is required.");
      return;
    }

    if (!date) {
      setError("Desired Completion Date is required.");
      return;
    }

    if (!checker || !approver || checker === approver) {
      setError("Checker and Approver must be different.");
      return;
    }

    try {
      setWorking(true);

      /*
       * Temporary Phase 3 behaviour.
       *
       * The PDF itself is not permanently stored yet.
       * Phase 4 will replace this with the storage-provider system.
       */

      await createJob({
        title: title.trim(),
        stock,
        desiredCompletionDate: date,
        checker,
        approver,
        originalComments: comments.trim(),
        pdf: {
          filename: pdf.name,
          file: pdf,
        },
      });

      router.push("/jobs");
    } catch (error) {
      console.error("Failed to create job:", error);

      setError(
        error instanceof Error
          ? error.message
          : "The job could not be created. Please try again."
      );

      setWorking(false);
    }
  };

  return (
    <main>
      <div className="page-heading">
        <div>
          <h1>New Job</h1>
          <p>Create a new drawing submission for checking.</p>
        </div>
      </div>

      <form className="stack" onSubmit={submit}>
        <div className="card stack">
          <div className="field">
            <label>Job Title</label>

            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Injector Plate Rev B"
              disabled={working}
            />
          </div>

          <div className="grid-2">
            <div className="field">
              <label>PDF Upload</label>

              <div className="upload-box">
                <input
                  type="file"
                  accept="application/pdf,.pdf"
                  disabled={working}
                  onChange={(e) =>
                    handlePdfChange(e.target.files?.[0] ?? null)
                  }
                />
              </div>

              {pdf && (
                <div className="help">
                  Selected: {pdf.name}
                </div>
              )}

              <div className="help">
                PDF file storage will be connected to permanent cloud storage
                in Phase 4.
              </div>
            </div>

            <div className="field">
              <label>Comment/Crucial Information</label>

              <textarea
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder="Include anything the checker and approver must know."
                disabled={working}
              />
            </div>
          </div>

          <div className="grid-3">
            <div className="field">
              <label>Stock Selection</label>

              <select
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                disabled={working || stockLoading}
              >
                <option value="">
                  {stockLoading
                    ? "Loading stock options…"
                    : "Select stock…"}
                </option>

                {stockOptions.map((option) => (
                  <option key={option.id} value={option.name}>
                    {option.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="field">
              <label>Desired Completion Date</label>

              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                disabled={working}
              />
            </div>

            <div />

            <div className="field">
              <label>Checker</label>

              <select
                value={checker}
                onChange={(e) =>
                  changeChecker(e.target.value as Person)
                }
                disabled={working}
              >
                <option value="Jack">Jack</option>
                <option value="Raag">Raag</option>
              </select>
            </div>

            <div className="field">
              <label>Approver</label>

              <select
                value={approver}
                onChange={(e) =>
                  changeApprover(e.target.value as Person)
                }
                disabled={working}
              >
                <option value="Jack">Jack</option>
                <option value="Raag">Raag</option>
              </select>
            </div>
          </div>

          <div className="notice">
            Checker and Approver are automatically kept different.
          </div>

          {error && (
            <div className="notice">
              <strong>Error:</strong> {error}
            </div>
          )}

          <div>
            <button
              className="btn btn-primary btn-lg"
              type="submit"
              disabled={
                !complete ||
                working ||
                stockLoading
              }
            >
              {working
                ? "Creating Job…"
                : "Submit for Check"}
            </button>
          </div>
        </div>
      </form>
    </main>
  );
}