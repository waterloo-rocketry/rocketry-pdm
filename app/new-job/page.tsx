
"use client";

import {
  FormEvent,
  useEffect,
  useMemo,
  useState,
} from "react";

import { useRouter } from "next/navigation";

import { useJobs } from "@/lib/jobStore";

import {
  Person,
  StockOrdering,
} from "@/lib/types";

import {
  getActiveStockOptions,
  StockOption,
} from "@/lib/stockRepository";

import {
  getActiveCheckers,
  Checker,
} from "@/lib/checkerRepository";

const SUBSYSTEMS = [
  "Propulsion",
  "Recovery",
  "Payload",
  "Controls",
  "Airframe",
  "Infrastructure",
  "Electrical",
  "Integration",
];

export default function NewJobPage() {
  const router = useRouter();

  const { createJob } = useJobs();

  const [title, setTitle] = useState("");

  const [slackName, setSlackName] =
    useState("");

  const [contactEmail, setContactEmail] =
    useState("");

  const [subsystem, setSubsystem] =
    useState("");

  const [pdfs, setPdfs] = useState<File[]>([]);

  const [comments, setComments] =
    useState("");

  const [material, setMaterial] =
    useState("");

  const [form, setForm] =
    useState("");

  const [stock, setStock] =
    useState("");

  const [
    stockOrdering,
    setStockOrdering,
  ] = useState<StockOrdering | "">("");

  const [
    stockOptions,
    setStockOptions,
  ] = useState<StockOption[]>([]);

  const [
    checkers,
    setCheckers,
  ] = useState<Checker[]>([]);

  const [date, setDate] =
    useState("");

  const [checker, setChecker] =
    useState("");

  const [
    approver,
    setApprover,
  ] = useState<Person>("Raag");

  const [
    working,
    setWorking,
  ] = useState(false);

  useEffect(() => {
    const loadStockOptions = async () => {
      try {
        const options =
          await getActiveStockOptions();

        setStockOptions(options);
      } catch (error) {
        console.error(
          "Unable to load stock options:",
          error
        );
      }
    };

    const loadCheckers = async () => {
      try {
        const checkerOptions =
          await getActiveCheckers();

        setCheckers(checkerOptions);
      } catch (error) {
        console.error(
          "Unable to load checkers:",
          error
        );
      }
    };

    loadStockOptions();
    loadCheckers();
  }, []);

  const materials = useMemo(() => {
    return Array.from(
      new Set(
        stockOptions
          .map((option) =>
            option.material?.trim()
          )
          .filter(
            (value): value is string =>
              Boolean(value)
          )
      )
    ).sort();
  }, [stockOptions]);

  const forms = useMemo(() => {
    return Array.from(
      new Set(
        stockOptions
          .filter(
            (option) =>
              option.material?.trim() ===
              material
          )
          .map((option) =>
            option.form?.trim()
          )
          .filter(
            (value): value is string =>
              Boolean(value)
          )
      )
    ).sort();
  }, [stockOptions, material]);

  const filteredStockOptions =
    useMemo(() => {
      return stockOptions.filter(
        (option) =>
          option.material?.trim() ===
            material &&
          option.form?.trim() ===
            form
      );
    }, [
      stockOptions,
      material,
      form,
    ]);

  const complete = useMemo(
    () =>
      Boolean(
        title.trim() &&
          slackName.trim() &&
          contactEmail.trim() &&
          /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
            contactEmail.trim()
          ) &&
          subsystem &&
          pdfs.length > 0 &&
          comments.trim() &&
          material &&
          form &&
          stock &&
          stockOrdering &&
          date &&
          checker &&
          approver &&
          checker !== approver
      ),
    [
      title,
      slackName,
      contactEmail,
      subsystem,
      pdfs,
      comments,
      material,
      form,
      stock,
      stockOrdering,
      date,
      checker,
      approver,
    ]
  );

  const changeChecker = (
    value: string
  ) => {
    setChecker(value);

    if (value === "Jack") {
      setApprover("Raag");
    }

    if (value === "Raag") {
      setApprover("Jack");
    }
  };

  const changeApprover = (
    value: Person
  ) => {
    setApprover(value);

    if (checker === value) {
      setChecker("");
    }
  };

  const submit = async (
    e: FormEvent
  ) => {
    e.preventDefault();

    if (
      !complete ||
      pdfs.length === 0 ||
      !stockOrdering
    ) {
      return;
    }

    setWorking(true);

    try {
      await createJob({
        title: title.trim(),

        slackName: slackName.trim(),

        contactEmail:
          contactEmail.trim(),

        subsystem,

        stock,
        stockOrdering,

        desiredCompletionDate:
          date,

        checker,
        approver,

        originalComments:
          comments.trim(),

        pdfs: pdfs.map((pdf) => ({
          filename: pdf.name,
          file: pdf,
        })),
      });

      router.push("/jobs");
    } catch (error) {
      console.error(
        "Failed to create job:",
        error
      );

      alert(
        "Failed to create job. Check the console for details."
      );

      setWorking(false);
    }
  };

  return (
    <main>
      <div className="page-heading">
        <div>
          <h1>New Job</h1>

          <p>
            Create a new drawing
            submission for checking.
          </p>
        </div>
      </div>

      <form
        className="stack"
        onSubmit={submit}
      >

        {/* CONTACT INFORMATION */}

        <div className="card stack">
          <h2>Contact Information</h2>

          <div className="grid-2">
            <div className="field">
              <label>
                Slack Name
              </label>

              <input
                type="text"
                value={slackName}
                onChange={(e) =>
                  setSlackName(
                    e.target.value
                  )
                }
                placeholder="Enter Slack name"
                required
              />
            </div>

            <div className="field">
              <label>
                Email Address
              </label>

              <input
                type="email"
                value={contactEmail}
                onChange={(e) =>
                  setContactEmail(
                    e.target.value
                  )
                }
                placeholder="Enter email address"
                required
              />
            </div>
          </div>
        </div>

        {/* JOB INFORMATION */}

        <div className="card stack">
          <h2>Job Information</h2>

          <div className="field">
            <label>
              Job Title
            </label>

            <input
              value={title}
              onChange={(e) =>
                setTitle(
                  e.target.value
                )
              }
              placeholder="e.g. Injector Plate Rev B"
            />
          </div>

          {/* SUBSYSTEM */}

          <div className="field">
            <label>
              Subsystem
            </label>

            <select
              value={subsystem}
              onChange={(e) =>
                setSubsystem(
                  e.target.value
                )
              }
              required
            >
              <option value="">
                Select subsystem…
              </option>

              {SUBSYSTEMS.map(
                (option) => (
                  <option
                    key={option}
                    value={option}
                  >
                    {option}
                  </option>
                )
              )}
            </select>
          </div>

          {/* PDF UPLOAD AND COMMENTS */}

          <div className="grid-2">
            <div className="field">
              <label>
                PDF Upload
                (Assemblies must
                include assembly
                drawing and all part
                drawings)
              </label>

              <div className="upload-box">
                <input
                  type="file"
                  accept="application/pdf"
                  multiple
                  onChange={(e) =>
                    setPdfs(
                      Array.from(
                        e.target
                          .files ??
                          []
                      )
                    )
                  }
                />
              </div>

              {pdfs.length > 0 && (
                <div className="help">
                  {pdfs.length} PDF
                  {pdfs.length === 1
                    ? ""
                    : "s"}{" "}
                  selected:

                  <ul>
                    {pdfs.map(
                      (pdf) => (
                        <li
                          key={`${pdf.name}-${pdf.lastModified}`}
                        >
                          {
                            pdf.name
                          }
                        </li>
                      )
                    )}
                  </ul>
                </div>
              )}
            </div>

            <div className="field">
              <label>
                Comment/Crucial
                Information
              </label>

              <textarea
                value={comments}
                onChange={(e) =>
                  setComments(
                    e.target.value
                  )
                }
                placeholder={"Additional comments\nRequested Machinist\nSpecified stock (if not part of dropdown)"}
              />
            </div>
          </div>

          {/* STOCK SELECTION */}

          <div className="grid-3">
            <div className="field">
              <label>
                Material
              </label>

              <select
                value={material}
                onChange={(e) => {
                  setMaterial(
                    e.target.value
                  );

                  setForm("");
                  setStock("");
                }}
              >
                <option value="">
                  Select material…
                </option>

                {materials.map(
                  (
                    materialOption
                  ) => (
                    <option
                      key={
                        materialOption
                      }
                      value={
                        materialOption
                      }
                    >
                      {
                        materialOption
                      }
                    </option>
                  )
                )}
              </select>
            </div>

            <div className="field">
              <label>
                Form
              </label>

              <select
                value={form}
                disabled={!material}
                onChange={(e) => {
                  setForm(
                    e.target.value
                  );

                  setStock("");
                }}
              >
                <option value="">
                  Select form…
                </option>

                {forms.map(
                  (
                    formOption
                  ) => (
                    <option
                      key={
                        formOption
                      }
                      value={
                        formOption
                      }
                    >
                      {
                        formOption
                      }
                    </option>
                  )
                )}
              </select>
            </div>

            <div className="field">
              <label>
                Stock Size
              </label>

              <select
                value={stock}
                disabled={
                  !material ||
                  !form
                }
                onChange={(e) =>
                  setStock(
                    e.target.value
                  )
                }
              >
                <option value="">
                  Select stock…
                </option>

                {filteredStockOptions.map(
                  (option) => (
                    <option
                      key={
                        option.id
                      }
                      value={
                        option.name
                      }
                    >
                      {
                        option.name
                      }
                    </option>
                  )
                )}
              </select>
            </div>
          </div>

          {/* COMPLETION DATE */}

          <div className="grid-3">
            <div className="field">
              <label>
                Desired Completion
                Date
              </label>

              <input
                type="date"
                value={date}
                onChange={(e) =>
                  setDate(
                    e.target.value
                  )
                }
              />
            </div>

            <div />
            <div />
          </div>

          {/* STOCK ORDERING */}

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
                  checked={
                    stockOrdering ===
                    "admins_order"
                  }
                  onChange={() =>
                    setStockOrdering(
                      "admins_order"
                    )
                  }
                />

                Admins will order stock
              </label>

              <label className="stock-ordering-option">
                <input
                  type="radio"
                  name="stockOrdering"
                  value="self_order"
                  checked={
                    stockOrdering ===
                    "self_order"
                  }
                  onChange={() =>
                    setStockOrdering(
                      "self_order"
                    )
                  }
                />

                I will order stock
                myself and inform Jack
                Crofts or Raag Macwan
              </label>
            </div>
          </div>

          {/* CHECKER AND APPROVER */}

          <div className="grid-3">
            <div className="field">
              <label>
                Checker
              </label>

              <select
                value={checker}
                onChange={(e) =>
                  changeChecker(
                    e.target.value
                  )
                }
              >
                <option value="">
                  Select checker…
                </option>

                {checkers.map(
                  (
                    checkerOption
                  ) => (
                    <option
                      key={
                        checkerOption.id
                      }
                      value={
                        checkerOption.name
                      }
                    >
                      {
                        checkerOption.name
                      }
                    </option>
                  )
                )}
              </select>
            </div>

            <div className="field">
              <label>
                Approver
              </label>

              <select
                value={approver}
                onChange={(e) =>
                  changeApprover(
                    e.target
                      .value as Person
                  )
                }
              >
                <option>
                  Jack
                </option>

                <option>
                  Raag
                </option>
              </select>
            </div>
          </div>

          <div className="notice">
            Checker and Approver
            must be different.
          </div>

          {/* SUBMIT */}

          <div>
            <button
              className="btn btn-primary btn-lg"
              type="submit"
              disabled={
                !complete ||
                working
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