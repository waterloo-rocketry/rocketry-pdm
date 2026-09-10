"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { useJobs } from "@/lib/jobStore";
import { Person, StockOrdering } from "@/lib/types";

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
  const [pdfs, setPdfs] = useState<File[]>([]);
  const [comments, setComments] = useState("");
  const [stock, setStock] = useState("");

  const [stockOrdering, setStockOrdering] =
    useState<StockOrdering | "">("");

  const [stockOptions, setStockOptions] = useState<StockOption[]>([]);
  const [date, setDate] = useState("");
  const [checker, setChecker] = useState<Person>("Jack");
  const [approver, setApprover] = useState<Person>("Raag");
  const [working, setWorking] = useState(false);

  useEffect(() => {
    const loadStockOptions = async () => {
      try {
        const options = await getActiveStockOptions();
        setStockOptions(options);
      } catch (error) {
        console.error("Unable to load stock options:", error);
      }
    };

    loadStockOptions();
  }, []);

  const complete = useMemo(
    () =>
      Boolean(
        title.trim() &&
          pdfs.length > 0 &&
          comments.trim() &&
          stock &&
          stockOrdering &&
          date &&
          checker &&
          approver &&
          checker !== approver
      ),
    [
      title,
      pdfs,
      comments,
      stock,
      stockOrdering,
      date,
      checker,
      approver,
    ]
  );

  const changeChecker = (value: Person) => {
    setChecker(value);
    setApprover(opposite(value));
  };

  const changeApprover = (value: Person) => {
    setApprover(value);
    setChecker(opposite(value));
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();

    if (!complete || pdfs.length === 0 || !stockOrdering) return;

    setWorking(true);

    await createJob({
      title: title.trim(),
      stock,
      stockOrdering,
      desiredCompletionDate: date,
      checker,
      approver,
      originalComments: comments.trim(),
      pdfs: pdfs.map((pdf) => ({
        filename: pdf.name,
        file: pdf,
      })),
    });

    router.push("/jobs");
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
            />
          </div>

          <div className="grid-2">
            <div className="field">
              <label>
                PDF Upload (Assemblies must include assembly drawing and all
                part drawings)
              </label>

              <div className="upload-box">
                <input
                  type="file"
                  accept="application/pdf"
                  multiple
                  onChange={(e) =>
                    setPdfs(Array.from(e.target.files ?? []))
                  }
                />
              </div>

              {pdfs.length > 0 && (
                <div className="help">
                  {pdfs.length} PDF{pdfs.length === 1 ? "" : "s"} selected:
                  <ul>
                    {pdfs.map((pdf) => (
                      <li key={`${pdf.name}-${pdf.lastModified}`}>
                        {pdf.name}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="field">
              <label>Comment/Crucial Information</label>

              <textarea
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder="Include anything the checker and approver must know."
              />
            </div>
          </div>

          <div className="grid-3">
            <div className="field">
              <label>Stock Selection</label>

              <select
                value={stock}
                onChange={(e) => setStock(e.target.value)}
              >
                <option value="">Select stock…</option>

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
              />
            </div>

            <div />
          </div>

          <div className="field">
            <div className="stock-ordering-title">
              Stock Ordering
            </div>

            <div className="stock-ordering-options">
              <label className="stock-ordering-option">
                <input
                  type="radio"
                  name="stockOrdering"
                  value="admins_order"
                  checked={stockOrdering === "admins_order"}
                  onChange={() => setStockOrdering("admins_order")}
                />

                Admins will order stock
              </label>

              <label className="stock-ordering-option">
                <input
                  type="radio"
                  name="stockOrdering"
                  value="self_order"
                  checked={stockOrdering === "self_order"}
                  onChange={() => setStockOrdering("self_order")}
                />

                I will order stock myself and inform Jack Crofts or Raag Macwan
              </label>
            </div>
          </div>

          <div className="grid-3">
            <div className="field">
              <label>Checker</label>

              <select
                value={checker}
                onChange={(e) =>
                  changeChecker(e.target.value as Person)
                }
              >
                <option>Jack</option>
                <option>Raag</option>
              </select>
            </div>

            <div className="field">
              <label>Approver</label>

              <select
                value={approver}
                onChange={(e) =>
                  changeApprover(e.target.value as Person)
                }
              >
                <option>Jack</option>
                <option>Raag</option>
              </select>
            </div>
          </div>

          <div className="notice">
            Checker and Approver are automatically kept different.
          </div>

          <div>
            <button
              className="btn btn-primary btn-lg"
              type="submit"
              disabled={!complete || working}
            >
              {working ? "Creating Job…" : "Submit for Check"}
            </button>
          </div>
        </div>
      </form>
    </main>
  );
}